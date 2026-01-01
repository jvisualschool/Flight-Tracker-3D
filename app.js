// Three.js와 globe.gl은 전역 변수로 로드됨 (CDN)
// window.THREE와 window.Globe 사용

// OpenSky Network API 설정 (Cloudflare Worker 프록시 사용)
const OPENSKY_API_BASE = 'https://opensky-proxy.phploveme.workers.dev';
// Basic Auth (프록시 서버에서 처리됨)
const CLIENT_ID = '';
const CLIENT_SECRET = '';
// Basic Auth 헤더 (프록시 서버 호출 시 필요 없음)
const BASIC_AUTH = '';

// 주요 도시 목록 (위도, 경도, 이름)
const MAJOR_CITIES = [
    // 한국
    { lat: 37.5665, lng: 126.9780, name: '서울', country: '한국' },
    { lat: 37.4563, lng: 126.7052, name: '인천', country: '한국' },
    { lat: 35.1796, lng: 129.0756, name: '부산', country: '한국' },
    { lat: 35.1595, lng: 126.8526, name: '광주', country: '한국' },
    { lat: 33.4996, lng: 126.5312, name: '제주', country: '한국' },
    { lat: 36.0322, lng: 129.3650, name: '포항', country: '한국' },
    { lat: 37.7519, lng: 128.8761, name: '강릉', country: '한국' },
    { lat: 36.6424, lng: 127.4890, name: '청주', country: '한국' },
    { lat: 37.4844, lng: 130.9056, name: '울릉도', country: '한국' },
    { lat: 37.2417, lng: 131.8650, name: '독도', country: '한국' },
    // 아시아
    { lat: 35.6762, lng: 139.6503, name: '도쿄', country: '일본' },
    { lat: 31.2304, lng: 121.4737, name: '상하이', country: '중국' },
    { lat: 39.9042, lng: 116.4074, name: '베이징', country: '중국' },
    { lat: 22.3193, lng: 114.1694, name: '홍콩', country: '중국' },
    { lat: 1.3521, lng: 103.8198, name: '싱가포르', country: '싱가포르' },
    { lat: 13.7563, lng: 100.5018, name: '방콕', country: '태국' },
    { lat: 19.0760, lng: 72.8777, name: '뭄바이', country: '인도' },
    { lat: 28.6139, lng: 77.2090, name: '뉴델리', country: '인도' },
    { lat: 25.2048, lng: 55.2708, name: '두바이', country: 'UAE' },
    // 유럽
    { lat: 51.5074, lng: -0.1278, name: '런던', country: '영국' },
    { lat: 48.8566, lng: 2.3522, name: '파리', country: '프랑스' },
    { lat: 52.5200, lng: 13.4050, name: '베를린', country: '독일' },
    { lat: 50.1109, lng: 8.6821, name: '프랑크푸르트', country: '독일' },
    { lat: 41.9028, lng: 12.4964, name: '로마', country: '이탈리아' },
    { lat: 40.4168, lng: -3.7038, name: '마드리드', country: '스페인' },
    { lat: 59.9343, lng: 10.7161, name: '오슬로', country: '노르웨이' },
    { lat: 55.7558, lng: 37.6173, name: '모스크바', country: '러시아' },
    { lat: 59.3293, lng: 18.0686, name: '스톡홀름', country: '스웨덴' },
    { lat: 52.3676, lng: 4.9041, name: '암스테르담', country: '네덜란드' },
    // 북미
    { lat: 40.7128, lng: -74.0060, name: '뉴욕', country: '미국' },
    { lat: 34.0522, lng: -118.2437, name: '로스앤젤레스', country: '미국' },
    { lat: 41.8781, lng: -87.6298, name: '시카고', country: '미국' },
    { lat: 29.7604, lng: -95.3698, name: '휴스턴', country: '미국' },
    { lat: 43.6532, lng: -79.3832, name: '토론토', country: '캐나다' },
    { lat: 45.5017, lng: -73.5673, name: '몬트리올', country: '캐나다' },
    { lat: 19.4326, lng: -99.1332, name: '멕시코시티', country: '멕시코' },
    // 남미
    { lat: -23.5505, lng: -46.6333, name: '상파울루', country: '브라질' },
    { lat: -34.6037, lng: -58.3816, name: '부에노스아이레스', country: '아르헨티나' },
    // 오세아니아
    { lat: -33.8688, lng: 151.2093, name: '시드니', country: '호주' },
    { lat: -37.8136, lng: 144.9631, name: '멜버른', country: '호주' },
    { lat: -36.8485, lng: 174.7633, name: '오클랜드', country: '뉴질랜드' },
    // 아프리카
    { lat: -26.2041, lng: 28.0473, name: '요하네스버그', country: '남아프리카' },
    { lat: 30.0444, lng: 31.2357, name: '카이로', country: '이집트' }
];

