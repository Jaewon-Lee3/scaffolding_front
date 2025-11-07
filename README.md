# Scafold Passage Frontend

Next.js(App Router) + Tailwind 기반의 내부용 관리자/선생님 포털입니다. 검색, 지문 상세, 요청 관리, 간단한 관리자 작업을 위한 UI를 제공합니다.

## 환경 변수
복사 후 수정하세요.
```bash
cp .env.example .env.local
```

| Key | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | FastAPI 백엔드 주소 (`/api` 프리픽스 포함) | `http://localhost:8000/api` |

토큰은 환경변수로 두지 않고, 화면 상단에서 직접 입력해 `localStorage`에 저장합니다. (관리자/선생님 고정 토큰을 `.env`에 정의해둔 백엔드와 연동)

## 로컬 실행
```bash
npm install
npm run dev
# http://localhost:3000 접속
```

## 주요 화면
- **검색 대시보드**: CC/지문/출처 기준 검색, 결과 복사, 상세 페이지 이동
- **신규 지문 요청**: 원본 지문과 메타데이터를 제출
- **상세 페이지**: 지문 본문, 참고자료(문제·답안) 복사 버튼
- **관리자 페이지 (`/admin`)**: 지문 등록, 요청 목록 확인 및 처리

## API 연동
- 모든 요청에 `X-Scafold-Token` 헤더를 자동으로 첨부합니다.
- 401/에러 응답은 페이지 내에 한국어 메시지로 표시합니다.
- 향후 JWT 인증으로 전환하더라도 `TokenProvider` 레이어만 교체하면 됩니다.

## Vercel 배포
1. 저장소 루트에서 `vercel` 연결 후 `frontend` 디렉터리를 프로젝트 루트로 지정합니다.
2. `NEXT_PUBLIC_API_BASE_URL` 환경변수를 Production/Preview 각각 등록합니다.
3. 빌드 명령은 기본(`npm install && npm run build`)을 사용하면 됩니다.
