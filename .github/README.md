# Project S 자동 검증

<a href="README.md"><kbd>한국어</kbd></a> · <a href="README.en.md"><kbd>English</kbd></a>

## 언제 실행되나요?

[`workflows/ci.yml`](workflows/ci.yml)은 `main` 브랜치 푸시, Pull Request, 수동 실행 시 동작합니다.
프론트엔드와 백엔드 검사는 서로 독립적으로 실행됩니다.
이 구성은 **테스트와 빌드 검증용**이며, 서버에 자동 배포하지 않습니다.

## 무엇을 검사하나요?

| 검사 | 실행 환경 | 내용 |
| --- | --- | --- |
| 프론트엔드 테스트 및 빌드 | Node.js 22 | 잠금 파일 기준 설치, 단위 테스트 8개, 일반 프로덕션 빌드, TypeScript 타입 검사, 데스크톱·모바일 Chromium 데모 테스트 16개 |
| 백엔드 테스트 및 빌드 | Java 17 / Gradle Wrapper | H2 테스트 프로필의 단위·통합 테스트와 실행 JAR 빌드 |

브라우저 테스트는 `127.0.0.1:3100`에 별도의 데모 서버를 시작합니다.
백엔드 테스트는 `backend/src/test/resources/application.properties`의 메모리 H2 DB를 사용합니다.
실제 PostgreSQL, 운영 계정, DB 비밀번호, `.env` 파일, GitHub Secrets는 필요하지 않습니다.
실제 PostgreSQL 연동과 운영 배포 검증은 별도로 수행해야 합니다.

문서용 화면 캡처 명령 `npm run screenshots`는 CI와 별도로 실행합니다.

## 결과는 어떻게 확인하나요?

1. 워크플로와 프론트 테스트·설정·의존성 잠금 파일·세션 수정 코드를 함께 커밋하고 푸시합니다.
2. GitHub 저장소의 **Actions** 탭에서 **Project S 자동 검증**을 선택합니다.
3. **프론트엔드 테스트 및 빌드**, **백엔드 테스트 및 빌드** 결과를 확인합니다. 검사 명령이 실패하면 해당 작업도 실패합니다.
4. 해당 실행의 **Artifacts**에서 `frontend-playwright-report` 또는 `backend-test-reports`를 다운로드합니다.
5. 프론트 보고서의 압축을 풀고 `frontend`에서 아래 명령으로 엽니다.

```powershell
npx playwright show-report <압축을-푼-보고서-폴더>
```

수동 실행은 **Actions → Project S 자동 검증 → Run workflow**에서 가능합니다.
상단 언어 버튼은 이 설명 문서만 전환합니다. GitHub 자체의 메뉴·버튼·도구 출력 언어를 바꾸는 기능은 아닙니다.
작업명 변경은 워크플로를 푸시한 뒤 새로 실행되는 검사부터 반영됩니다. 이전 실행 이름은 그대로 남습니다.

## 보고서와 개인정보 보호

- 보고서는 7일간 보관하며, 취소되지 않은 작업의 실패 보고서도 업로드합니다.
- 지정된 보고서 폴더만 업로드하고 `.env`, DB 백업, 프로젝트 전체 파일, 애플리케이션 패키지는 업로드하지 않습니다.
- 브라우저 trace·스크린샷은 예시 계정의 데모 세션으로 만들며 실제 회원 세션을 사용하지 않습니다.
- 저장소 권한은 읽기 전용이고, 체크아웃 인증 정보를 유지하지 않으며, Actions 버전은 검증한 커밋 SHA로 고정합니다.

CI가 있다고 해서 자동으로 병합이 차단되지는 않습니다. 필수 검사는 저장소 규칙·브랜치 보호에서 별도로 지정해야 합니다.
이미 이전 영어 작업명을 필수 검사로 지정했다면, 이번 작업명 변경에 맞춰 그 설정도 별도로 갱신해야 합니다.
이번 구성에는 자동 배포와 저장소 쓰기 권한을 추가하지 않았습니다.

## 로컬에서 같은 검사 실행하기

`frontend`에서 실행합니다.

```powershell
npm ci
npm run test:unit
npm run build
npx tsc --noEmit
npx playwright install chromium
npm run test:e2e
```

Windows에서는 `backend`에서 실행합니다.

```powershell
.\gradlew.bat --no-daemon build
```

GitHub의 Linux 실행 환경에서는 `./gradlew --no-daemon build`를 사용합니다.
검사 범위와 한계는 [프론트 테스트 안내](../frontend/tests/README.md)에서 확인할 수 있습니다.

## 참고 문서

- [GitHub의 Gradle CI 안내](https://docs.github.com/en/actions/tutorials/build-and-test-code/java-with-gradle)
- [GitHub의 Node.js CI 안내](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
- [Playwright CI 안내](https://playwright.dev/docs/ci-intro)