// 지역 필터 설정
const REGIONS = {
    'world': { name: '전 세계', credits: 4, bounds: null },
    'korea': { name: '한국', credits: 1, bounds: { lamin: 33, lamax: 43, lomin: 124, lomax: 132 } },
    'east-asia': { name: '동아시아', credits: 2, bounds: { lamin: 20, lamax: 50, lomin: 100, lomax: 150 } },
    'europe': { name: '유럽', credits: 3, bounds: { lamin: 35, lamax: 70, lomin: -10, lomax: 40 } },
    'north-america': { name: '북미', credits: 3, bounds: { lamin: 25, lamax: 50, lomin: -125, lomax: -65 } }
};

// 항공사 코드 매핑 (일부 주요 항공사)
const AIRLINE_NAMES = {
    'KE': '대한항공',
    'OZ': '아시아나항공',
    'DL': '델타항공',
    'AA': '아메리칸항공',
    'UA': '유나이티드항공',
    'LH': '루프트한자',
    'BA': '브리티시항공',
    'AF': '에어프랑스',
    'JL': '일본항공',
    'NH': '전일본공수',
    'CA': '에어차이나',
    'CZ': '차이나사우던',
    'SQ': '싱가포르항공',
    'TG': '타이항공',
    'QF': '콴타스항공',
    'EK': '에미레이트항공',
    'QR': '카타르항공',
    'TK': '터키항공',
    'KL': 'KLM',
    'LX': '스위스항공',
    'AS': '알래스카항공',
    'WN': '사우스웨스트항공',
    'B6': '제트블루',
    'VS': '버진 애틀랜틱',
    'AC': '에어캐나다'
};

// 전역 변수
let globe;
let accessToken = null;
let tokenExpiry = null;
let currentRegion = 'korea'; // 기본값: 한국
let minAltitude = 0;
let autoUpdateInterval = null;
let isAutoUpdateEnabled = false; // 기본값: 자동 업데이트 끄기
let useHighResImage = true; // 고해상도 이미지 사용 여부 (기본값: true)
let showCityLabels = true; // 도시 레이블 표시 여부 (기본값: true)
let aircraftData = [];
let filteredAircraftData = [];

// DOM 요소
const authStatus = document.getElementById('auth-status');
const statusIndicator = document.getElementById('status-indicator');
const authText = document.getElementById('auth-text');
const aircraftCount = document.getElementById('aircraft-count');
const lastUpdate = document.getElementById('last-update');
const searchInput = document.getElementById('search-input');
const regionButtons = document.querySelectorAll('.region-btn');
const minAltitudeInput = document.getElementById('min-altitude');
const highResToggle = document.getElementById('high-res-toggle');
const cityLabelsToggle = document.getElementById('city-labels-toggle');
const refreshBtn = document.getElementById('refresh-btn');
const autoUpdateToggle = document.getElementById('auto-update-toggle');
const rotateToggle = document.getElementById('rotate-toggle');
const aircraftPopup = document.getElementById('aircraft-popup');
const closePopup = document.getElementById('close-popup');
const loadingOverlay = document.getElementById('loading-overlay');
const aircraftTooltip = document.getElementById('aircraft-tooltip');
const tooltipContent = aircraftTooltip?.querySelector('.tooltip-content');
const splashTrigger = document.getElementById('splash-trigger');
const splashModal = document.getElementById('splash-modal');
const closeSplash = document.getElementById('close-splash');

