# DB / 실행 환경

## 개발

기본 프로필은 `dev`입니다. `DB_PASSWORD` 등은 환경 변수로만 전달하세요.
개발 환경만 Hibernate `update`와 예시 상품 생성을 허용합니다.
SQL 로그는 기본 꺼져 있으며 필요할 때만 `SHOW_SQL=true`로 켤 수 있습니다.

## 운영

`SPRING_PROFILES_ACTIVE=prod`와 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`,
`JWT_SECRET`, `CORS_ALLOWED_ORIGINS`를 모두 설정해야 합니다.
JWT 키는 최소 32바이트 이상의 충분히 무작위인 비밀값이어야 합니다.
CORS 값은 쉼표로 구분한 프론트엔드 origin입니다.
운영에서는 자동 테이블 변경 및 예시 상품 생성을 하지 않습니다.

## 기존 DB 마이그레이션

이 SQL은 이미 존재하는 `recommendation_histories` 테이블에 대한 증분 변경입니다.
초기 전체 스키마를 생성하는 스크립트는 아니므로 빈 운영 DB에 바로 실행할 수 없습니다.
개발 DB를 백업/복원한 스테이징에서 먼저 검증한 뒤 운영에 적용하세요.

1. DB를 백업하고 애플리케이션을 중지합니다.
2. PostgreSQL에 연결할 환경 변수를 설정합니다. 비밀번호를 명령 인수나 Git에 넣지 마세요.
3. backend 디렉터리에서 실행합니다.

```powershell
psql -h localhost -U postgres -d project_s -v ON_ERROR_STOP=1 -f db/migrations/V20261001_01__recommendation_snapshots.sql
```

4. `schema_migrations`의 버전을 확인한 후 `prod`로 시작합니다.

트랜잭션으로 실행되며 실패 시 변경과 버전 기록이 함께 롤백됩니다.
같은 파일을 재실행할 수 있도록 기존 컬럼/인덱스는 보존합니다.
현재는 명시적으로 적용하는 SQL 방식이며 자동 마이그레이션 도구는 도입하지 않았습니다.
이전 기록의 비교값은 복원할 수 없어 빈 배열로 표시합니다. 신규 분석부터 스냅샷을 저장합니다.

## 실제 PostgreSQL 검증

2026-10-01에 로컬 PostgreSQL 18의 `project_s` DB를 백업한 뒤 위 마이그레이션을 적용했습니다.
백업은 `db/backups/`에 있으며 해당 폴더의 데이터 파일은 Git에서 제외됩니다.
기존 회원과 추천 기록은 삭제하거나 수정하지 않았고, 기존 필드 내용의 해시도 변경 전후 일치했습니다.
운영 프로필의 Hibernate `validate`로 시작하여 실제 스키마 검증을 통과했습니다.

다음 스크립트로 실제 DB 연동을 다시 확인할 수 있습니다. 백엔드를 먼저 실행해야 합니다.

```powershell
.\scripts\verify-postgres.ps1
```

로컬 API와 `localhost:5432/project_s` DB만 대상으로 실행합니다.
고유한 테스트 회원 2명을 만들고 로그인, 추천/피드백 저장, 이력 조회, 요청 재사용,
실측 스냅샷 보존, 회원 간 접근 차단과 잘못된 입력을 확인합니다.
마지막에는 이번 실행에서 생성한 ID와 이메일을 재확인한 뒤 그 테스트 데이터만 제거하고,
기존 회원/이력의 개수와 내용 해시가 그대로인지 검사합니다.
환경에 따라 PostgreSQL 설치 경로를 `-PostgresBin`으로 지정할 수 있습니다.

검증 당시 로컬 DB의 loopback 인증 방식은 기존 `trust` 설정이었으며 변경하지 않았습니다.
이는 운영용 인증 구성을 검증한 것이 아닙니다. 운영 배포에는 비밀번호 인증과 DB 접근 제한을 별도로 설정해야 합니다.

## GitHub Actions 테스트

루트의 `.github/workflows/ci.yml`은 Java 17과 Gradle Wrapper로 `./gradlew --no-daemon build`를 실행합니다.
테스트는 `src/test/resources/application.properties`의 H2 임시 DB와 `test` 프로필을 사용합니다.
실제 PostgreSQL 서버, 운영 비밀번호, GitHub Secrets는 필요하지 않습니다.
테스트 및 실행 JAR 빌드를 검사하며 배포하거나 운영 DB 마이그레이션을 실행하지 않습니다.
백엔드 테스트 보고서는 `backend-test-reports` artifact로 7일간 보관합니다.
실제 DB 검증은 위 PostgreSQL 검증 절차로 별도 수행합니다.

## API 변경

- 추천 POST의 `data.historyId`, `data.createdAt`은 서버에서 저장한 이력 값입니다.
- 선택적 `Idempotency-Key`(영문/숫자/하이픈, 1~64자)를 같은 사용자와 요청에 재사용하면 중복 저장하지 않습니다. 새 분석에는 새 키를 사용하세요.
- `GET /api/v1/products/page?page=0&size=12&category=all&search=`
- `GET /api/v1/recommendations/history/page?page=0&size=12` (로그인 필수)
- 페이지 응답은 `content`, `page`, `size`, `totalElements`, `totalPages`입니다.
- 기존 배열 조회 API는 호환성을 유지하지만 최대 100건만 반환합니다.
- 실제 추천 계산은 MyFit 실측/착용감과 상품 실측을 사용합니다. 체형 태그와 피드백은 아직 학습/계산에 반영하지 않습니다.
