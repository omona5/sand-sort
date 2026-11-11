# Sand Sort

모래를 같은 색끼리 모으는 JavaScript + CSS 퍼즐 게임. 외부 런타임 의존성이나 서버 없이 정적 호스팅으로 서비스합니다.

## 실행

Node.js 22 이상에서 `npm run dev` 실행 후 http://127.0.0.1:4173 에 접속합니다.

## 검증과 빌드

`npm test` 는 모래 이동 규칙, 저장 데이터 검증, 3개 난이도의 첫 15레벨 풀이를 검사합니다.
`npm run build` 는 `dist/` 에 배포 파일을 만듭니다.

## 게임

- 병을 고른 다음 같은 색이 위에 있는 병이나 빈 병을 선택합니다.
- 연속된 같은 색 모래가 남은 공간만큼 이동합니다.
- 모든 병이 비어 있거나 한 가지 색으로 가득 차면 성공합니다.
- 난이도 3단계, 레벨 진행, 되돌리기, 다시 하기, Web Worker 기반 힌트, 선택형 효과음 지원.
- 현재 난이도·레벨·보드·이동 수·시간은 브라우저에 자동 저장됩니다. 되돌리기 기록은 새로고침 시 초기화됩니다.
- 난이도를 바꾸면 해당 난이도 1레벨을 새로 시작합니다.

## 현재 배포

- 서비스: https://sand-sort.omona.dev
- 소스: https://github.com/omona5/sand-sort (Private)
- 호스팅: Sites의 정적 배포, 도메인/DNS: Cloudflare
- `.openai/hosting.json`의 `project_id`는 현재 Site와 연결되므로 유지합니다.
- Cloudflare DNS의 `sand-sort` CNAME은 `custom-domains.chatgpt.site`를 가리키며 DNS only로 설정합니다. 소유권 및 인증 TXT 레코드는 유지합니다.
- GitHub Actions는 push와 PR에서 테스트·빌드를 수행합니다. GitHub push만으로 Sites 운영 배포가 자동 갱신되지는 않습니다. 변경 후 Sites에 새 버전을 배포해야 합니다.

## 선택 사항: Cloudflare Pages로 호스팅 이전

1. GitHub `omona5/sand-sort` 저장소는 Private으로 유지합니다.
2. Cloudflare Workers & Pages에서 Pages 프로젝트를 만들고 해당 GitHub 저장소를 연결합니다.
3. Production branch: `main`, Framework preset: `None`, Build command: `npm run build`, Build output directory: `dist`.
4. Pages 프로젝트의 Custom domains에 `sand-sort.omona.dev`를 추가합니다. 같은 Cloudflare 계정에서 관리하는 영역이면 안내에 따라 DNS를 연결합니다.
5. HTTPS 인증서와 Custom domain 상태가 Active인지 확인합니다. 소스 저장소의 Private 여부는 서비스 접속 공개 여부와 별개입니다.

현재 도메인은 Sites에 연결되어 있습니다. Pages로 이전할 때는 Pages가 제공하는 도메인 연결 절차에 따라 CNAME 대상을 변경해야 합니다. `.openai/hosting.json`은 Cloudflare Pages 직접 배포에는 필요하지 않습니다.

## 개인정보와 접근성

추적 코드, 회원가입, 광고가 없습니다. 진행 데이터는 방문자의 localStorage에 저장됩니다. 키보드 조작, 병별 모래 색 설명, 줄어든 동작 설정을 지원합니다. Google Fonts를 불러올 수 없는 환경에서는 시스템 글꼴로 표시됩니다.