// Basic Auth 인증 (OAuth2 대신 사용)
async function getAccessToken() {
    try {
        authText.textContent = 'Basic Auth 사용 중...';
        console.log('=== Basic Auth 인증 설정 ===');

        // Basic Auth는 토큰이 필요 없음 - 바로 인증됨으로 표시
        accessToken = BASIC_AUTH;
        tokenExpiry = Date.now() + (60 * 60 * 1000); // 1시간

        console.log('Basic Auth 설정 완료');
        updateAuthStatus(true);
        return accessToken;
    } catch (error) {
        console.error('인증 설정 오류:', error);
        authText.textContent = '인증 설정 오류';
        updateAuthStatus(false);
        throw error;
    }
}

// 토큰 갱신 확인
async function ensureValidToken() {
    if (!accessToken || !tokenExpiry || Date.now() >= tokenExpiry) {
        await getAccessToken();
    }
    return accessToken;
}

// 인증 상태 업데이트
function updateAuthStatus(authenticated) {
    if (authenticated) {
        statusIndicator.classList.add('authenticated');
        authText.textContent = '인증됨';
    } else {
        statusIndicator.classList.remove('authenticated');
        authText.textContent = '인증 실패';
    }
}

// OpenSky API 호출
async function fetchAircraftData() {
    try {
        await ensureValidToken();

        showLoading(true);

        const region = REGIONS[currentRegion];
        // Cloudflare Worker 프록시를 통해 OpenSky API 호출
        let url = OPENSKY_API_BASE + '/states/all';

        // 지역 필터가 있으면 bounds 추가
        if (region.bounds) {
            const params = new URLSearchParams(region.bounds);
            url += `?${params.toString()}`;
        }

        console.log('API 요청 URL:', url);
        console.log('인증:', 'Basic Auth 사용');

        // 타임아웃 설정 (30초)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.error('API 요청 타임아웃 (30초)');
            controller.abort();
        }, 30000);

        let response;
        try {
            // 인증 없이 호출 (OpenSky 무료 API 사용)
            response = await fetch(url, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error('Fetch 오류:', fetchError);
            if (fetchError.name === 'AbortError') {
                throw new Error('API 요청 타임아웃: 서버 응답이 없습니다.');
            }
            throw new Error(`네트워크 오류: ${fetchError.message}`);
        }

        console.log('API 응답 상태:', response.status, response.statusText);
        console.log('API 응답 헤더:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text().catch(() => '응답 본문 읽기 실패');
            console.error('API 오류 응답:', errorText);
            if (response.status === 401) {
                // 토큰 만료, 재인증
                await getAccessToken();
                return fetchAircraftData();
            }
            throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API 응답 데이터:', data);
        console.log('항공기 수:', data.states ? data.states.length : 0);

        // 항공기 데이터 파싱
        if (data.states && Array.isArray(data.states)) {
            aircraftData = data.states.map(state => {
                // OpenSky API 응답 형식:
                // [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, 
                //  baro_altitude, on_ground, velocity, true_track, vertical_rate, sensors, geo_altitude, 
                //  squawk, spi, position_source]
                const callsign = state[1]?.trim() || 'N/A';
                // callsign에서 항공사 코드 추출 (일반적으로 처음 2-3자)
                const airlineCode = callsign.length >= 2 ? callsign.substring(0, 2).toUpperCase() : '';
                // 항공사 코드로 항공사명 조회
                const airlineName = AIRLINE_NAMES[airlineCode] || airlineCode || 'Unknown';

                return {
                    icao24: state[0],
                    callsign: callsign,
                    country: state[2] || 'Unknown',
                    longitude: state[5],
                    latitude: state[6],
                    altitude: state[7] || state[13] || 0, // baro_altitude or geo_altitude
                    velocity: state[9] || 0, // m/s
                    heading: state[10] || 0, // true_track
                    onGround: state[8] || false,
                    lastContact: state[4] || 0,
                    airlineCode: airlineCode,
                    airlineName: airlineName
                };
            }).filter(aircraft =>
                aircraft.longitude != null &&
                aircraft.latitude != null &&
                !aircraft.onGround
            );

            applyFilters();
            updateGlobe();
            updateStats();
            console.log('항공기 데이터 처리 완료. 필터링된 항공기 수:', filteredAircraftData.length);
        } else {
            console.warn('API 응답에 states 배열이 없습니다:', data);
        }

        showLoading(false);
        return data;
    } catch (error) {
        console.error('항공기 데이터 가져오기 오류:', error);
        console.error('오류 상세:', error.message, error.stack);
        showLoading(false);
        updateAuthStatus(false);
    }
}

