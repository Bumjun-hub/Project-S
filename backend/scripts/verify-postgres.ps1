param(
    [string]$BaseUrl = 'http://localhost:8080',
    [string]$PostgresBin = 'C:\Program Files\PostgreSQL\18\bin'
)

$ErrorActionPreference = 'Stop'
if ($BaseUrl -notmatch '^http://(localhost|127\.0\.0\.1):\d+$') {
    throw 'This test is restricted to a local API and the local project_s database.'
}
$psql = Join-Path $PostgresBin 'psql.exe'
$testMembers = [System.Collections.Generic.List[object]]::new()
$runKey = [Guid]::NewGuid().ToString('N')
$testPassword = 'QaOnly-' + [Guid]::NewGuid().ToString('N') + '!'

function Assert-Check([bool]$Condition, [string]$Label) {
    if (-not $Condition) { throw "FAIL: $Label" }
    Write-Output "PASS: $Label"
}

function Invoke-Sql([string]$Sql) {
    $output = & $psql -X -w -h localhost -p 5432 -U postgres -d project_s -v ON_ERROR_STOP=1 -t -A -c $Sql
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL verification failed.' }
    return ($output -join "`n").Trim()
}

function Get-Fingerprint {
    return Invoke-Sql "select json_build_object('members',(select count(*) from members),'histories',(select count(*) from recommendation_histories),'memberHash',(select md5(coalesce(string_agg(m::text,'|' order by id),'')) from members m),'historyHash',(select md5(coalesce(string_agg(h::text,'|' order by id),'')) from recommendation_histories h));"
}

function Invoke-Api([string]$Path, [string]$Method = 'GET', $Body = $null, $Headers = @{}, [int]$Expected = 200) {
    $options = @{ Uri = "$BaseUrl$Path"; Method = $Method; Headers = $Headers; TimeoutSec = 20; SkipHttpErrorCheck = $true }
    if ($null -ne $Body) {
        $options.ContentType = 'application/json; charset=utf-8'
        $options.Body = [Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 20 -Compress))
    }
    $response = Invoke-WebRequest @options
    if ([int]$response.StatusCode -ne $Expected) {
        throw "Unexpected HTTP $($response.StatusCode) for $Method $Path (expected $Expected)."
    }
    return $response.Content | ConvertFrom-Json
}

function New-TestMember([string]$Suffix) {
    $email = "qa-$runKey-$Suffix@example.invalid"
    $signup = Invoke-Api '/api/v1/members' 'POST' @{ email=$email; password=$testPassword; nickname='Postgres QA' }
    if ($signup.data.memberId -le 0 -or $signup.data.email -ne $email) { throw 'Invalid test member identity.' }
    $member = @{ id=[long]$signup.data.memberId; email=$email }
    $testMembers.Add($member)
    $login = Invoke-Api '/api/v1/auth/login' 'POST' @{ email=$email; password=$testPassword }
    if (-not $login.data.accessToken) { throw 'Login did not return an access token.' }
    $member.headers = @{ Authorization='Bearer ' + $login.data.accessToken }
    return $member
}

