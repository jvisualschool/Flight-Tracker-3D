// OpenSky Network API 프록시 서버 (CORS 해결)
const http = require('http');
const https = require('https');
const url = require('url');
const xml2js = require('xml2js');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const OPENSKY_API_BASE = 'https://opensky-network.org/api';
// OpenSky Network의 실제 OAuth2 엔드포인트
const OPENSKY_OAUTH_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
const CLIENT_ID = process.env.OPENSKY_CLIENT_ID || 'phploveme-api-client';
const CLIENT_SECRET = process.env.OPENSKY_CLIENT_SECRET || 'VJ6XKJUH1MyuNnayGcqRvGsS1PKZ2Tn1';

// CORS 헤더 추가
function setCORSHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// OAuth2 토큰 발급 프록시
function handleOAuthToken(req, res) {
    if (req.method === 'OPTIONS') {
        setCORSHeaders(res);
        res.writeHead(200);
        res.end();
        return;
    }

    console.log('OAuth2 토큰 요청 받음');

    const postData = new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).toString();

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 10000 // 10초 타임아웃
    };

    const proxyReq = https.request(OPENSKY_OAUTH_URL, options, (proxyRes) => {
        console.log(`OAuth2 응답 상태: ${proxyRes.statusCode}`);

        setCORSHeaders(res);
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': proxyRes.headers['content-type'] || 'application/json'
        });

        let data = '';
        proxyRes.on('data', (chunk) => {
            data += chunk;
        });

        proxyRes.on('end', () => {
            console.log('OAuth2 응답 본문:', data.substring(0, 200));
            res.end(data);
        });
    });

    proxyReq.on('error', (error) => {
        console.error('OAuth2 프록시 오류:', error.message);
        setCORSHeaders(res);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });

    proxyReq.on('timeout', () => {
        console.error('OAuth2 요청 타임아웃');
        proxyReq.destroy();
        setCORSHeaders(res);
        if (!res.headersSent) {
            res.writeHead(504, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'OAuth2 요청 타임아웃' }));
        }
    });

    proxyReq.write(postData);
    proxyReq.end();
}

// OpenSky API 프록시
function handleAPIRequest(req, res, apiPath, queryParams) {
    if (req.method === 'OPTIONS') {
        setCORSHeaders(res);
        res.writeHead(200);
        res.end();
        return;
    }

    const authHeader = req.headers.authorization;
    console.log(`[${new Date().toISOString()}] API 요청 경로: ${apiPath}`);
    console.log(`인증 헤더: ${authHeader ? '있음 (' + authHeader.substring(0, 20) + '...)' : '없음'}`);
    console.log(`요청 메서드: ${req.method}`);
    console.log(`요청 URL: ${req.url}`);

    let fullUrl = `${OPENSKY_API_BASE}${apiPath}`;
    if (queryParams) {
        fullUrl += '?' + queryParams;
    }

    console.log(`전체 URL: ${fullUrl}`);

    const options = {
        headers: {
            'User-Agent': 'FlightTracker3D/1.0'
        }
    };

    if (authHeader) {
        options.headers['Authorization'] = authHeader;
    }

    const proxyReq = https.get(fullUrl, options, (proxyRes) => {
        console.log(`API 응답 상태: ${proxyRes.statusCode}`);
        console.log(`응답 Content-Length: ${proxyRes.headers['content-length'] || 'unknown'}`);

        // 헤더가 이미 전송되지 않았는지 확인
        if (res.headersSent) {
            console.error('응답 헤더가 이미 전송됨 - 스킵');
            return;
        }

        // CORS 헤더 설정
        setCORSHeaders(res);

        // 크레딧 정보 전달
        const rateLimitHeaders = [
            'x-ratelimit-remaining',
            'x-rate-limit-remaining',
            'x-ratelimitremaining',
            'ratelimit-remaining',
            'rate-limit-remaining'
        ];

        const responseHeaders = {
            'Content-Type': proxyRes.headers['content-type'] || 'application/json'
        };

        for (const headerName of rateLimitHeaders) {
            if (proxyRes.headers[headerName]) {
                responseHeaders['X-RateLimit-Remaining'] = proxyRes.headers[headerName];
                console.log(`크레딧 헤더 발견: ${headerName} = ${proxyRes.headers[headerName]}`);
                break;
            }
        }

        try {
            // 응답 헤더 전송
            res.writeHead(proxyRes.statusCode, responseHeaders);

            // 응답 데이터 파이프
            proxyRes.pipe(res);

            proxyRes.on('end', () => {
                console.log('프록시 응답 스트림 종료');
            });
        } catch (headerError) {
            console.error('헤더 전송 오류:', headerError);
            if (!res.headersSent) {
                setCORSHeaders(res);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '서버 오류' }));
            }
        }
    });

    proxyReq.on('error', (error) => {
        console.error('API 프록시 요청 오류:', error);
        setCORSHeaders(res);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
        }
        res.end(JSON.stringify({ error: error.message }));
    });

    // 타임아웃 설정 (60초)
    proxyReq.setTimeout(60000, () => {
        console.error('API 프록시 요청 타임아웃');
        proxyReq.destroy();
        if (!res.headersSent) {
            setCORSHeaders(res);
            res.writeHead(504, { 'Content-Type': 'application/json' });
        }
        res.end(JSON.stringify({ error: 'Gateway Timeout' }));
    });
}