// 검색어 변수
let searchQuery = '';

// 필터 적용
function applyFilters() {
    filteredAircraftData = aircraftData.filter(aircraft => {
        // 고도 필터
        if (aircraft.altitude < minAltitude) {
            return false;
        }

        // 검색 필터
        if (searchQuery && searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            const callsign = (aircraft.callsign || '').toLowerCase();
            const airlineCode = (aircraft.airlineCode || '').toLowerCase();
            const country = (aircraft.country || '').toLowerCase();

            return callsign.includes(query) ||
                airlineCode.includes(query) ||
                country.includes(query);
        }

        return true;
    });
}

// Globe 업데이트
function updateGlobe() {
    if (!globe) return;

    // 최고 고도 항공기 찾기 (스케일 정규화용)
    const maxAltitude = filteredAircraftData.length > 0
        ? Math.max(...filteredAircraftData.map(a => a.altitude))
        : 12000; // 기본값 12km

    // 지구 반지름 (km)
    const EARTH_RADIUS_KM = 6371;

    // 최고 고도 항공기가 지구 반지름의 약 1%로 보이도록 스케일 조정
    // 실제 항공기 최고 고도는 약 12km (지구 반지름의 0.19%)
    // 시각적으로 보기 좋게 1%로 설정 (적절한 길이)
    const maxVisualAltitude = EARTH_RADIUS_KM * 0.01; // 지구 반지름의 1%
    const scaleFactor = maxVisualAltitude / maxAltitude;

    // HTML 오버레이 데이터 생성 (Font Awesome 아이콘)
    const htmlElements = filteredAircraftData.map(aircraft => {
        const altitudeKm = (aircraft.altitude / 1000).toFixed(1);
        const speedKmh = Math.round(aircraft.velocity * 3.6);
        const heading = Math.round(aircraft.heading);

        return {
            lat: aircraft.latitude,
            lng: aircraft.longitude,
            // 고도를 지구 반지름 대비 비율로 계산하고 스케일 적용
            altitude: (aircraft.altitude / 1000) * scaleFactor / EARTH_RADIUS_KM,
            color: getAircraftColor(aircraft),
            // 롤오버 시 표시할 정보
            label: `${aircraft.callsign}\n고도: ${altitudeKm}km\n속도: ${speedKmh}km/h\n방향: ${heading}°\n국가: ${aircraft.country}`,
            aircraft: aircraft
        };
    });

    // 포인트는 숨기고 HTML 오버레이만 사용
    globe.pointsData([]);

    // 도시 레이블 추가 (HTML 요소로 한글 지원)
    if (showCityLabels) {
        const cityElements = MAJOR_CITIES.map(city => ({
            lat: city.lat,
            lng: city.lng,
            city: city
        }));

        // 기존 항공기 요소와 도시 요소 합치기
        const allElements = [...htmlElements, ...cityElements];
        globe.htmlElementsData(allElements);
    } else {
        globe.htmlElementsData(htmlElements);
    }
}

