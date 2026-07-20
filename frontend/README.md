# Project S

> AI 기반 의류 사이즈 추천 웹 서비스

<br />

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript)
![Zustand](https://img.shields.io/badge/Zustand-000000)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154)
![CSS Modules](https://img.shields.io/badge/CSS_Modules-000000)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF)

<br />

## 📌 Project Overview

Project S는 사용자의 체형 정보와 평소 잘 맞는 의류 데이터를 기반으로,  
상품별 실측 정보와 핏 데이터를 비교 분석하여 적절한 사이즈를 추천해주는 AI 의류 추천 서비스입니다.

기존 쇼핑몰의 단순 S / M / L 기준이 아닌,  
사용자의 체형 + 기준 의류 + 상품 실측 데이터를 함께 활용하여  
보다 직관적인 추천 경험을 제공하는 것을 목표로 기획하였습니다.

프론트엔드 포트폴리오 프로젝트로 진행하였으며,  
Next.js App Router 기반 구조 설계, 상태 관리, 사용자 흐름 설계,  
Mock AI 추천 구조, UI/UX 퍼블리싱을 중심으로 개발하였습니다.

<br />

---

# ✨ Main Features

## 👤 사용자 프로필 입력
- 키 / 몸무게 / 성별 입력
- 체형 타입 선택
- 사용자 체형 데이터 저장

<br />

## 👕 기준 의류(My Fit) 등록
- 실제로 잘 맞는 옷 정보 저장
- 사이즈 / 실측 기반 데이터 관리
- 추천 기준 데이터로 활용

<br />

## 🛍 상품 탐색
- 상품 리스트 제공
- 상품 상세 페이지 구성
- 브랜드 및 핏 정보 확인

<br />

## 🤖 AI 사이즈 추천
- 사용자 체형 데이터 + 기준 의류 데이터 + 상품 실측 비교
- Mock AI 기반 비동기 추천 로직 구현
- Tight / Regular / Oversize 형태의 추천 결과 제공

<br />

## 📊 추천 결과 분석
- 추천 사이즈 표시
- 예상 핏 결과 제공
- 추천 이유 제공

<br />

## 🕘 최근 기록 저장
- 최근 분석 기록 확인
- localStorage 기반 기록 유지

<br />

---

# 🛠 Tech Stack

## Frontend
- Next.js (App Router)
- React
- TypeScript

## State Management & Data
- Zustand
- TanStack Query
- localStorage

## Styling & Animation
- CSS Modules
- Framer Motion
- Glassmorphism UI
- Responsive UI

## Development Tools
- Cursor AI
- Codex CLI
- ChatGPT
- VSCode
- GitHub Desktop

<br />

---

# 📂 Folder Structure

```bash
src
 ├─ app
 │   ├─ history
 │   ├─ my-fit
 │   ├─ privacy
 │   ├─ products
 │   ├─ profile
 │   ├─ recommend
 │   ├─ result
 │   ├─ terms
 │   ├─ layout.tsx
 │   ├─ page.tsx
 │   └─ providers.tsx
 │
 ├─ components
 │   ├─ background
 │   ├─ common
 │   └─ layout
 │
 ├─ features
 │   ├─ history
 │   ├─ landing
 │   ├─ legal
 │   ├─ my-fit
 │   ├─ product
 │   ├─ profile
 │   └─ recommend
 │
 ├─ lib
 │   ├─ queryClient.ts
 │   ├─ storage.ts
 │   ├─ flow-completion.ts
 │   ├─ flow-gate-needs.ts
 │   └─ wait-flow-persist-hydration.ts
 │
 ├─ mocks
 │   ├─ products.mock.ts
 │   └─ recommendation.mock.ts
 │
 ├─ stores
 │   ├─ fitReferenceStore.ts
 │   ├─ flowBootstrapStore.ts
 │   └─ userProfileStore.ts
 │
 └─ styles
     ├─ globals.css
     └─ variables.css
```

<br />

---

# 🧩 Architecture & Implementation

## 1. Feature-Based Structure

기능 단위(feature-based) 구조로 프로젝트를 구성하여  
유지보수성과 확장성을 고려하였습니다.

### Features
- profile
- product
- recommend
- history
- my-fit

<br />

---

## 2. App Router Flow Design

Next.js App Router 기반으로 페이지를 구성하였습니다.

### User Flow
1. 프로필 입력
2. 기준 의류 등록
3. 상품 탐색
4. AI 추천 분석
5. 결과 확인
6. 최근 기록 저장

실제 서비스 흐름처럼 단계형 UX 구조를 설계하였습니다.

<br />

---

## 3. Zustand State Management

전역 상태를 Zustand 기반으로 관리하였습니다.

### Store Structure
- userProfileStore
- fitReferenceStore
- flowBootstrapStore

페이지 간 상태 공유와 사용자 흐름 관리를 단순화하였습니다.

<br />

---

## 4. TanStack Query Data Flow

TanStack Query를 활용하여 비동기 데이터 흐름 구조를 구성하였습니다.

### Purpose
- 비동기 데이터 관리
- 로딩 상태 처리
- 서버 상태 관리 구조 분리
- 추후 실제 API 연결 대비

<br />

---

## 5. Mock API Recommendation System

실제 AI API 연결 이전 단계에서,  
Mock 데이터를 활용한 추천 구조를 먼저 설계하였습니다.

### Mock Files
- products.mock.ts
- recommendation.mock.ts

이를 통해 실제 서비스와 유사한 흐름으로 프론트엔드 구조를 구현하였습니다.

<br />

---

## 6. User-Centered UX Design

단순 화면 나열보다 사용자 흐름 중심 UX 설계에 집중하였습니다.

### UX Flow
- 입력 → 분석 → 결과 확인
- 단계별 이동 구조
- 이전 데이터 유지
- 추천 결과 시각화

<br />

---

## 7. Reusable Component Design

재사용 가능한 공통 컴포넌트 구조를 기반으로 UI를 구성하였습니다.

### Common Components
- Button
- Card
- Input
- Select
- Skeleton
- EmptyState

<br />

---

## 8. UI / Publishing

다크 기반 Glassmorphism 스타일을 적용하였습니다.

### UI Elements
- Glow Effect
- Blur Background
- Motion Animation
- Responsive Layout
- Grid Background Effect

Framer Motion을 활용하여 인터랙션과 사용자 경험을 강화하였습니다.

<br />

---

# 🤖 AI Workflow

## Cursor AI

### Used For
- 레이아웃 구성
- CSS Modules 스타일링
- 반복 UI 생성
- 컴포넌트 구조 작성
- 페이지 퍼블리싱 작업

<br />

---

## Codex CLI

### Used For
- 파일 단위 수정
- 구조 개선
- 반복 코드 정리
- 리팩토링 보조
- 코드 흐름 정리

<br />

---

## ChatGPT

### Used For
- 프로젝트 아이디어 정리
- 상태 관리 방향 검토
- UX 흐름 설계
- README 문서화
- 포트폴리오 정리
- 코드 검증 및 개선 방향 정리

AI를 단순 코드 생성 도구로 사용한 것이 아니라,  
설계 → 구현 → 검증 → 정리 단계에서 각각 역할을 분리하여 활용하였습니다.

<br />

---

# ⚠ Limitations

- 실제 브랜드 API 연동 미구현
- 실제 AI 모델 연결 이전 단계
- 로그인 및 DB 연동 미구현
- 추천 알고리즘 고도화 필요
- 모바일 UI 추가 최적화 필요

<br />

---

# 📈 Future Improvements

- 실제 AI API 연동
- 사용자 계정 기능
- 브랜드별 데이터 학습 구조
- 즐겨찾기 기능
- 추천 정확도 개선
- 차트 기반 비교 UI 추가
- 실제 상품 데이터 연동

<br />

---

# 💡 What I Learned

이번 프로젝트를 통해 단순 퍼블리싱을 넘어,  
실제 서비스 흐름을 고려한 프론트엔드 구조 설계 경험을 할 수 있었습니다.

특히:
- App Router 기반 구조 설계
- Feature 기반 폴더 구조 설계
- Zustand 상태 관리
- TanStack Query 데이터 흐름 구성
- Mock API 기반 비동기 처리
- 재사용 가능한 컴포넌트 설계
- 사용자 흐름 중심 UX 설계

등을 직접 고민하며 구현하였습니다.

또한 Cursor / Codex / ChatGPT를 상황에 맞게 역할 분리하여 활용하며,  
AI 기반 개발 환경에서도 구조를 직접 판단하고 검증하는 경험을 쌓을 수 있었습니다.

<br />

---

# 🖥 Installation

```bash
npm install
npm run dev
```

<br />

---

# 🔗 Links

## GitHub
```bash
https://github.com/Bumjun-hub/Project-S/
```

## Deploy
```bash
Deploy Link
```
