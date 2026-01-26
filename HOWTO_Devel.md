# ✈️ FLIGHT TRACKER 3D 제작 과정 (Development Process)

이 문서는 **FLIGHT TRACKER 3D** 웹 애플리케이션의 상세 제작 과정을 기록한 기술 문서입니다.  
OpenSky Network의 실시간 항공 데이터와 Three.js 기반의 3D 지구본 시각화 기술을 결합하여 제작되었습니다.

---

## 1. 📋 기획 및 요구사항 분석 (Planning)

### 1.1 목표 (Goal)
- **전 세계 실시간 항공기 추적**: OpenSky Network API를 활용하여 실제 운항 중인 항공기 데이터를 수집.
- **3D 시각화**: 2D 지도가 아닌 3D 지구본 위에서 비행 경로와 고도를 직관적으로 표현.
- **사이버펑크 디자인**: 네온 그린(#00ff00)과 어두운 배경을 기반으로 한 미래 지향적 UI.

### 1.2 핵심 기능 정의
1.  **3D Globe 렌더링**: 지구본 생성, 회전, 줌인/아웃.
2.  **실시간 데이터 연동**: 10초 단위로 항공기 위치 업데이트.
3.  **필터 시스템**: 지역별(한국, 아시아, 전세계) 및 고도별 필터링.
4.  **인터랙티브 UI**: 항공기 클릭 시 상세 정보(콜사인, 속도, 고도 등) 팝업 제공.

---

## 2. 🛠 기술 스택 (Tech Stack)

### Fronend
-   **HTML5 / CSS3**: 구조 및 스타일링 (Vanilla CSS).
-   **JavaScript (ES6+)**: 핵심 로직 구현.
-   **Three.js**: 3D 그래픽 렌더링 엔진.
-   **Globe.gl**: Three.js 기반의 지구본 시각화 라이브러리.

### Backend (Proxy Server)
-   **Node.js**: 자바스크립트 런타임.
-   **Express**: 웹 서버 프레임워크.
-   **CORS Middleware**: 브라우저 보안 정책(CORS) 우회 및 API 키 보호.
-   **Axios / HTTPS**: 외부 API 요청 처리.

### Data
-   **OpenSky Network API**: 항공기 상태 벡터(위치, 속도, 고도) 데이터 제공.
-   **Korean Airport API**: (옵션) 한국 공항 관련 공공 데이터.

---

## 3. 🚀 제작 단계별 진행 (Step-by-Step)

### 3.1 1단계: 프로젝트 환경 설정
-   `package.json` 초기화 (`npm init`).
-   필요한 패키지 설치:
    ```bash
    npm install express dotenv three globe.gl
    ```
-   GitHub 리포지토리 생성 및 `.gitignore` 설정 (node_modules, .env 제외).

### 3.2 2단계: 백엔드 프록시 서버 구현 (`server.js`)
API 키 노출을 막고 CORS(Cross-Origin Resource Sharing) 문제를 해결하기 위해 Node.js 프록시 서버를 구축했습니다.
1.  **Express 서버 설정**: 3000번 포트에서 요청 대기.
2.  **OpenSky API 프록시**:
    -   클라이언트(`/api/states/all`) → 서버 → OpenSky API 요청.
    -   API 응답을 그대로 클라이언트에 전달하며 CORS 헤더(`Access-Control-Allow-Origin: *`) 추가.
3.  **정적 파일 서빙**: `index.html`, `app.js` 등 프론트엔드 파일을 서빙하도록 설정.

### 3.3 3단계: 프론트엔드 3D 지구본 구현 (`app.js`)
`globe.gl` 라이브러리를 사용하여 시각화의 기초를 다졌습니다.
1.  **Globe 초기화**:
    ```javascript
    const Globe = new Globe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      (document.getElementById('globeViz'));
    ```
2.  **카메라 제어**: 초기 시점을 한국 상공으로 설정하고 자동 회전 기능을 추가했습니다.

### 3.4 4단계: 실시간 데이터 매핑 (Data Mapping)
API로부터 받아온 데이터를 3D 객체로 변환하여 지구본 위에 표시했습니다.
1.  **데이터 패칭**: `fetch('/api/states/all')`를 통해 프록시 서버로부터 데이터 수신.
2.  **데이터 가공**: API의 배열 형태 데이터를 객체 배열로 변환 (Callsign, Lat, Lng, Altitude 등 추출).
3.  **HTML 마커 렌더링**:
    -   비행기 아이콘(FontAwesome)을 사용하여 각 좌표에 배치.
    -   항공기 방향(`true_track`)에 따라 아이콘 회전(`transform: rotate(...)`).
    -   고도(`baro_altitude`)에 따라 지구본 표면에서의 높이 계산.

### 3.5 5단계: UI/UX 디자인 및 인터랙션
사용자 경험을 높이기 위해 사이버펑크 스타일을 적용했습니다.
1.  **스타일링 (`styles.css`)**:
    -   전체 배경을 어둡게 처리하고, 주요 텍스트와 테두리에 네온 그린 컬러 사용.
    -   패널에 `backdrop-filter: blur(10px)`를 적용하여 유리 같은 질감(Glassmorphism) 구현.
2.  **이벤트 처리**:
    -   항공기 마우스 오버 시 툴팁 표시.
    -   클릭 시 상세 정보 팝업창 띄우기 (FlightAware 링크 연동).
    -   지역 버튼 클릭 시 해당 좌표로 카메라 이동 및 데이터 필터링.

---

## 4. 💡 주요 이슈 및 해결 (Troubleshooting)

### Q1. CORS 오류 발생
**문제**: 브라우저에서 직접 OpenSky API를 호출하면 CORS 정책으로 인해 차단됨.
**해결**: Node.js 백엔드를 중계 서버로 활용. 브라우저는 Node.js 서버와 통신하고, Node.js 서버가 API와 통신하는 구조로 변경하여 해결.

### Q2. 성능 최적화 (Rendering Lag)
**문제**: 전 세계 수천 대의 항공기를 한 번에 렌더링하면 브라우저가 느려짐.
**해결**:
1.  **지역 필터링**: 기본 보기 모드를 '한국' 또는 '동아시아'로 제한하여 렌더링 개수 조절.
2.  **HTML Elements 최적화**: 불필요한 DOM 조작을 줄이고, 화면 밖의 요소는 렌더링 부하를 줄임.

### Q3. API 호출 제한 (Rate Limit)
**문제**: OpenSky 데이터는 무료 계정 사용 시 호출 제한이 있음.
**해결**:
1.  **캐싱 전략**: (고려 사항) 짧은 시간 내 중복 요청 시 서버 메모리에 저장된 마지막 데이터 반환.
2.  **자동 업데이트 주기 조정**: 10초 주기로 설정하여 안정적인 데이터 흐름 유지.

---

## 5. 🔮 향후 발전 계획 (Future Roadmap)
-   **비행 경로 시각화**: 과거 데이터를 기반으로 비행 궤적(Trail) 표시.
-   **공항 데이터 연동**: 출발지 및 도착지 공항 정보를 3D 아크(Arc)로 연결.
-   **3D 모델 고도화**: 단순 아이콘 대신 실제 항공기 3D 모델(GLTF/GLB) 적용 검토.

---

**작성자**: Jinho Jung  
**작성일**: 2026-01-27
