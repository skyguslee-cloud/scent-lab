# SCENT LAB — 나만의 향수 조향소 (과제용 데모 쇼핑몰)

빌드 없이 돌아가는 정적 웹사이트입니다. 회원 데이터는 Supabase 서버에 저장되고, 실제 결제·배송·메일/문자 발송은 없습니다.

## 회원 기능 (Supabase)
- `login.html`에서 회원가입(이름·이메일·비밀번호·휴대폰·생일)과 로그인을 할 수 있습니다.
- 둘러보기·조향·장바구니는 비회원도 가능하고, **결제와 마이페이지는 로그인이 필요**합니다. 로그인하면 비회원 때 담은 장바구니가 계정으로 옮겨집니다.
- 장바구니·위시리스트·주문·레시피·기념일·알림 기록은 계정별로 서버(`user_store` 테이블)에 저장되어, 다른 기기에서 로그인해도 그대로 이어집니다.
- 행 단위 보안(RLS)으로 회원은 자기 데이터만 읽고 쓸 수 있습니다.
- 서버 설정: [js/config.js](js/config.js) (공개용 publishable 키라 브라우저에 있어도 괜찮음)
- 대시보드: https://supabase.com/dashboard/project/woajasonwtmgordwhmed — `profiles` 테이블에서 가입한 회원 목록을 볼 수 있습니다.
- **가입 인증 메일 사용 중**: 가입하면 인증 메일이 가고, 메일의 링크를 눌러야 로그인할 수 있습니다. 링크를 누르면 `login.html`로 돌아와 자동 로그인됩니다.
  - 링크가 이 사이트로 돌아오게 하려면 Authentication → URL Configuration → **Redirect URLs**에 사이트 주소를 추가하세요 (`https://scent-lab-wheat.vercel.app/**`, `https://skyguslee-cloud.github.io/scent-lab/**`, 로컬 테스트용 `http://localhost:5173/**`). Site URL은 주로 쓸 주소(예: `https://scent-lab-wheat.vercel.app`)로 바꿔 두세요.
  - Supabase 무료 메일은 시간당 몇 통으로 제한됩니다. 발표 때 여러 명이 동시에 가입하면 "요청이 너무 많아요" 오류가 날 수 있으니, 미리 가입해 두거나 Authentication → Emails에서 SMTP(예: Gmail, Resend)를 연결하세요.

## 배포 주소
- Vercel: https://scent-lab-wheat.vercel.app (GitHub 저장소와 연결되어 `main`에 push하면 자동 배포)
- GitHub Pages: https://skyguslee-cloud.github.io/scent-lab/ (`main`에 push하면 1~2분 뒤 자동 반영)
- 저장소: https://github.com/skyguslee-cloud/scent-lab

## 실행
- `index.html`을 더블클릭해 브라우저로 열면 됩니다.
- 로컬 서버로 보고 싶다면: `node .claude/serve.js` → http://localhost:5173

## 페이지와 기능
| 페이지 | 기능 |
|---|---|
| `index.html` 메인 | 풀스크린 히어로(떠다니는 입자, 일렁이는 향수 SVG), 스크롤 애니메이션, 후기 캐러셀, 문자 타이핑 데모 |
| `lab.html` 아틀리에 | 향료 18종 × 비율 슬라이더 → 병 속 액체 색 실시간 블렌딩, 향 계열 레이더 차트, 자동 향 설명·이름 생성, 병 4종·캡 4종·용량·라벨 각인, 액세서리 6종, 포장지·리본·박스·손글씨 카드, 실시간 가격, 레시피 저장·공유 링크 |
| `gift.html` 선물 추천 | 받는 사람 × 상황 × 분위기 × 예산 → 추천 3개와 추천 이유, 상황별 포장·카드 문구 제안, 아틀리에로 그대로 가져가기 |
| `quiz.html` 향 테스트 | 7문항 → 향 타입 결과, 레이더 차트, 맞춤 레시피 |
| `shop.html` / `product.html` | 카테고리·향 계열 필터, 정렬, 검색, 위시리스트, 용량별 가격, 노트 피라미드, 리뷰, 연관 상품 |
| `cart.html` | 수량 변경, 쿠폰(SCENT10 · BDAY20 · WELCOME), 무료배송 기준, 선물 배송 정보, 데모 결제 + 컨페티 |
| `mypage.html` | 알림 센터(메일·문자 미리보기), 기념일 관리(D-day), 주문 배송 단계, 저장한 레시피, 위시리스트, 내 정보 |

공통: 다크 모드, 모바일 반응형, 장바구니·알림 배지, 토스트 알림.

## 발표 시연 팁
1. **선물 추천**에서 "엄마 · 생일"을 고르고 → **포장까지 맞춤** → 아틀리에에서 향과 병을 바꿔 보기
2. 장바구니 → 쿠폰 `SCENT10` → 결제 (컨페티)
3. **마이페이지 → 알림 센터 → "다음 알림일로 이동"** : 데모 시계가 앞으로 가면서 생일 알림 문자·메일이 "발송됨"으로 바뀝니다. 항목을 누르면 문자/메일 미리보기가 열립니다.
4. 데모 시계를 +1일씩 옮기면 주문 배송 단계도 진행됩니다.
5. 처음 상태로 돌리려면 마이페이지 → 내 정보 → **데모 데이터 초기화**

## 파일 구조
```
css/style.css     디자인 토큰, 레이아웃, 다크 모드
js/data.js        향료·병·액세서리·포장·상품·퀴즈 데이터
js/common.js      저장소, 장바구니, 위시리스트, 헤더/푸터, 토스트, 색 블렌딩·가격 계산
js/bottle.js      향수병·선물상자·액세서리 SVG 그리기
js/notify.js      추천 로직, 기념일 알림 시뮬레이션
js/config.js      Supabase 주소·공개 키
js/auth.js        회원가입·로그인·로그아웃, 계정 데이터 서버 동기화
login.html        로그인 / 회원가입 페이지
js/lab.js gift.js cart.js mypage.js   페이지별 스크립트
```
디자인은 하이엔드 향수 브랜드 사이트의 분위기(흑백, 세리프 타이포, 넓은 여백)를 참고했고, 브랜드명·로고·이미지는 모두 직접 만든 것입니다.
