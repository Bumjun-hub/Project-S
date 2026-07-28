# Troubleshooting

[← README](../README.md) · [Architecture](architecture.md) · [배포](deployment.md) · [개발 일지](development-log.md) · [로드맵](roadmap.md)

이 문서에는 기존 README, 현재 코드 또는 Git 변경에서 확인되는 사례만 확정된 문제로 기록합니다. 배포 중 발생했다고 추정할 수 있지만 저장소에 근거가 없는 항목은 별도의 TODO로 구분합니다.

## 1. MyFit 수정 시 Unique Constraint 충돌

### 문제

MyFit 수정 시 동일한 Category(`TOP`/`BOTTOM`)와 Measurement Area를 새 Entity로 만들면서 `(my_fit_id, category)` 또는 `(entry_id, area)` Unique Constraint 충돌이 발생했습니다.

### 원인

기존 자식 Entity를 `clear()`한 뒤 새 Entity를 추가하는 방식에서는 Hibernate Flush 시점에 `DELETE`보다 `INSERT`가 먼저 실행될 수 있습니다. 이때 아직 DB에 남아 있는 기존 Unique Key와 새 행이 충돌합니다.

### 해결

Category가 같은 `MyFitEntry`, Area가 같은 `MyFitMeasurement`가 존재하면 기존 Entity 값을 갱신하고, 없을 때만 생성하도록 변경했습니다. 기존 Entity를 재사용하므로 JPA Dirty Checking으로 UPDATE가 수행됩니다.

```text
Category 또는 Area 존재?
├── Yes ──▶ 기존 Entity 갱신
└── No  ──▶ 새 Entity 생성
```

### 배운 점

JPA 컬렉션 교체는 Java 객체 관점뿐 아니라 실제 SQL 실행 순서와 DB Constraint까지 고려해야 합니다. 식별 가능한 자식 객체는 삭제·재생성보다 갱신하는 편이 안전합니다.

## 2. 복잡해진 추천 로직의 책임 분리

### 문제

상품 조회, My Fit 조회와 추천 계산을 모두 Service가 담당하면 추천 규칙이 늘어날수록 클래스 책임이 커지고 계산만 독립적으로 검증하기 어려워집니다.

### 원인

DB 접근이 필요한 애플리케이션 흐름과 입력값만으로 결과를 만드는 계산 규칙의 변경 이유가 다른데도 같은 계층에 두려 했기 때문입니다.

### 해결

순수 계산을 `RecommendationCalculator`로 분리했습니다. Service는 필요한 데이터를 조회해 `RecommendationInput`으로 변환하고, Calculator는 착용감 보정, 부위별 가중치, Size Score와 Match Score 계산만 담당합니다.

### 배운 점

외부 의존성이 없는 계산 객체는 테스트가 쉽고 알고리즘 개선 범위가 명확합니다. 역할 분리는 클래스 수를 늘리는 목적이 아니라 변경 이유를 분리하기 위한 선택입니다.

## 3. API마다 다른 응답과 오류 처리

### 문제

API마다 성공·오류 응답 형태가 달라지면 Frontend가 Endpoint별 파싱과 예외 처리를 반복해야 합니다.

### 원인

Controller가 각자 응답 구조를 결정하고 공통 오류 계약이 없으면 HTTP 상태 외의 오류 코드와 메시지를 일관되게 전달하기 어렵습니다.

### 해결

성공 응답을 `ApiResponse<T>`, 오류를 `ErrorResponse`로 통일하고 `GlobalExceptionHandler`에서 공통 처리했습니다. Frontend의 공통 API Client도 이 계약을 기준으로 오류 메시지와 코드를 해석합니다.

### 배운 점

응답 규격은 Backend 내부 구현이 아니라 Frontend와 합의하는 인터페이스입니다. 초기에 공통 계약을 정의하면 기능이 늘어날 때 중복과 분기 처리를 줄일 수 있습니다.

## 4. 배포 환경의 localhost API 주소

### 문제

Frontend의 기본 API 주소가 `http://localhost:8080`으로 고정되어 있으면, 배포된 페이지를 방문한 사용자의 브라우저는 Ubuntu 서버가 아니라 사용자 자신의 PC에서 8080 포트를 찾습니다.

### 원인

브라우저에서 `localhost`는 Frontend 서버가 아니라 브라우저가 실행되는 장비를 의미합니다. 로컬 개발에서는 우연히 Frontend와 Backend가 같은 개발 PC에 있어 동작하지만 원격 배포에서는 의미가 달라집니다.

### 해결

현재 작업 트리에서 `frontend/src/lib/apiClient.ts`와 `frontend/src/features/auth/api.ts`의 기본 API Base URL을 빈 문자열로 변경했습니다. 환경변수가 없으면 `/api/v1/...` 동일 출처 요청을 보내므로 Apache가 `/api`를 Spring Boot로 Reverse Proxy할 수 있습니다. 분리된 개발 환경에서는 `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`을 명시합니다.

### 배운 점

클라이언트 번들에 들어가는 주소는 서버의 관점이 아니라 최종 사용자 브라우저의 관점에서 해석해야 합니다. Reverse Proxy로 동일 출처를 구성하면 운영 URL 결합과 CORS 부담을 줄일 수 있습니다.

## 확인 후 추가할 배포 트러블슈팅

아래 항목은 요청된 문서 범위에 포함되지만 저장소의 코드·설정·Git 기록만으로 실제 발생 여부와 해결 방법을 확인할 수 없습니다. 사실을 보존하기 위해 사례를 만들어 쓰지 않고 TODO로 둡니다.

- `TODO: Node.js 설치 중 발생한 실제 오류 메시지, 원인, 해결 명령 기록`
- `TODO: Apache Reverse Proxy 설정 중 발생한 실제 증상과 VirtualHost 수정 내용 기록`
- `TODO: VirtualBox Bridge Adapter 문제의 실제 네트워크 상태와 해결 설정 기록`
- `TODO: systemd PATH 문제의 journal 로그, ExecStart 절대 경로와 Environment 설정 기록`

확인할 때는 각 항목을 `문제 → 원인 → 해결 → 배운 점` 순서로 추가하고 비밀번호, 토큰, 공인 IP 등 민감 정보는 제거합니다.
