# Project S CI

<a href="README.md"><kbd>한국어</kbd></a> · <a href="README.en.md"><kbd>English</kbd></a>

`workflows/ci.yml` runs on pushes to `main`, pull requests, and manual **Run workflow** requests.
The `frontend` and `backend` jobs run independently. This workflow validates code; it does not deploy it.

## Checks

| Job | Runtime | Checks |
| --- | --- | --- |
| 프론트엔드 테스트 및 빌드 (Frontend tests and build) | Node.js 22 | Locked npm install, unit tests, normal production build, TypeScript, 16 Chromium desktop/mobile demo tests |
| 백엔드 테스트 및 빌드 (Backend tests and build) | Java 17 / Gradle Wrapper | H2 test-profile tests and executable JAR build |

The browser suite starts its own demo server on `127.0.0.1:3100`. It never uses the real PostgreSQL database.
Backend tests create an in-memory H2 database using `backend/src/test/resources/application.properties`.
No GitHub secrets, `.env` files, DB passwords, or live user accounts are required.
Real PostgreSQL and production deployment verification remain separate checks.
The portfolio screenshot command, `npm run screenshots`, is run separately from CI.

## Read the result

1. Commit and push the workflow together with the frontend E2E configuration, tests, dependency lockfile, and session fix.
2. Open the repository's **Actions** tab and select **Project S 자동 검증** (Project S automated checks).
3. Inspect **프론트엔드 테스트 및 빌드** (frontend) and **백엔드 테스트 및 빌드** (backend). A failed command makes its job fail.
4. Open **Artifacts** on that run to download `frontend-playwright-report` or `backend-test-reports`.
5. Extract the frontend report and run `npx playwright show-report <extracted-report-directory>` from `frontend` to view it.

Reports are retained for seven days, including failure reports when the job was not cancelled.
Only the named report directories are uploaded, not workspace files, `.env`, database backups, or application packages.
Browser traces and screenshots are from synthetic demo sessions, not real member sessions.
The workflow has read-only repository permissions, does not persist checkout credentials, and pins Actions to verified commit SHAs.

CI does not automatically prevent merging. Making both job checks required needs a separate repository ruleset/branch-protection change.
Do not enable deployment or repository write permissions as part of this test-only workflow.

The language links above switch documentation pages; they do not change GitHub's own UI language.
Workflow and step display names are Korean. Built-in GitHub controls and tool logs may still appear in English.
Name changes take effect on new runs after pushing the workflow; past runs retain their recorded names.
If repository rules require the previous check names, update those required checks separately when renaming jobs.

## Local equivalents

In `frontend`:

```powershell
npm ci
npm run test:unit
npm run build
npx tsc --noEmit
npx playwright install chromium
npm run test:e2e
```

In `backend` on Windows:

```powershell
.\gradlew.bat --no-daemon build
```

On the Linux runner the equivalent is `./gradlew --no-daemon build`.
See [frontend test instructions](../frontend/tests/README.md) for coverage and limits.

References: [GitHub Gradle CI](https://docs.github.com/en/actions/tutorials/build-and-test-code/java-with-gradle),
[GitHub Node.js CI](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs),
[Playwright CI](https://playwright.dev/docs/ci-intro).
