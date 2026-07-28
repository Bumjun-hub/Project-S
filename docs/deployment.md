# Deployment

[← README](../README.md) · [Architecture](architecture.md) · [트러블슈팅](troubleshooting.md) · [개발 일지](development-log.md) · [로드맵](roadmap.md)

## 현재 배포 상태

Project S의 Frontend와 Backend는 VirtualBox의 Ubuntu Server에 컨테이너 없이 직접 배포했습니다. Java, Node.js, PostgreSQL, Apache, systemd를 사용하는 구성입니다.

> 이 저장소에는 Apache VirtualHost와 systemd unit 파일, 서버 버전·주소가 포함되어 있지 않습니다. 따라서 아래 문서는 코드에서 확인되는 실행 조건과 사용자가 밝힌 배포 구성을 분리해 기록하며, 확인되지 않은 값은 `TODO`로 표시합니다.

## 배포 구조

```text
Host Machine
└── VirtualBox
    └── Ubuntu Server
        ├── Apache : TODO (일반적으로 80/443)
        │   ├── /       ── Reverse Proxy ──▶ Next.js :3000
        │   └── /api/*  ── Reverse Proxy ──▶ Spring Boot :8080
        ├── systemd
        │   ├── Frontend Service ──────────▶ Node.js / Next.js
        │   └── Backend Service ───────────▶ Java / Spring Boot
        └── PostgreSQL :5432
```

동일한 출처에서 화면과 API를 제공하면 브라우저가 `/api/v1/...`를 Apache로 보내고, Apache가 해당 경로만 Spring Boot로 전달합니다. 현재 Frontend API Client도 환경변수가 없을 때 이 상대 경로 방식을 사용합니다.

## 구성 요소의 역할

| 구성 요소 | 역할 | 저장소에서 확인되는 내용 |
| --- | --- | --- |
| Ubuntu Server | 애플리케이션 운영 OS | 배포 사실은 사용자 제공, 버전 TODO |
| VirtualBox | Ubuntu 가상 머신 실행 | 네트워크 모드·버전 TODO |
| Java | Spring Boot 실행 | Java 17 Toolchain |
| Node.js | Next.js 빌드·실행 | 정확한 운영 버전 TODO |
| PostgreSQL | 운영 데이터 저장 | 기본 DB `project_s`, 기본 포트 5432 |
| Apache | Reverse Proxy | 실제 VirtualHost 파일 TODO |
| systemd | 프로세스 시작·재시작 관리 | 실제 unit 이름·내용 TODO |
| Spring Boot | REST API와 추천 엔진 | 기본 포트 8080 |
| Next.js | UI와 사용자 흐름 | 기본 포트 3000 |

## 실제 배포 과정

아래 순서는 현재 프로젝트를 Ubuntu에 수동 배포할 때 필요한 재현 절차입니다. 실제 사용한 패키지 설치 명령, 파일 배치 경로와 서비스 이름은 저장소만으로 확인할 수 없어 TODO로 남깁니다.

### 1. Ubuntu 가상 머신과 네트워크 준비

- VirtualBox에 Ubuntu Server 구성
- 외부 또는 호스트에서 서버에 접근할 수 있도록 네트워크 설정
- `TODO: Ubuntu/VirtualBox 버전, Adapter 모드, 서버 IP 기록`

### 2. 런타임과 데이터베이스 준비

- Java 17 설치 확인: `java -version`
- Node.js와 npm 설치 확인: `node --version`, `npm --version`
- PostgreSQL 설치 및 `project_s` 데이터베이스 생성
- `TODO: 실제 설치 버전과 설치 명령 기록`

### 3. 소스 준비

```bash
git clone https://github.com/Bumjun-hub/Project-S.git
cd Project-S
```

이미 서버에 저장소가 있다면 배포 대상 커밋을 확인한 뒤 갱신합니다. 운영 중인 서비스에 바로 변경을 적용하기 전에 빌드 성공 여부를 먼저 확인합니다.

### 4. Backend 빌드