// 항공기 색상 결정 (고도에 따라) - 눈에 편안한 색상
function getAircraftColor(aircraft) {
    const altitude = aircraft.altitude;
    if (altitude > 10000) return '#a8d5e2'; // 부드러운 하늘색 - 고고도
    if (altitude > 5000) return '#b8d4f0';  // 부드러운 파란색 - 중고도
    return '#c4e3d4'; // 부드러운 민트색 - 저고도
}

// 통계 업데이트
function updateStats() {
    aircraftCount.textContent = filteredAircraftData.length;
    const now = new Date();
    lastUpdate.textContent = now.toLocaleTimeString('ko-KR');
}

// Globe 초기화
function initGlobe() {
    try {
        console.log('Globe 초기화 시작...');
        console.log('window.THREE:', typeof window.THREE);
        console.log('window.Globe:', typeof window.Globe);

        const container = document.getElementById('globe-container');
        if (!container) {
            throw new Error('globe-container 요소를 찾을 수 없습니다');
        }
        console.log('Container 찾음:', container);

        // Three.js 확인
        if (typeof window.THREE === 'undefined') {
            throw new Error('Three.js가 로드되지 않았습니다. CDN에서 로드 중...');
        }

        // Globe 확인
        if (typeof window.Globe === 'undefined') {
            throw new Error('globe.gl이 로드되지 않았습니다. CDN에서 로드 중...');
        }

        console.log('Globe 함수 호출 중...');
        // globe.gl은 전역 변수로 사용
        // 고해상도 지구본 이미지 옵션:
        // 1. 로컬 NASA Blue Marble 고해상도 이미지 (다운로드됨, CORS 없음)
        // 2. 기본 Blue Marble (CDN, 빠른 로딩)
        // 참고: OpenStreetMap 타일은 직접 사용 불가 (globe.gl은 단일 이미지 URL만 지원)

        // 초기 이미지 URL 설정
        const globeImageUrl = useHighResImage
            ? './images/earth-high-res.jpg'  // 고해상도 (5400x2700, 2.4MB)
            : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';  // 기본 (빠른 로딩)

        globe = window.Globe()
            .globeImageUrl(globeImageUrl)
            .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
            .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
            .showAtmosphere(true)
            .atmosphereColor('#6496ff')
            .atmosphereAltitude(0.15)
            .pointColor('color')
            .pointAltitude('altitude')
            .pointRadius(0) // 막대기 숨기기
            .pointsMerge(false)
            .pointResolution(2)
            .htmlElementsData([]) // HTML 오버레이 초기화 (빈 배열)
            .htmlElement((d) => {
                // 도시 레이블인 경우
                if (d.city) {
                    const el = document.createElement('div');
                    el.innerHTML = `
                        <div style="
                            background: rgba(100, 150, 255, 0.7);
                            color: #ffffff;
                            padding: 2px 6px;
                            border-radius: 4px;
                            font-size: 11px;
                            font-weight: 500;
                            white-space: nowrap;
                            border: 1px solid rgba(100, 150, 255, 0.9);
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                            font-family: 'Segoe UI', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
                        ">
                            ${d.city.name}
                        </div>
                    `;
                    el.style.pointerEvents = 'auto';
                    el.style.cursor = 'default';
                    return el;
                }

                // 항공기 아이콘인 경우
                const el = document.createElement('div');
                const heading = d.aircraft?.heading || 0;
                // heading은 북쪽 기준 시계방향 각도이므로, CSS transform rotate 사용
                // 눈에 편안한 스타일: 부드러운 색상, 약간의 투명도, 그림자 제거
                el.innerHTML = `<i class="fas fa-plane" style="font-size: 20px; color: ${d.color}; opacity: 0.9; transform: rotate(${heading}deg);"></i>`;
                el.style.pointerEvents = 'auto';
                el.style.cursor = 'pointer';
                el.style.transition = 'transform 0.1s ease-out, opacity 0.2s ease-out';

                // 마우스 이벤트 추가
                el.addEventListener('mouseenter', () => {
                    el.style.opacity = '1';
                    if (d.aircraft) {
                        showAircraftTooltip(d.aircraft, d);
                    }
                });
                el.addEventListener('mouseleave', () => {
                    el.style.opacity = '0.9';
                    hideAircraftTooltip();
                });
                el.addEventListener('click', () => {
                    if (d.aircraft) {
                        showAircraftPopup(d.aircraft);
                    }
                });

                return el;
            })
            .enablePointerInteraction(true);

        console.log('Globe 인스턴스 생성됨:', globe);

        // DOM에 마운트
        globe(container);
        console.log('Globe DOM에 마운트 완료');

        // 자동 회전 설정 (controls를 통해)
        let isRotating = true;
        try {
            const controls = globe.controls();
            if (controls) {
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.1; // 회전 속도 감소 (0.3 -> 0.1)
                console.log('자동 회전 설정 완료 (속도: 0.1)');

                // 회전 토글 기능
                window.toggleRotation = function () {
                    isRotating = !isRotating;
                    controls.autoRotate = isRotating;
                    rotateToggle.textContent = isRotating ? '⏸️ 회전 정지' : '▶️ 회전 시작';
                    rotateToggle.classList.toggle('active', !isRotating);
                };
            } else {
                console.warn('controls를 가져올 수 없습니다');
            }
        } catch (error) {
            console.warn('자동 회전 설정 실패:', error);
        }

        // 초기 카메라 위치 설정 (한국 중심)
        try {
            globe.pointOfView({ lat: 36, lng: 127.5, altitude: 2.5 });
            console.log('카메라 위치 설정 완료 (한국 중심)');
        } catch (error) {
            console.warn('카메라 위치 설정 실패:', error);
        }

        console.log('Globe 초기화 완료');

    } catch (error) {
        console.error('Globe 초기화 오류 상세:', error);
        console.error('오류 스택:', error.stack);
        console.error('오류 이름:', error.name);
        console.error('오류 메시지:', error.message);
        throw error;
    }
}

