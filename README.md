# 여행 동행 v4 — 가족 공용 일정

## 기존 기능
모바일 반응형, PWA 홈 화면 설치, 오사카·교토 PDF 일정 시드, 일정 순서 변경·추가·삭제·메모·완료, Leaflet 지도와 구글맵 길찾기 링크를 유지합니다.

## 설치: 1. Supabase
1. https://supabase.com 에 가입하고 **New project** 선택, Free 프로젝트 생성.
2. SQL Editor에서 `supabase-setup.sql` 파일 전체 실행. 기존 데이터를 덮어쓰지 않도록 `on conflict do nothing` 적용.
3. Project Settings → API Keys에서 `service_role` 혹은 최신 Secret API Key (서버 전용)을 확인. **절대로 GitHub / 브라우저 코드에 입력하지 마세요.**
4. Project URL 확인.

## 2. GitHub + Vercel
1. 이 폴더의 모든 파일을 GitHub 저장소에 업로드 (ZIP 자체가 아닌 파일들).
2. https://vercel.com/new → GitHub 저장소 Import. Framework는 Other, 빌드 명령어는 비워 둡니다.
3. Settings → Environment Variables → Production에 네 항목 입력:
   - `SUPABASE_URL`: Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase의 서버 전용 service_role 키 (새 Secret API Key 호환성은 Supabase 버전별 검증 필요; 기존 JWT 형태 service_role 권장)
   - `FAMILY_PASSWORD`: 가족 3명이 공유할 충분히 긴 비밀번호(8자 이상 권장)
   - `SESSION_SECRET`: 임의의 긴 비밀 문자열(32자 이상), 비밀번호와 다르게 설정
4. **Deploy**. 이미 배포한 프로젝트에서 변수를 추가했다면 **Redeploy** 수행.
5. 배포 URL을 가족에게 공유. 첫 접속 시 가족 비밀번호 입력. 같은 날 일정 변경 후 다른 폰에서 새로고침하면 반영.

## 3. 개발 및 테스트
- 배포 없이 `python -m http.server`로 열면 `/api`가 없어 공유 로그인은 동작하지 않습니다. Vercel 배포 후 확인하세요.
- Vercel CLI의 `vercel dev`를 활용하면 로컬 함수도 실행할 수 있지만 환경변수를 준비해야 합니다.
- Android Chrome, iPhone Safari 각각에서 로그인 → 변경 → 저장 알림 → 다른 폰 새로고침 → 공유 여부 확인.
- 이동 중 네트워크가 끊어지면 저장 실패를 표시하며, 현재 버전은 오프라인 변경을 나중에 자동 업로드하지 않습니다.
- 충돌 시 최신 버전을 불러오며 사용자가 다시 작업해야 합니다.
- 기존 휴대전화 `localStorage` 변경본은 자동으로 서버 이전하지 않습니다. 기존 자료가 중요하면 이전 전 별도로 백업하세요.

## 보안 및 서비스 제한
- 웹 주소는 공개로 접근할 수 있지만 비밀번호를 알아야 일정 API에 접근합니다. 로그인 쿠키는 HttpOnly, Secure, SameSite Strict로 설정, 7일 후 만료됩니다.
- 가족 비밀번호 로그인에는 아직 서버 단위 속도 제한 및 사용자별 권한 분리가 없습니다. 충분히 긴 비밀번호를 사용하고 URL과 비밀번호를 공개하지 마세요.
- 데이터베이스 테이블은 RLS 적용, 공개 anon 역할 접근 정책 없음. 서버 전용 키가 서버 함수에서만 사용됩니다.
- 가족 전원 동시 실시간 화면 갱신은 지원하지 않습니다. 새로고침으로 갱신합니다.
- Supabase Free 프로젝트는 장기간 비활성 시 일시중지될 수 있습니다.
- PWA 캐시 때문에 업데이트가 늦으면 앱을 닫았다 다시 열거나 업데이트 배너를 누르세요.
