# Project S

> **사용자의 체형과 기준 의류(My Fit)를 기반으로 상품 실측을 비교하여 적절한 사이즈를 추천하는 풀스택 웹 서비스**

<br>

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6DB33F?logo=springboot)
![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?logo=springsecurity)
![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql)
![JPA](https://img.shields.io/badge/JPA-Hibernate-brown)

---

# 📌 Project Overview

온라인 쇼핑에서 가장 어려운 부분 중 하나는 **사이즈 선택**입니다.

같은 **M 사이즈**라도 브랜드마다 실측이 달라 착용감이 크게 달라질 수 있으며,
기존 쇼핑몰에서는 단순한 사이즈 표기만으로는 정확한 선택이 어렵습니다.

**Project S**는 사용자의 체형 정보와 평소 가장 잘 맞는 의류(**My Fit**)를 기준으로
상품의 실제 실측 데이터를 비교하여 가장 적합한 사이즈를 추천하는 서비스를 목표로 개발한 프로젝트입니다.

프론트엔드는 **Next.js(App Router)**,
백엔드는 **Spring Boot + PostgreSQL** 기반으로 구현하였으며,
JWT 인증과 Recommendation Engine을 적용하여 실제 서비스와 유사한 구조를 설계하였습니다.

---

# 🎯 Project Goals

- 사용자 맞춤 의류 사이즈 추천 서비스 구현
- 실제 서비스 수준의 풀스택 아키텍처 경험
- 유지보수 가능한 도메인 중심 설계
- 추천 로직과 비즈니스 로직의 역할 분리
- 확장 가능한 프로젝트 구조 설계

---

# ✨ Main Features

## 👤 회원 기능

- 회원가입
- 로그인
- JWT 기반 인증
- 내 정보 조회

---

## 📋 Body Profile

사용자의 기본 체형 정보를 등록합니다.

### 입력 정보

- 키
- 몸무게
- 성별
- 체형 특징

등록된 정보는 추천 과정에서 사용자 기준 데이터로 활용됩니다.

---

## 👕 My Fit 등록

평소 가장 잘 맞는 의류를 등록합니다.

### 지원 기능

- 상의 / 하의 등록
- 의류 이름 등록
- 부위별 실측값 입력
- 부위별 착용감(Fit Feeling) 등록

### 예시 측정 부위

- 어깨너비
- 가슴단면
- 총장
- 소매길이
- 허리단면
- 밑위
- 허벅지단면

---

## 🛍 Product Catalog

실제 상품 정보를 조회할 수 있습니다.

### 제공 기능

- 상품 목록 조회
- 상품 상세 조회
- 사이즈별 실측 정보 확인

---

## 🤖 Recommendation

사용자의 체형과 기준 의류를 기반으로
상품의 실측 데이터를 비교하여 적절한 사이즈를 추천합니다.

추천 결과에는 다음 정보를 제공합니다.

- 추천 사이즈
- Match Score
- 추천 이유
- 부위별 실측 비교
- 착용감 설명

---

## 🕘 Recommendation History

추천 결과를 저장하여
최근 추천 내역을 다시 확인할 수 있습니다.

현재는 Local Storage 기반으로 관리됩니다.

---

# 🛠 Tech Stack

## Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Zustand
- TanStack Query
- CSS Modules
- Framer Motion

---

## Backend

- Java 17
- Spring Boot 3
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- PostgreSQL
- Gradle

---

## Development Tools

- VSCode
- GitHub Desktop
- Codex CLI
- ChatGPT

---

# 📂 Project Structure

```text
Project-S
│
├── frontend
│   ├── app
│   ├── components
│   ├── features
│   ├── lib
│   ├── stores
│   └── styles
│
└── backend
    ├── auth
    ├── bodyprofile
    ├── common
    ├── member
    ├── myfit
    ├── product
    ├── recommendation
    └── security
```

프로젝트는 **Frontend / Backend를 분리한 구조**로 구성하여
각 영역의 책임을 명확하게 나누고 유지보수성을 높였습니다.

---

# 🏗 Architecture

Project S는 다음과 같은 계층 구조를 사용합니다.

```text
Client

↓

Controller

↓

Service

↓

Recommendation Calculator

↓

Repository

↓

PostgreSQL
```

### Controller

- HTTP 요청 처리
- Request Validation
- Response 반환

### Service

- 비즈니스 로직 처리
- 도메인 간 협력
- RecommendationCalculator 호출

### Recommendation Calculator

추천 계산만 담당하는 순수 계산 객체입니다.

- JPA 의존 X
- JWT 의존 X
- Database 접근 X

계산 로직만 수행하도록 분리하여
테스트와 유지보수가 쉽도록 설계했습니다.

---

# 🧩 Domain Structure

Project S는 기능별 도메인으로 프로젝트를 구성하였습니다.

## Member

회원 정보 관리

- 회원가입
- 로그인
- JWT 인증

---

## BodyProfile

사용자의 체형 정보를 관리합니다.

### 저장 정보

- Height
- Weight
- Gender
- Body Features

---

## MyFit

사용자가 기준으로 삼는 의류를 관리합니다.

MyFit은 다음 구조를 가집니다.

```text
MyFit

├── TOP
│     ├── Shoulder
│     ├── Chest
│     ├── Sleeve
│     └── Length
│
└── BOTTOM
      ├── Waist
      ├── Rise
      ├── Thigh
      └── Hem
```

각 Measurement는

- Measurement Area
- Measurement Value
- Fit Feeling

정보를 함께 저장합니다.

---

## Product

상품 정보를 관리합니다.

```text
Product

↓

ProductSize

↓

ProductMeasurement
```

각 사이즈별 실측 데이터를 저장하여
추천 엔진에서 비교 기준으로 사용합니다.

---

## Recommendation

Recommendation 도메인은

- 상품 조회
- 사용자 My Fit 조회
- Recommendation Calculator 호출
- 추천 결과 생성

역할을 담당합니다.

---

# ⚙ Recommendation Engine

Project S의 핵심 기능입니다.

추천은 사용자의 체형만 비교하는 것이 아니라,
**기준 의류(My Fit)** 와 상품의 실측 데이터를 비교하여 수행됩니다.

---

## Recommendation Flow

```text
Body Profile

↓

My Fit

↓

Product

↓

Recommendation Calculator

↓

Recommended Size
```

---

## Recommendation Process

```text
My Fit Measurement

↓

Fit Feeling 반영

↓

Target Measurement 생성

↓

상품 실측 비교

↓

부위별 가중치 적용

↓

Size Score 계산

↓

Match Score 계산

↓

추천 사이즈 결정
```

---

## Measurement Comparison

동일한 Measurement Area를 기준으로 비교합니다.

예시

- Shoulder Width
- Chest Width
- Total Length
- Sleeve Length
- Waist Width
- Rise
- Thigh Width
- Hem Width

---

## Fit Feeling

사용자가 입력한 착용감을 추천 계산에 반영합니다.

| Fit Feeling | 의미 |
|-------------|------|
| SMALL | 현재보다 조금 큰 실측 선호 |
| EXACT | 현재와 동일한 착용감 |
| LARGE | 현재보다 조금 작은 실측 선호 |

---

## Match Score

추천 결과는 단순히 사이즈만 제공하는 것이 아니라
상품과 얼마나 잘 맞는지를 **Match Score**로 함께 제공합니다.

추천 결과 예시

```text
Recommended Size : M

Match Score : 94

Reason

- 가슴단면이 기준 의류와 가장 유사합니다.
- 어깨너비 차이가 적습니다.
- 총장이 사용자의 선호 범위 내입니다.
```

---

# 🔄 Service Flow

Project S의 전체 서비스 흐름입니다.

```text
회원가입

↓

로그인

↓

Body Profile 등록

↓

My Fit 등록

↓

상품 조회

↓

Recommendation API

↓

Recommendation Calculator

↓

추천 결과

↓

Recommendation History 저장
```

---

# 📡 REST API

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/members` | 회원가입 |
| POST | `/api/v1/auth/login` | 로그인 |
| GET | `/api/v1/auth/me` | 로그인 사용자 조회 |

---

## Body Profile

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/body-profiles` | 프로필 등록 |
| GET | `/api/v1/body-profiles/me` | 내 프로필 조회 |
| PATCH | `/api/v1/body-profiles/me` | 프로필 수정 |

---

## My Fit

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/my-fit` | 기준 의류 등록 |
| GET | `/api/v1/my-fit/me` | 기준 의류 조회 |
| PATCH | `/api/v1/my-fit/me` | 기준 의류 수정 |

---

## Product

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/products` | 상품 목록 조회 |
| GET | `/api/v1/products/{code}` | 상품 상세 조회 |

---

## Recommendation

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/recommendations` | 사이즈 추천 |

---

# 🧪 Testing

프로젝트의 주요 기능은 **단위 테스트(Unit Test)** 와
**통합 테스트(Integration Test)** 를 작성하여 검증하였습니다.

## Unit Test

- Recommendation Calculator
- JWT Provider
- BodyProfile Service
- MyFit Service
- Product Service

---

## Integration Test

- 회원가입
- 로그인
- JWT 인증
- Body Profile API
- My Fit API
- Product API
- Recommendation API

---

## 검증 내용

- JWT 발급 및 인증
- 인증되지 않은 요청 차단
- Body Profile 등록 / 수정
- My Fit 등록 / 수정
- 상품 조회
- Recommendation 결과 검증
- Recommendation Comparison 검증
- Match Score 계산 검증

---

# 💡 Troubleshooting

프로젝트를 개발하면서 발생했던 주요 문제와 해결 과정을 정리했습니다.

---

## 1. MyFit 수정 시 Unique Constraint 충돌

### 문제

MyFit 수정 시 동일한 Category(TOP/BOTTOM)를
새로운 Entity로 다시 생성하면서

```text
(my_fit_id, category)
```

Unique Constraint 오류가 발생했습니다.

```
Duplicate Key
uk_my_fit_entries_fit_category
```

### 원인

기존 Entity를 삭제(`clear()`)한 뒤
새로운 Entity를 생성하는 방식에서

Hibernate의 Flush 순서에 따라

```
INSERT

↓

DELETE
```

순으로 SQL이 실행되어
기존 데이터와 충돌했습니다.

### 해결

기존 Entity를 재사용하도록 변경했습니다.

```text
Before

clear()

↓

new Entry

↓

save()
```

↓

```text
After

Category 존재?

↓

YES → Update

NO → Create
```

동일한 방식으로 Measurement도
Area 기준으로 재사용하도록 변경하여

```
(entry_id, area)
```

Unique Constraint 충돌도 함께 해결했습니다.

---

## 2. Recommendation Calculator 분리

### 문제

초기에는 추천 계산을 Service에서 모두 처리하려 했습니다.

추천 로직이 복잡해질수록

- 유지보수 어려움
- 테스트 어려움
- 책임 증가

문제가 발생했습니다.

### 해결

추천 계산을

```
RecommendationCalculator
```

클래스로 분리하여

- 순수 계산 로직
- DB 접근 없음
- JPA 의존 없음

구조로 변경했습니다.

이를 통해 단위 테스트 작성과
추천 알고리즘 개선이 쉬워졌습니다.

---

## 3. 공통 API 응답 구조

여러 API마다 Response 형태가 달라지는 문제를 방지하기 위해

모든 API를

```java
ApiResponse<T>
```

형태로 통일했습니다.

예시

```json
{
  "success": true,
  "message": "추천이 완료되었습니다.",
  "data": {
    ...
  }
}
```

오류 역시 동일한 구조를 사용하여

프론트엔드에서 일관된 예외 처리가 가능하도록 설계했습니다.

---

# 🎯 Design Decisions

프로젝트를 설계하면서 중요하게 고려한 부분입니다.

---

## Feature-Based Frontend

Frontend는 기능 단위로 구성하여

- 유지보수
- 확장성
- 관심사 분리

를 고려했습니다.

---

## Domain-Oriented Backend

Backend는 기능보다

- Member
- BodyProfile
- MyFit
- Product
- Recommendation

도메인 중심으로 설계하여
비즈니스 로직을 명확하게 분리했습니다.

---

## Calculator Pattern

추천 계산은

```
Controller

↓

Service

↓

RecommendationCalculator
```

구조로 분리하여

비즈니스 로직과 계산 로직이 서로 의존하지 않도록 설계했습니다.

---

## Entity Update Strategy

수정(Update) 시

기존 Entity를 재사용하는 방식을 적용하여

- Dirty Checking
- JPA 영속성
- Unique Constraint

문제를 안정적으로 처리하도록 구현했습니다.

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone https://github.com/Bumjun-hub/Project-S.git

cd Project-S
```

---

## 2. Backend

```bash
cd backend

./gradlew bootRun
```

기본 실행 주소

```text
http://localhost:8080
```

---

## 3. Frontend

```bash
cd frontend

npm install

npm run dev
```

기본 실행 주소

```text
http://localhost:3000
```

---

## 4. Database

PostgreSQL을 사용합니다.

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/project_s

spring.datasource.username=postgres

spring.datasource.password=비밀번호
```

---

# 🚀 Future Improvements

Project S는 현재 핵심 기능을 구현한 상태이며,
다음과 같은 방향으로 서비스를 확장할 계획입니다.

## Recommendation

- 추천 알고리즘 고도화
- 브랜드별 사이즈 특성 반영
- 사용자 피드백 기반 추천 정확도 향상
- 추천 결과 신뢰도 계산 개선

---

## AI

- 생성형 AI를 활용한 추천 이유 생성
- 자연어 기반 스타일 추천 기능
- 사용자 질문 기반 추천 서비스

---

## Backend

- Recommendation History DB 저장
- Redis Cache 적용
- 관리자 상품 관리 기능
- 이미지 업로드 기능
- Swagger(OpenAPI) 문서화

---

## Infrastructure

- Docker 기반 컨테이너 환경 구성
- Nginx Reverse Proxy 적용
- Linux 서버 배포
- CI/CD 자동 배포 구축
- AWS 클라우드 배포

---

## Frontend

- 모바일 UI 최적화
- 차트 기반 실측 비교 화면
- 상품 검색 및 필터 기능
- 즐겨찾기 기능
- 다크/라이트 테마 지원

---

# 📚 What I Learned

이번 프로젝트는 단순히 화면을 구현하는 프로젝트가 아니라,
실제 서비스를 만든다는 관점에서 설계와 구현을 경험한 프로젝트였습니다.

Frontend에서는 Feature 기반 구조를 적용하여 관심사를 분리하고,
Zustand와 TanStack Query를 활용하여 클라이언트 상태와 서버 상태를 분리해 관리하는 방법을 익혔습니다.

Backend에서는 Spring Boot와 JPA를 이용하여 도메인 중심 구조를 설계하고,
JWT 인증, 공통 응답 및 예외 처리, REST API 설계 등을 구현하며 실제 서비스의 백엔드 구조를 경험할 수 있었습니다.

특히 Recommendation 기능을 구현하면서 비즈니스 로직과 계산 로직을 분리하기 위해
`RecommendationCalculator`를 별도의 클래스로 설계하였고,
이를 통해 테스트와 유지보수가 쉬운 구조를 만드는 경험을 할 수 있었습니다.

또한 MyFit 수정 과정에서 발생한 Unique Constraint 문제를 해결하며,
JPA의 영속성 컨텍스트와 Dirty Checking, Entity 재사용 방식에 대해 깊이 이해할 수 있었습니다.

프로젝트를 진행하면서 단순히 기능을 구현하는 것보다
**왜 이런 구조로 설계해야 하는지**, **유지보수와 확장성을 어떻게 고려해야 하는지**를 고민하는 습관을 기를 수 있었으며,
풀스택 프로젝트를 직접 구현하면서 프론트엔드와 백엔드가 어떻게 협력하는지에 대한 이해도 함께 높일 수 있었습니다.

---

# 🔗 Links

## GitHub

```text
https://github.com/Bumjun-hub/Project-S
```

## Deploy

```text
https://project-s-rust.vercel.app/
```