// FlightAware 링크 열기
function openFlightAware(callsign) {
    if (!callsign || callsign === 'N/A') {
        console.warn('콜사인이 없어 FlightAware를 열 수 없습니다.');
        return;
    }

    // FlightAware URL 형식: https://ko.flightaware.com/live/flight/{callsign}
    const flightAwareUrl = `https://ko.flightaware.com/live/flight/${callsign}`;
    window.open(flightAwareUrl, '_blank');
    console.log('FlightAware 열기:', flightAwareUrl);
}

// 항공기 툴팁 표시 (롤오버)
function showAircraftTooltip(aircraft, point) {
    if (!aircraftTooltip || !tooltipContent) return;

    const altitudeKm = (aircraft.altitude / 1000).toFixed(1);
    const speedKmh = Math.round(aircraft.velocity * 3.6);
    const heading = Math.round(aircraft.heading);

    tooltipContent.innerHTML = `
        <strong>✈️ ${aircraft.callsign}</strong>
        항공사: ${aircraft.airlineName || aircraft.airlineCode || 'N/A'}
        국가: ${aircraft.country}
        고도: ${altitudeKm} km
        속도: ${speedKmh} km/h
        방향: ${heading}°
    `;

    aircraftTooltip.classList.add('active');
}

// 항공기 툴팁 숨기기
function hideAircraftTooltip() {
    if (aircraftTooltip) {
        aircraftTooltip.classList.remove('active');
    }
}

