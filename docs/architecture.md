# Architecture

[← README](../README.md) · [배포](deployment.md) · [트러블슈팅](troubleshooting.md) · [개발 일지](development-log.md) · [로드맵](roadmap.md)

## 전체 시스템 구조

Project S는 브라우저, Next.js 프론트엔드, Spring Boot API, PostgreSQL을 분리한 풀스택 구조입니다. 운영 환경에서는 Apache가 외부 요청을 받아 프론트엔드와 API로 전달하는 Reverse Proxy 역할을 담당합니다.

```text
Browser
   │ HTTP
   ▼
Apache Reverse Proxy (Ubuntu Server)
   ├── /       ──▶ Next.js :3000
   └── /api/*  ──▶ Spring Boot :8080
                         │
                         ▼
                    PostgreSQL :5432
```

> Apache 경로·포트 매핑은 현재 코드의 기본 포트와 동일 출처 API 구성을 바탕으로 나타낸 목표 구조입니다. 실제 VirtualHost 설정은 저장소에 없으므로 [배포 문서의 TODO](deployment.md#저장소에서-추가로-확인할-항목)를 확인해야 합니다.

## Frontend

Next.js App Router를 사용하며 기능 단위로 UI, API, 타입, 상태를 묶었습니다.

- `app`: URL 라우트와 페이지 진입점
- `features`: auth, profile, my-fit, product, recommend, history 등 기능 단위 코드
- `components`: 여러 기능에서 재사용하는 UI와 레이아웃
- `lib`: JWT를 포함한 공통 API Client, Query Client, 저장소 유틸리티
- `stores`: 여러 단계의 입력 흐름에서 공유하는 Zustand 상태

API Client는 `NEXT_PUBLIC_API_BASE_URL`이 있으면 해당 주소를 사용하고, 없으면 `/api/v1/...` 형태의 동일 출처 요청을 보냅니다. JWT와 추천 이력 등 일부 클라이언트 상태는 Local Storage에 저장됩니다.

## Backend

Spring Boot 백엔드는 도메인별 패키지와 계층형 흐름을 함께 사용합니다.

```text
HTTP Request
    │
    ▼
Controller ── 요청 검증·응답
    │
    ▼
Service ───── 비즈니스 흐름·도메인 협력
    │
    ├──▶ RecommendationCalculator ── 순수 추천 계산
    │
    ▼
Repository ── JPA 영속화
    │
    ▼
PostgreSQL
```

공통 영역은 JWT Filter, Spring Security, CORS, 공통 응답과 예외 처리를 담당합니다. 인증이 필요한 요청에는 `Authorization: Bearer <token>`을 사용하며 상품 조회와 Health API 등은 공개되어 있습니다.

## Database와 도메인 구조

### Member / Authentication

회원가입, 로그인, JWT 발급과 로그인 사용자 조회를 담당합니다. 서버 세션을 만들지 않는 Stateless 인증 구조입니다.

### BodyProfile

키, 몸무게, 성별, 체형 특징을 관리합니다. 추천 흐름 전 사용자의 기본 정보를 구성합니다.

### MyFit

사용자가 기준으로 삼는 상의·하의와 부위별 실측 및 착용감을 관리합니다.

```text
MyFit
├── TOP
│   ├── Shoulder / Chest / Sleeve / Length
│   └── 각 실측의 Measurement Area, Value, Fit Feeling
└── BOTTOM
    ├── Waist / Rise / Thigh / Hem
    └── 각 실측의 Measurement Area, Value, Fit Feeling
```

### Product

```text
Product
└── ProductSize
    └── ProductMeasurement
```

상품 하나가 여러 사이즈를 가지며, 각 사이즈의 부위별 실측을 추천 계산의 비교 대상으로 사용합니다.

### Recommendation

Service가 상품과 사용자의 My Fit을 조회한 뒤 `RecommendationCalculator`에 계산 가능한 입력만 전달합니다. Calculator는 JPA, JWT, HTTP에 의존하지 않습니다.

```text
My Fit Measurement
    ▼
Fit Feeling에 따른 목표 실측 보정
    ▼
상품 사이즈별 동일 부위 비교
    ▼
부위별 가중 오차와 Size Score 계산
    ▼
최소 오차 사이즈 선택
    ▼
Match Score와 부위별 비교 결과 생성
```

| Fit Feeling | 계산 의미 |
| --- | --- |
| `SMALL` | 현재 기준 의류보다 조금 큰 목표 실측 선호 |
| `EXACT` | 현재 실측과 같은 착용감 선호 |
| `LARGE` | 현재 기준 의류보다 조금 작은 목표 실측 선호 |

## REST API

성공 응답은 `ApiResponse<T>`, 실패 응답은 `ErrorResponse`로 통일해 일관된 응답 계약을 제공합니다.

| Method | Endpoint | 설명 | 인증 |
| --- | --- | --- | --- |
| GET | `/api/v1/health` | 서버 상태 조회 | 불필요 |
| POST | `/api/v1/members` | 회원가입 | 불필요 |
| POST | `/api/v1/auth/login` | 로그인 | 불필요 |
| GET | `/api/v1/auth/me` | 로그인 사용자 조회 | 필요 |
| POST | `/api/v1/body-profiles` | 체형 프로필 등록 | 필요 |
| GET/PATCH | `/api/v1/body-profiles/me` | 내 프로필 조회·수정 | 필요 |
| POST | `/api/v1/my-fits` | 기준 의류 등록 | 필요 |
| GET/PATCH | `/api/v1/my-fits/me` | 기준 의류 조회·수정 | 필요 |
| GET | `/api/v1/products` | 상품 목록 조회 | 불필요 |
| GET | `/api/v1/products/{code}` | 상품 상세 조회 | 불필요 |
| POST | `/api/v1/recommendations` | 사이즈 추천 | 필요 |

기존 README의 `/api/v1/my-fit` 표기는 실제 Controller와 일치하는 `/api/v1/my-fits`로 바로잡았습니다.

## 프로젝트 폴더 구조

```text
project-S/
├── frontend/src/
│   ├── app/                  # App Router 페이지
│   ├── components/           # 공통 UI·layout·auth·background
│   ├── features/             # 기능별 components/api/types/store/lib
│   ├── lib/                  # API와 공통 실행 로직
│   ├── stores/               # 전역·영속 상태
│   └── styles/               # 전역 스타일과 변수
├── backend/src/
│   ├── main/java/com/projects/backend/
│   │   ├── auth/
│   │   ├── bodyprofile/
│   │   ├── common/
│   │   ├── health/
│   │   ├── member/
│   │   ├── myfit/
│   │   ├── product/
│   │   └── recommendation/
│   └── test/                 # 단위·Controller·통합 테스트
└── docs/                     # 포트폴리오 문서
```

## 주요 설계 이유

### 기능 중심 Frontend

화면이 아닌 비즈니스 기능을 기준으로 API, 타입, 상태와 UI를 함께 배치했습니다. 기능을 수정할 때 관련 코드를 좁은 범위에서 찾고, 새로운 기능을 독립적으로 확장하기 위함입니다.

### 도메인 중심 Backend

Member, BodyProfile, MyFit, Product, Recommendation 경계를 패키지로 표현했습니다. 각 도메인의 Controller·Service·Repository 책임을 가까이 두어 변경 영향을 명확히 했습니다.

### Calculator 분리

추천 계산을 Service에서 분리해 DB나 인증 없이 단위 테스트할 수 있도록 했습니다. 추천 규칙과 가중치가 바뀌어도 HTTP·영속화 흐름에 미치는 영향을 줄입니다.

### Entity 재사용 Update 전략

MyFit 수정 시 자식 Entity를 모두 삭제하고 다시 삽입하지 않고, Category와 Measurement Area가 같은 기존 Entity를 갱신합니다. JPA Dirty Checking을 활용하고 Unique Constraint와 Flush 순서 충돌을 피하기 위한 선택입니다.

### 테스트 구조

H2를 PostgreSQL 호환 모드로 실행하며 추천 Calculator와 Service 단위 테스트, 인증·Body Profile·MyFit·상품·추천 API 통합 테스트를 구성했습니다. 테스트 실행 방법은 [README](../README.md#로컬-실행-방법)를 참고합니다.
