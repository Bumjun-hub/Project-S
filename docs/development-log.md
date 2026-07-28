# Development Log

[← README](../README.md) · [Architecture](architecture.md) · [배포](deployment.md) · [트러블슈팅](troubleshooting.md) · [로드맵](roadmap.md)

이 개발 일지는 Git 커밋 이력과 현재 구현 코드를 기준으로 작성했습니다. 날짜는 저장소의 커밋 날짜를 사용했습니다.

## Frontend

### 2026-05-02 ~ 2026-05-13 — 초기 UI와 추천 흐름 설계

- Project S 초기 Frontend 구성
- 랜딩과 주요 서비스 화면의 UI/UX 개선
- 체형 기반 추천 흐름과 입력 화면 확장
- 상·하의 기준 실측을 다루는 사용자 경험 구성

초기 단계에서는 사용자가 `Body Profile → My Fit → 상품 → 추천 결과` 흐름을 이해하고 입력을 완료할 수 있도록 화면 구조를 먼저 구체화했습니다.

### 2026-07-22 — 회원 흐름과 랜딩 경험

- 회원가입 화면과 로그인 진입 흐름 구성
- Interactive Landing Page Section 추가
- Next.js App Router 기반 페이지와 공통 레이아웃 정리

### 2026-07-23 — Backend API 연동

- 회원가입 API 연동
- JWT 로그인과 인증 상태 표시
- Body Profile 등록·조회·수정 연동
- My Fit 등록·조회·수정 연동
- 공통 API Client에서 Bearer Token과 오류 응답 처리

Frontend 기능을 Backend 도메인과 같은 경계로 나누어 API, 타입, 매핑, 상태와 화면을 함께 관리했습니다.

### 2026-07-27 — 상품과 추천 완성

- TanStack Query 기반 상품 목록·상세 API 연동
- 상품 사이즈별 실측 표시
- 추천 실행, 결과 화면과 부위별 비교 표시
- Zustand Persist 기반 추천 History 저장

추천 이력은 현재 서버 DB가 아니라 Local Storage에 저장됩니다. 서버 이력 기능은 [Roadmap](roadmap.md)에 포함했습니다.

### 2026-07-28 — 운영 API 경로 조정

- API 기본 주소를 `http://localhost:8080`에서 동일 출처 경로로 변경
- Apache가 `/api` 요청을 Spring Boot에 전달할 수 있는 Frontend 호출 방식 준비

> 이 변경은 현재 작업 트리에 있으며 아직 커밋되지 않은 상태입니다.

## Backend

### 2026-07-20 — Spring Boot 기반 구성

- Spring Boot Backend 초기화
- `/api/v1/health` Health Check API 구현
- `ApiResponse<T>` 공통 응답 적용
- Global Exception Handler와 표준 오류 응답 구성

### 2026-07-21 — Web과 Database 기반 구성

- Next.js 개발 서버 접근을 위한 CORS 설정
- PostgreSQL과 Spring Data JPA 설정
- 테스트 환경에 H2 PostgreSQL 호환 모드 구성

### 2026-07-23 — 회원·인증·사용자 기준 정보

- 회원가입 API와 Password Encoding
- Spring Security와 JWT 로그인·인증 Filter
- BodyProfile 도메인과 API
- MyFit, Entry, Measurement 계층과 API
- MyFit 수정 시 기존 Entity를 재사용하는 Update 전략 적용

### 2026-07-27 — 상품과 추천 엔진

- Product, ProductSize, ProductMeasurement 도메인 구현
- 초기 상품 Seed Data와 목록·상세 API 구현
- Recommendation Service와 독립 Calculator 구현
- 착용감 보정, 부위별 가중치, Size Score, Match Score 계산
- Calculator 단위 테스트 및 주요 도메인 API 통합 테스트 구성

계산 로직은 JPA와 JWT에 의존하지 않게 분리해 추천 규칙 변경과 테스트가 다른 계층에 영향을 적게 주도록 했습니다.

## Deployment

### 2026-07-28 — Ubuntu Server 수동 배포

- VirtualBox 기반 Ubuntu Server에 Frontend와 Backend 배포
- Java로 Spring Boot 실행
- Node.js로 Next.js 빌드·실행
- PostgreSQL 연결
- Apache Reverse Proxy와 systemd 사용
- Docker는 아직 적용하지 않음

저장소에는 서버 설정 파일과 명령 기록이 없어 세부 과정은 [Deployment 문서](deployment.md)에 확인 가능한 내용과 TODO를 구분해 정리했습니다. 다음 배포 때 배포 커밋, 실제 unit·VirtualHost 예시, 검증 로그를 함께 남기면 재현성과 포트폴리오 신뢰도를 높일 수 있습니다.