// 툴팁 위치 업데이트 (마우스 따라가기)
document.addEventListener('mousemove', (e) => {
    if (aircraftTooltip && aircraftTooltip.classList.contains('active')) {
        aircraftTooltip.style.left = (e.clientX + 15) + 'px';
        aircraftTooltip.style.top = (e.clientY + 15) + 'px';
    }
});

// 항공기 팝업 표시
function showAircraftPopup(aircraft) {
    document.getElementById('popup-callsign').textContent = aircraft.callsign;
    document.getElementById('popup-country').textContent = aircraft.country;
    document.getElementById('popup-altitude').textContent = `${Math.round(aircraft.altitude)} m`;
    document.getElementById('popup-velocity').textContent = `${Math.round(aircraft.velocity * 3.6)} km/h`;
    document.getElementById('popup-heading').textContent = `${Math.round(aircraft.heading)}°`;

    const popupAirline = document.getElementById('popup-airline');
    if (popupAirline) popupAirline.textContent = aircraft.airlineName || aircraft.airlineCode || 'N/A';

    // FlightAware 링크 열기
    openFlightAware(aircraft.callsign);

    aircraftPopup.classList.add('active');
}

// 팝업 닫기
closePopup.addEventListener('click', () => {
    aircraftPopup.classList.remove('active');
});

aircraftPopup.addEventListener('click', (e) => {
    if (e.target === aircraftPopup) {
        aircraftPopup.classList.remove('active');
    }
});

// 스플래시 모달 이벤트
if (splashTrigger && splashModal) {
    splashTrigger.addEventListener('click', () => {
        splashModal.classList.add('active');
    });
}

if (closeSplash && splashModal) {
    closeSplash.addEventListener('click', () => {
        splashModal.classList.remove('active');
    });
}

if (splashModal) {
    splashModal.addEventListener('click', (e) => {
        if (e.target === splashModal) {
            splashModal.classList.remove('active');
        }
    });
}

// 지역 필터 변경
regionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        regionButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRegion = btn.dataset.region;
        fetchAircraftData();
    });
});

// 최소 고도 필터 (드롭다운)
minAltitudeInput.addEventListener('change', (e) => {
    minAltitude = parseInt(e.target.value) || 0;
    applyFilters();
    updateGlobe();
    updateStats();
});

// 고해상도 이미지 토글
function updateGlobeImage() {
    if (!globe) return;

    const globeImageUrl = useHighResImage
        ? './images/earth-high-res.jpg'  // 고해상도 (5400x2700, 2.4MB)
        : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';  // 기본 (빠른 로딩)

    console.log('지구본 이미지 변경:', useHighResImage ? '고해상도' : '기본');
    globe.globeImageUrl(globeImageUrl);
}

if (highResToggle) {
    highResToggle.addEventListener('change', (e) => {
        useHighResImage = e.target.checked;
        updateGlobeImage();
    });

    // 초기 상태 설정
    highResToggle.checked = useHighResImage;
}

// 도시 레이블 토글
function updateCityLabels() {
    if (!globe) return;

    // HTML 요소로 도시를 표시하므로 updateGlobe를 호출하여 전체 업데이트
    updateGlobe();
    console.log('도시 레이블:', showCityLabels ? '표시' : '숨김');
}

if (cityLabelsToggle) {
    cityLabelsToggle.addEventListener('change', (e) => {
        showCityLabels = e.target.checked;
        updateCityLabels();
    });

    // 초기 상태 설정
    cityLabelsToggle.checked = showCityLabels;
}

// 검색 입력
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        applyFilters();
        updateGlobe();
        updateStats();
    });
}

// 검색 입력
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        applyFilters();
        updateGlobe();
        updateStats();
    });
}

// 새로고침 버튼
refreshBtn.addEventListener('click', () => {
    fetchAircraftData();
});