// 한국 공항 공공 데이터 API 프록시
function handleKoreanAirportAPI(req, res, apiPath, queryParams) {
    if (req.method === 'OPTIONS') {
        setCORSHeaders(res);
        res.writeHead(200);
        res.end();
        return;
    }

    // 공공데이터포털 API 엔드포인트
    // 인천국제공항공사 API: https://apis.data.go.kr
    // 한국공항공사 API: https://openapi.airport.co.kr (또는 apis.data.go.kr)

    // apiPath에서 서비스 ID 확인 (예: /B551177/...)
    let fullUrl;
    if (apiPath.startsWith('/B551177')) {
        // 인천국제공항공사 API (공공데이터포털)
        fullUrl = `https://apis.data.go.kr${apiPath}`;
    } else {
        // 한국공항공사 API (다른 엔드포인트일 수 있음)
        fullUrl = `https://openapi.airport.co.kr${apiPath}`;
    }

    if (queryParams) {
        fullUrl += '?' + queryParams;
    }

    console.log(`한국 공항 API URL: ${fullUrl}`);
    console.log(`원본 apiPath: ${apiPath}`);

    const options = {
        headers: {
            'User-Agent': 'FlightTracker3D/1.0',
            'Accept': 'application/json, application/xml, text/xml'
        }
    };

    const proxyReq = https.get(fullUrl, options, (proxyRes) => {
        console.log(`한국 공항 API 응답 상태: ${proxyRes.statusCode}`);
        console.log(`응답 Content-Type: ${proxyRes.headers['content-type']}`);

        setCORSHeaders(res);

        // XML 응답인 경우 JSON으로 변환
        const contentType = proxyRes.headers['content-type'] || '';
        if (contentType.includes('xml') || contentType.includes('text/xml')) {
            res.writeHead(proxyRes.statusCode, {
                'Content-Type': 'application/json'
            });

            let xmlData = '';
            proxyRes.on('data', (chunk) => {
                xmlData += chunk.toString();
            });

            proxyRes.on('end', () => {
                // XML을 JSON으로 변환
                const parser = new xml2js.Parser({
                    explicitArray: false,
                    mergeAttrs: true
                });

                parser.parseString(xmlData, (err, result) => {
                    if (err) {
                        console.error('XML 파싱 오류:', err);
                        res.end(JSON.stringify({ error: 'XML 파싱 실패', details: err.message }));
                    } else {
                        console.log('XML 파싱 성공:', JSON.stringify(result).substring(0, 200));
                        res.end(JSON.stringify(result));
                    }
                });
            });
        } else {
            res.writeHead(proxyRes.statusCode, {
                'Content-Type': proxyRes.headers['content-type'] || 'application/json'
            });
            proxyRes.pipe(res);
        }
    });

    proxyReq.on('error', (error) => {
        console.error('한국 공항 API 프록시 오류:', error);
        setCORSHeaders(res);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    });
}

// 서버 생성
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    console.log(`${req.method} ${path}`);

    // OAuth2 토큰 엔드포인트
    if (path === '/api/oauth/token' && req.method === 'POST') {
        handleOAuthToken(req, res);
    }
    // 이미지 프록시 (CORS 해결)
    else if (path.startsWith('/api/image-proxy/')) {
        const imageUrl = decodeURIComponent(path.replace('/api/image-proxy/', ''));
        console.log(`이미지 프록시 요청: ${imageUrl}`);

        if (!imageUrl || !imageUrl.startsWith('http')) {
            setCORSHeaders(res);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid image URL' }));
            return;
        }

        const parsedImageUrl = url.parse(imageUrl);
        const options = {
            hostname: parsedImageUrl.hostname,
            path: parsedImageUrl.path,
            headers: {
                'User-Agent': 'FlightTracker3D/1.0'
            }
        };

        const protocol = parsedImageUrl.protocol === 'https:' ? https : http;
        const proxyReq = protocol.get(options, (proxyRes) => {
            setCORSHeaders(res);
            res.writeHead(proxyRes.statusCode, {
                'Content-Type': proxyRes.headers['content-type'] || 'image/jpeg',
                'Cache-Control': 'public, max-age=86400' // 24시간 캐시
            });
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (error) => {
            console.error('이미지 프록시 오류:', error);
            setCORSHeaders(res);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        });
    }
    // 한국 공항 공공 데이터 API 프록시
    else if (path.startsWith('/api/korean-airport/')) {
        const apiPath = path.replace('/api/korean-airport', '');
        const queryParams = new URLSearchParams(parsedUrl.query).toString();
        console.log(`한국 공항 API 프록시 요청: ${path}`);
        handleKoreanAirportAPI(req, res, apiPath, queryParams);
    }
    // OpenSky API 프록시
    else if (path.startsWith('/api/')) {
        // /api/v1/states/all -> /v1/states/all
        const apiPath = path.replace(/^\/api/, '');
        const queryParams = new URLSearchParams(parsedUrl.query).toString();
        console.log(`프록시 요청: ${path} -> ${apiPath}`);
        handleAPIRequest(req, res, apiPath, queryParams);
    }
    // 정적 파일 서빙
    else {
        const fs = require('fs');
        const path = require('path');

        let filePath = '.' + parsedUrl.pathname;
        if (filePath === './') {
            filePath = './index.html';
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.wasm': 'application/wasm'
        };

        const contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1>', 'utf-8');
                } else {
                    res.writeHead(500);
                    res.end(`Server Error: ${error.code}`, 'utf-8');
                }
            } else {
                setCORSHeaders(res);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

server.on('error', (error) => {
    console.error('서버 오류:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`포트 ${PORT}가 이미 사용 중입니다.`);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`프록시 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`프록시 서버가 http://127.0.0.1:${PORT} 에서 실행 중입니다.`);
    console.log('OpenSky Network API 프록시가 활성화되었습니다.');
});

// 프로세스 오류 처리
process.on('uncaughtException', (error) => {
    console.error('처리되지 않은 예외:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('처리되지 않은 Promise 거부:', reason);
});

