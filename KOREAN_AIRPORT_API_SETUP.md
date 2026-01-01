# 한국 공항 공공 데이터 API 설정 가이드

## 한국공항공사 항공기 운항정보 API

**API 정보:**
- API 유형: REST
- 비용: 무료
- 심의유형: 개발단계 자동승인 / 운영단계 심의승인
- 이용허락범위: 저작자표시
- 상세기능: 공항 코드 정보 외 4건

**공공데이터포털 링크:**
- https://www.data.go.kr/dataset/15000126/openapi.do

## 1. API 키 발급

### 공공데이터포털 접속
1. https://www.data.go.kr 접속
2. 회원가입 및 로그인

### API 검색 및 신청
1. 검색창에 "한국공항공사 항공기 운항정보" 검색
2. "한국공항공사_항공기 운항정보" 선택
3. "활용신청" 클릭
4. 활용 목적 작성 후 신청
5. 승인 대기 (개발단계는 자동승인)

### 인증키 발급
1. 마이페이지 > 개발계정 > 인증키 확인
2. 인증키 복사

## 2. 코드 설정

### app.js 파일 수정
```javascript
// 한국 공항 공공 데이터 API 설정
const KOREAN_AIRPORT_API_KEY = '발급받은_API_키'; // 여기에 입력
const USE_KOREAN_AIRPORT_API = true; // true로 변경
```

## 3. 지원하는 정보

한국 공항 API를 통해 얻을 수 있는 정보:
- ✅ 출발 공항
- ✅ 도착 공항
- ✅ 항공편 상태
- ✅ 기종 정보 (일부 API)
- ✅ 출발/도착 시간

## 4. API 엔드포인트 예시

### 인천국제공항공사 API
- 출발 정보: `/B551177/StatusOfPassengerFlightsOdp/getPassengerDeparturesOdp`
- 도착 정보: `/B551177/StatusOfPassengerFlightsOdp/getPassengerArrivalsOdp`

### 한국공항공사 API
- 전국 14개 공항 운항 정보 제공
- 각 공항별 API 엔드포인트 다름

## 5. 주의사항

1. **API 키 보안**: API 키를 코드에 직접 입력하지 말고 환경 변수 사용 권장
2. **호출 제한**: 일일 호출 제한이 있을 수 있음
3. **응답 형식**: API마다 응답 형식이 다르므로 실제 API 문서 확인 필요
4. **한국 공항만**: 한국 공항의 항공기만 지원 (KE, OZ 등 한국 항공사)

## 6. 테스트

1. API 키 설정 후 `USE_KOREAN_AIRPORT_API = true`로 변경
2. 한국 항공사 항공기에 마우스 오버
3. 툴팁에서 출발/도착 공항 정보 확인

