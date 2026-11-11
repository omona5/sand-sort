# Sand Sort

같은 색의 모래를 모으는 JavaScript + CSS 퍼즐 게임. 서버와 외부 런타임 의존성 없이 정적 파일로 서비스합니다.

- 게임: https://sand-sort.omona.dev
- 공개 소스: https://github.com/omona5/sand-sort
- 호스팅: GitHub Pages / 도메인·DNS: Cloudflare

## 실행과 검증

Node.js 22 이상에서 실행합니다. 별도 패키지 설치는 필요하지 않습니다.

```sh
npm run dev
npm test
npm run build
```

개발 주소는 http://127.0.0.1:4173 입니다. 빌드 결과는 `dist/`에 생성됩니다. 테스트는 이동 규칙, 저장 데이터 검증, 4개 난이도의 첫 15레벨(총 60레벨) 풀이 및 Extreme 생성 경로의 합법성을 확인합니다.

## 게임

- 병을 고른 뒤 같은 색이 위에 있는 병이나 빈 병을 선택합니다. 연속된 같은 색 모래가 남은 공간만큼 이동합니다.
- 모든 병이 비어 있거나 한 가지 색으로 가득 차면 성공합니다.
- Easy: 5병 / Normal: 6병 / Hard: 7병 / Extreme: 15병·13색, 5열 × 3행.
- Extreme의 모래에는 01~13 번호를 표시해 비슷한 색도 구분할 수 있습니다.
- 레벨 진행, 되돌리기, 다시 하기, Web Worker 기반 힌트, 선택형 효과음을 지원합니다. 큰 퍼즐의 힌트 탐색은 제한된 시간·노드 안에서 진행하며 항상 답을 찾는 것은 아닙니다.
- 난이도·레벨·보드·이동 수·시간은 브라우저에 자동 저장됩니다. 되돌리기 기록은 새로고침 시 초기화됩니다. 난이도 변경 시 1레벨을 새로 시작합니다.

## 자동 배포

`.github/workflows/check.yml`이 PR에서 테스트·빌드를 수행하고, `main` push에서는 검증 후 `dist/`를 GitHub Pages에 자동 배포합니다. Actions 화면에서 수동 실행도 가능합니다.

GitHub 저장소 Settings → Pages:

- Source: GitHub Actions
- Custom domain: `sand-sort.omona.dev`
- Enforce HTTPS: 활성화

Cloudflare DNS:

- Type: `CNAME`
- Name: `sand-sort`
- Target: `omona5.github.io`
- Proxy status: `DNS only`

Sites 계정·연결·배포 설정은 운영에 필요하지 않습니다. 커스텀 도메인은 GitHub Pages 설정에 저장하며, Actions 배포에서는 별도 CNAME 파일이 필요하지 않습니다.

## 개인정보와 접근성

추적 코드, 회원가입, 광고가 없습니다. 진행 데이터는 방문자의 localStorage에 저장됩니다. 키보드 조작, 병별 모래 색 설명, 줄어든 동작 설정을 지원합니다. Google Fonts를 불러올 수 없으면 시스템 글꼴로 표시됩니다.
