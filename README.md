# Project S

> 사용자의 체형과 기준 의류(My Fit)를 상품 실측과 비교해 적절한 의류 사이즈를 추천하는 풀스택 웹 서비스

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6-blue?logo=typescript)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6DB33F?logo=springboot)
![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql)

## 프로젝트 소개

같은 `M` 사이즈라도 브랜드와 상품마다 실제 치수가 달라 온라인에서는 사이즈를 정확히 선택하기 어렵습니다. Project S는 사용자의 Body Profile과 기준 의류를 순차적으로 등록하고, 현재 추천 엔진은 My Fit의 실측 및 착용감과 상품 실측을 비교하여 적절한 사이즈를 추천합니다.

Next.js 프론트엔드와 Spring Boot API를 분리하고, 추천 계산을 독립적인 Calculator로 구성해 화면·비즈니스 흐름·계산 책임을 나눴습니다. 현재 핵심 MVP 기능을 구현했으며 Ubuntu Server에 프론트엔드와 백엔드를 직접 배포한 상태입니다. 상세 배포 설정 중 저장소에서 확인되지 않는 내용은 [배포 문서](docs/deployment.md)에 TODO로 구분했습니다.

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 회원 | 회원가입, 로그인, JWT 인증, 로그인 사용자 조회 |
| Body Profile | 키, 몸무게, 성별, 체형 특징 등록·조회·수정 |
| My Fit | 상·하의 기준 의류와 부위별 실측·착용감 등록·조회·수정 |
| 상품 | 상품 목록·상세 및 사이즈별 실측 조회 |
| 사이즈 추천 | My Fit과 상품 실측을 비교해 추천 사이즈, Match Score, 비교 근거 제공 |
| 추천 기록 | 최근 추천 결과를 브라우저 Local Storage에 저장 |

서비스 흐름은 `회원가입 → 로그인 → Body Profile → My Fit → 상품 선택 → 추천 → 결과 저장` 순서입니다.

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Zustand, TanStack Query, CSS Modules, Framer Motion |
| Backend | Java 17, Spring Boot 3, Spring Security, JWT, Spring Data JPA, Hibernate, Gradle |
| Database | PostgreSQL, H2(Test) |
| Deployment | Ubuntu Server, VirtualBox, Apache Reverse Proxy, systemd |

## 프로젝트 구조 요약

```text
project-S/
├── frontend/                 # Next.js App Router 애플리케이션
│   └── src/
│       ├── app/              # 라우트
│       ├── components/       # 공통 UI와 레이아웃
│       ├── features/         # 기능별 UI·API·상태
│       ├── lib/              # API Client와 공통 유틸리티
│       └── stores/           # 전역 상태
├── backend/                  # Spring Boot API
│   └── src/main/java/com/projects/backend/
│       ├── auth/             # 로그인과 JWT
│       ├── member/           # 회원
│       ├── bodyprofile/      # 체형 프로필
│       ├── myfit/            # 기준 의류
│       ├── product/          # 상품과 실측
│       ├── recommendation/   # 추천 흐름과 계산기
│       └── common/           # 보안·응답·예외 설정
└── docs/                     # 설계·배포·기록 문서
```

자세한 구조와 설계 이유는 [Architecture](docs/architecture.md)를 참고해 주세요.

## 로컬 실행 방법

### 1. 저장소 복제

```bash
git clone https://github.com/Bumjun-hub/Project-S.git
cd Project-S
```

### 2. PostgreSQL 준비

기본 데이터베이스 이름은 `project_s`입니다. 실제 비밀번호와 JWT Secret은 저장소에 커밋하지 않고 환경변수로 전달합니다.

```bash
export DB_URL='jdbc:postgresql://localhost:5432/project_s'
export DB_USERNAME='postgres'
export DB_PASSWORD='your-password'
export JWT_SECRET='replace-with-a-secure-secret'
```

### 3. 백엔드 실행

```bash
cd backend
./gradlew bootRun
```

기본 주소는 `http://localhost:8080`이며 Health API는 `/api/v1/health`입니다.

### 4. 프론트엔드 실행

새 터미널에서 실행합니다.

```bash
cd frontend
npm install
npm run dev
```

기본 주소는 `http://localhost:3000`입니다. 현재 API Client의 기본값은 동일 출처 요청이므로 개발 서버를 분리해 실행할 때는 아래 환경변수를 설정합니다.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 npm run dev
```

## 프로젝트 스크린샷

> TODO: 실제 배포 화면 캡처와 서비스 URL을 추가합니다. 현재 저장소에는 문서용 스크린샷이 없습니다.

## 문서

| 문서 | 내용 |
| --- | --- |
| [Architecture](docs/architecture.md) | 시스템 구조, 도메인, 추천 엔진, API와 설계 결정 |
| [Deployment](docs/deployment.md) | Ubuntu·VirtualBox 기반 수동 배포 구조와 운영 방법 |
| [Troubleshooting](docs/troubleshooting.md) | 프로젝트에서 확인된 문제, 원인, 해결과 배운 점 |
| [Development Log](docs/development-log.md) | Git 이력과 구현 결과를 기준으로 정리한 개발 일지 |
| [Roadmap](docs/roadmap.md) | Docker, HTTPS, CI/CD 등 후속 작업 |

---

[문서 홈](docs/architecture.md) · [배포](docs/deployment.md) · [트러블슈팅](docs/troubleshooting.md) · [개발 일지](docs/development-log.md) · [로드맵](docs/roadmap.md)