```bash
cd backend
./gradlew clean build
```

운영 환경변수는 systemd unit 또는 별도 EnvironmentFile에서 주입해야 합니다.

```env
DB_URL=jdbc:postgresql://localhost:5432/project_s
DB_USERNAME=postgres
DB_PASSWORD=TODO
JWT_SECRET=TODO_USE_A_LONG_RANDOM_SECRET
JWT_ACCESS_TOKEN_EXPIRATION_MILLIS=3600000
```

비밀번호와 JWT Secret은 예시 설정 파일에도 실제 값을 기록하거나 Git에 커밋하지 않습니다.

### 5. Frontend 빌드

```bash
cd ../frontend
npm ci
npm run build
```

Apache가 `/api`를 Backend로 전달한다면 현재 기본값인 동일 출처 요청을 사용할 수 있습니다. Frontend와 API를 서로 다른 호스트로 제공할 경우 빌드 전에 `NEXT_PUBLIC_API_BASE_URL`을 설정해야 합니다.

### 6. systemd 등록

Backend의 실행 명령은 다음 형태입니다.

```bash
java -jar /TODO/project-s/backend/build/libs/TODO.jar
```

Frontend의 실행 명령은 다음 형태입니다.

```bash
npm run start -- --port 3000
```

- `TODO: 실제 WorkingDirectory, User, EnvironmentFile, ExecStart 기록`
- `TODO: 실제 frontend/backend unit 파일과 서비스 이름을 비밀값 제거 후 저장소에 추가`
- 자동 재시작 및 부팅 시 시작 여부는 실제 unit 설정 확인 필요

### 7. Apache Reverse Proxy 등록

필요한 Apache 기능은 Frontend와 API 요청을 각각 전달하는 Reverse Proxy입니다.

```apache
# 구조를 설명하기 위한 예시이며 실제 서버 설정이 아님
ProxyPass        /api/ http://127.0.0.1:8080/api/
ProxyPassReverse /api/ http://127.0.0.1:8080/api/
ProxyPass        /     http://127.0.0.1:3000/
ProxyPassReverse /     http://127.0.0.1:3000/
```

구체적인 ServerName, 포트, 활성화 모듈, 설정 경로는 실제 서버에서 확인 후 작성해야 합니다.

### 8. 배포 검증

```bash
curl http://127.0.0.1:8080/api/v1/health
curl http://127.0.0.1:3000
```

외부 주소에서도 다음 사용자 흐름을 확인합니다.

1. 회원가입과 로그인
2. Body Profile 저장
3. My Fit 저장
4. 상품 목록과 상세 조회
5. 추천 실행과 결과 확인

## 서비스 실행과 상태 확인

실제 unit 이름이 저장소에 없으므로 아래 이름은 자리표시자입니다.

```bash
sudo systemctl start TODO_FRONTEND_SERVICE
sudo systemctl start TODO_BACKEND_SERVICE
sudo systemctl status TODO_FRONTEND_SERVICE
sudo systemctl status TODO_BACKEND_SERVICE
```

로그 확인:

```bash
journalctl -u TODO_FRONTEND_SERVICE
journalctl -u TODO_BACKEND_SERVICE
```

Apache 설정을 변경했다면 문법을 검증한 다음 운영 절차에 따라 reload합니다.

## 저장소에서 추가로 확인할 항목

- [ ] Ubuntu, VirtualBox, Node.js, PostgreSQL, Apache 버전
- [ ] VirtualBox Network Adapter 모드와 접근 주소
- [ ] 실제 Apache VirtualHost와 활성화 모듈
- [ ] 실제 systemd unit 이름과 실행 사용자·경로
- [ ] 배포 URL, 포트 공개 범위, 방화벽 설정
- [ ] 배포 커밋과 배포 날짜
- [ ] Health API 및 주요 화면 검증 결과
- [ ] 민감 정보를 제거한 `deploy/` 예시 설정 추가

컨테이너 기반 배포 전환 계획은 [Roadmap](roadmap.md)을 참고합니다.