// 자동 업데이트 토글
autoUpdateToggle.addEventListener('click', () => {
    isAutoUpdateEnabled = !isAutoUpdateEnabled;

    if (isAutoUpdateEnabled) {
        startAutoUpdate();
        autoUpdateToggle.textContent = '⏸️ 자동 업데이트';
        autoUpdateToggle.classList.add('active');
    } else {
        stopAutoUpdate();
        autoUpdateToggle.textContent = '▶️ 자동 업데이트';
        autoUpdateToggle.classList.remove('active');
    }
});

// 회전 토글
if (rotateToggle) {
    rotateToggle.addEventListener('click', () => {
        if (window.toggleRotation) {
            window.toggleRotation();
        }
    });
}

// 자동 업데이트 시작
function startAutoUpdate() {
    stopAutoUpdate(); // 기존 인터벌 정리
    autoUpdateInterval = setInterval(() => {
        fetchAircraftData();
    }, 10000); // 10초마다
}

// 자동 업데이트 중지
function stopAutoUpdate() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        autoUpdateInterval = null;
    }
}

// 로딩 오버레이
function showLoading(show) {
    if (!loadingOverlay) {
        console.warn('loadingOverlay 요소를 찾을 수 없습니다.');
        return;
    }
    if (show) {
        loadingOverlay.classList.add('active');
        console.log('로딩 오버레이 표시');
    } else {
        loadingOverlay.classList.remove('active');
        console.log('로딩 오버레이 숨김');
    }
}

// 초기화
async function init() {
    console.log('FLIGHT TRACKER 3D 초기화 중...');
    console.log('현재 시간:', new Date().toISOString());

    // 스크립트 로딩 확인
    function waitForGlobe(maxAttempts = 50) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                console.log(`스크립트 로딩 확인 시도 ${attempts}/${maxAttempts}...`);
                console.log('window.THREE:', typeof window.THREE);
                console.log('window.Globe:', typeof window.Globe);

                if (typeof window.THREE !== 'undefined' && typeof window.Globe !== 'undefined') {
                    clearInterval(checkInterval);
                    console.log('스크립트 로딩 완료!');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    reject(new Error('스크립트 로딩 타임아웃: Three.js 또는 globe.gl이 로드되지 않았습니다'));
                }
            }, 100);
        });
    }

    // Globe 초기화
    try {
        console.log('스크립트 로딩 대기 중...');
        await waitForGlobe();
        console.log('Globe 초기화 시작...');
        initGlobe();
        console.log('Globe 초기화 성공!');
    } catch (error) {
        console.error('=== Globe 초기화 오류 상세 ===');
        console.error('오류 타입:', error.constructor.name);
        console.error('오류 메시지:', error.message);
        console.error('오류 스택:', error.stack);
        console.error('전체 오류 객체:', error);
        console.error('============================');
        authText.textContent = `Globe 초기화 실패: ${error.message}`;
        return;
    }

    // OAuth2 인증
    try {
        await getAccessToken();

        // 초기 데이터 로드
        await fetchAircraftData();

        // 자동 업데이트는 기본적으로 끄기 (사용자가 버튼으로 활성화 가능)
        // if (isAutoUpdateEnabled) {
        //     startAutoUpdate();
        // }

        // 버튼 텍스트 업데이트
        if (autoUpdateToggle) {
            autoUpdateToggle.textContent = '▶️ 자동 업데이트';
            autoUpdateToggle.classList.remove('active');
        }

        // 토큰 자동 갱신 (29분마다)
        setInterval(async () => {
            console.log('토큰 자동 갱신 중...');
            try {
                await getAccessToken();
            } catch (error) {
                console.error('토큰 갱신 실패:', error);
            }
        }, 29 * 60 * 1000);

    } catch (error) {
        console.error('초기화 오류:', error);
        // 에러 메시지는 getAccessToken에서 이미 설정됨
    }
}

// 페이지 로드 시 초기화
window.addEventListener('load', init);

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    stopAutoUpdate();
});

