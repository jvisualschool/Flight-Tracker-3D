# ✈️ FLIGHT TRACKER 3D

전 세계 실시간 항공기 데이터를 3D 가상 지구본 위에 시각화하는 인터랙티브 웹 애플리케이션입니다.

## 🔗 Live Demo
**[https://jvibeschool.org/FLIGHT_TRACKER_3D/](https://jvibeschool.org/FLIGHT_TRACKER_3D/)**

## 🌐 서비스 개요 (Service Principle)

FLIGHT TRACKER 3D는 **OpenSky Network**에서 제공하는 실시간 항공기 상태(State Vectors) 데이터를 활용합니다. 전 세계의 지상 수신기(ADS-B)로부터 수집된 데이터를 API를 통해 가져와, 3D 공간 좌표로 변환하여 사용자가 직관적으로 비행 흐름을 파악할 수 있도록 서비스합니다.

- **데이터 수집**: OpenSky Network API를 통해 10초 주기로 최신 항공 정보 업데이트
- **데이터 처리**: Node.js 프록시 서버를 통해 인증 및 CORS 문제를 해결하고 데이터 가공
- **시각화**: Three.js와 globe.gl 라이브러리를 사용하여 고해상도 3D 지구본 위에 항공기 위치 및 방향 매핑

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Three.js**: WebGL 기반 3D 그래픽 렌더링
- **globe.gl**: 실시간 데이터 중심의 인터랙티브 지구본 라이브러리
- **Vanilla JS & CSS3**: 사이버펑크 스타일의 UI 및 애니메이션 구현
- **Font Awesome**: 시스템 아이콘

### Backend
- **Node.js**: 서버 사이드 런타임
- **Express**: API 프록시 서버 구축 (CORS 해결 및 보안 강화)
- **dotenv**: 환경 변수 관리

## ✨ 주요 기능 (Key Features)

- **3D 실시간 모니터링**: 고해상도 지구본 위에서 항공기의 위치, 고도, 방향을 실시간 확인
- **지역별 필터링**: 한국, 동아시아, 유럽, 북미 및 전 세계 데이터 선택 조회
- **정밀 검색**: 콜사인(Callsign), 항공사, 국가별 항공기 검색 기능
- **고도 필터링**: 비행구역(저고도~초고고도) 별 항공기 선별 보기
- **상세 정보 제공**: 항공기 클릭 시 고도, 속도, 방향 정보 팝업 및 FlightAware 연동 상세 경로 확인
- **반응형 UI**: 데스크톱 및 모바일 환경 최적화

## 👤 개발자 (Developer)

- **이름**: 정진호 (Jinho Jung)
- **웹사이트**: [jvibeschool.com](https://jvibeschool.com/)
- **개발 연도**: 2026

## 🚀 설치 및 실행 방법

1. 저장소 클론
```bash
git clone https://github.com/your-repo/flight-tracker-3d.git
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.example` 파일을 `.env`로 복사하고 OpenSky API 키를 설정합니다.

4. 서버 실행
```bash
npm start
```

## 📄 라이선스

본 프로젝트는 MIT 라이선스를 따릅니다. 데이터 소스인 OpenSky Network의 이용 약관을 준수합니다.