$before = Get-Fingerprint
try {
    $products = Invoke-Api '/api/v1/products/page?size=2'
    Assert-Check ($products.success -and $products.data.content.Count -eq 2) 'public product pagination on PostgreSQL'
    $owner = New-TestMember 'owner'
    Assert-Check ($owner.id -gt 0) 'real signup and JWT login'
    $null = Invoke-Api '/api/v1/auth/login' 'POST' @{email=$owner.email;password='WrongQaPassword!'} @{} 401
    $null = Invoke-Api '/api/v1/body-profiles' 'POST' @{height=175.0;weight=68.0;gender='MALE';bodyFeatures=@('BROAD_SHOULDERS')} $owner.headers 201
    $fit = @{entries=@(@{category='TOP';garmentLabel='PostgreSQL QA reference';measurements=@(
        @{area='CHEST_WIDTH';sizeCm=50.0;feeling='EXACT'},
        @{area='TOTAL_LENGTH';sizeCm=72.0;feeling='EXACT'}
    )})}
    $null = Invoke-Api '/api/v1/my-fits' 'POST' $fit $owner.headers 201
    Assert-Check $true 'profile and reference measurements stored'

    $recommendHeaders = @{Authorization=$owner.headers.Authorization;'Idempotency-Key'=$runKey}
    $created = (Invoke-Api '/api/v1/recommendations' 'POST' @{productCode='p-oxford-01'} $recommendHeaders).data
    $historyId = [long]$created.historyId
    Assert-Check ($historyId -gt 0 -and $created.createdAt -and $created.comparisons.Count -eq 2) 'recommendation returns saved ID, time and comparisons'
    $persisted = Invoke-Sql "select count(*) from recommendation_histories where id=$historyId and member_id=$($owner.id) and comparisons is not null and calculator_version='measurements-v1' and product_name_snapshot is not null;"
    Assert-Check ($persisted -eq '1') 'snapshot physically persisted in PostgreSQL'

    $replayed = (Invoke-Api '/api/v1/recommendations' 'POST' @{productCode='p-oxford-01'} $recommendHeaders).data
    Assert-Check (($created | ConvertTo-Json -Depth 20 -Compress) -eq ($replayed | ConvertTo-Json -Depth 20 -Compress)) 'retry returns identical result without duplicate history'
    $updated = (Invoke-Api "/api/v1/recommendations/history/$historyId/feedback" 'PATCH' @{feedback='GOOD'} $owner.headers).data
    Assert-Check ($updated.id -eq $historyId -and $updated.feedback -eq 'GOOD') 'feedback updates the same saved history'

    $fit.entries[0].measurements[0].sizeCm = 61.0
    $fit.entries[0].measurements[1].sizeCm = 80.0
    $null = Invoke-Api '/api/v1/my-fits/me' 'PATCH' $fit $owner.headers
    $history = (Invoke-Api '/api/v1/recommendations/history/page?size=1' 'GET' $null $owner.headers).data
    $record = $history.content[0]
    Assert-Check ($history.totalElements -eq 1 -and $record.id -eq $historyId -and $record.feedback -eq 'GOOD') 'history pagination returns only this member and saved feedback'
    Assert-Check (($record.comparisons | ConvertTo-Json -Depth 20 -Compress) -eq ($created.comparisons | ConvertTo-Json -Depth 20 -Compress)) 'old comparison snapshot is unchanged after reference edits'

    $other = New-TestMember 'other'
    $otherHistory = (Invoke-Api '/api/v1/recommendations/history/page' 'GET' $null $other.headers).data
    Assert-Check ($otherHistory.totalElements -eq 0) 'other member cannot see the owners history'
    $null = Invoke-Api "/api/v1/recommendations/history/$historyId/feedback" 'PATCH' @{feedback='LARGE'} $other.headers 404
    $null = Invoke-Api '/api/v1/recommendations/history/page' 'GET' $null @{} 401
    Assert-Check $true 'cross-member feedback and anonymous history access rejected'
    $null = Invoke-Api "/api/v1/recommendations/history/$historyId/feedback" 'PATCH' @{feedback='INVALID'} $owner.headers 400
    $null = Invoke-Api '/api/v1/recommendations/history/rec-invalid/feedback' 'PATCH' @{feedback='GOOD'} $owner.headers 400
    Assert-Check $true 'invalid enum and history ID return 400'
    $storedCount = Invoke-Sql "select count(*) from recommendation_histories where member_id=$($owner.id);"
    Assert-Check ($storedCount -eq '1') 'one analysis stored despite retry'
} finally {
    if ($testMembers.Count -gt 0) {
        $ids = ($testMembers | ForEach-Object { [long]$_.id }) -join ','
        $identityPredicate = ($testMembers | ForEach-Object { "(id=$($_.id) and email='$($_.email)')" }) -join ' or '
        $confirmed = Invoke-Sql "select count(*) from members where $identityPredicate;"
        if ([int]$confirmed -ne $testMembers.Count) { throw 'Cleanup identity check failed; no deletion attempted.' }
        # Only IDs created by this invocation, rechecked against their unique QA emails.
        $null = Invoke-Sql @"
BEGIN;
DELETE FROM recommendation_histories WHERE member_id IN ($ids);
DELETE FROM my_fit_measurements WHERE entry_id IN (SELECT id FROM my_fit_entries WHERE my_fit_id IN (SELECT id FROM my_fits WHERE member_id IN ($ids)));
DELETE FROM my_fit_entries WHERE my_fit_id IN (SELECT id FROM my_fits WHERE member_id IN ($ids));
DELETE FROM my_fits WHERE member_id IN ($ids);
DELETE FROM body_profile_features WHERE body_profile_id IN (SELECT id FROM body_profiles WHERE member_id IN ($ids));
DELETE FROM body_profiles WHERE member_id IN ($ids);
DELETE FROM members WHERE $identityPredicate;
COMMIT;
"@
        Assert-Check $true 'only generated QA accounts and their records removed'
    }
    $after = Get-Fingerprint
    Assert-Check ($before -eq $after) 'existing member and recommendation rows preserved exactly'
}
