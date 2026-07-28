# Roadmap

[← README](../README.md) · [Architecture](architecture.md) · [배포](deployment.md) · [트러블슈팅](troubleshooting.md) · [개발 일지](development-log.md)

Project S는 회원, 기준 의류, 상품, 추천까지 핵심 MVP 흐름을 구현했습니다. 아래 항목은 구현 완료가 아닌 향후 작업이며 우선순위는 운영 재현성, 안정성, 기능 확장 순으로 정리했습니다.

## 1. 배포 재현성과 보안

- [ ] Backend Dockerfile 작성
- [ ] Frontend Dockerfile 작성
- [ ] Docker Compose로 Frontend, Backend, PostgreSQL 구성
- [ ] 운영 Secret을 이미지와 저장소 밖에서 주입
- [ ] Apache와 애플리케이션 설정 예시를 `deploy/`에 추가
- [ ] HTTPS 인증서 적용과 HTTP → HTTPS Redirect
- [ ] 운영 환경 CORS와 Proxy Header 설정 검증

현재 Ubuntu에 직접 설치한 런타임과 경로 의존성을 컨테이너 선언으로 옮겨 다른 환경에서도 같은 방식으로 실행할 수 있도록 하는 것이 목표입니다.

## 2. CI/CD와 품질 관리

- [ ] GitHub Actions에서 Frontend Build와 Backend Test 자동 실행
- [ ] ESLint 설정 추가 및 `next lint`를 ESLint CLI로 전환
- [ ] Frontend 단위·컴포넌트·사용자 흐름 테스트 추가
- [ ] 배포 Artifact 생성 및 Ubuntu Server 자동 배포
- [ ] Health Check 기반 배포 검증과 실패 시 Rollback 전략 수립
- [ ] OpenAPI/Swagger 기반 API 문서 자동화

현재 Backend에는 단위·통합 테스트가 있지만 Frontend 자동화 테스트와 ESLint 설정은 확인되지 않습니다.

## 3. 추천 기능 고도화

- [ ] 브랜드별 사이즈 특성 반영
- [ ] 사용자 피드백과 실제 구매 결과 수집
- [ ] 카테고리·부위별 가중치 검증과 조정
- [ ] 추천 신뢰도 계산 개선
- [ ] Recommendation History를 Local Storage에서 DB 저장으로 전환
- [ ] 추천 결과 재조회와 사용자별 비교 기능

핵심 Calculator가 외부 의존성과 분리되어 있으므로 기존 API 흐름을 유지하면서 계산 규칙을 점진적으로 교체할 수 있습니다.

## 4. AI 연동

- [ ] 생성형 AI를 활용한 추천 이유 설명
- [ ] 자연어 기반 상품·스타일 탐색
- [ ] 사용자 질문을 반영한 대화형 추천
- [ ] AI 응답 실패, 비용, 지연과 개인정보 처리 정책 설계

AI는 기존 실측 기반 계산을 대체하기보다, 계산 결과를 설명하거나 탐색 조건을 구조화하는 보조 계층으로 검토합니다.

## 5. 운영과 관리자 기능

- [ ] 관리자 상품 등록·수정·삭제
- [ ] 상품 이미지 업로드와 저장소 연동
- [ ] 사용자·상품·추천 현황 관리 화면
- [ ] Redis Cache 적용 검토
- [ ] 구조화 로그, 지표, 오류 추적과 알림 구축
- [ ] Database Migration 도구 도입 검토

## 완료 기준

각 Roadmap 항목은 코드 작성만이 아니라 다음 조건을 함께 만족할 때 완료 처리합니다.

1. 실행 또는 배포 절차가 문서화되어 있음
2. 민감 정보가 저장소에 포함되지 않음
3. 핵심 성공·실패 경로가 테스트됨
4. 운영 환경에서 Health Check와 사용자 흐름을 검증함
5. 관련 문서와 개발 일지를 갱신함
