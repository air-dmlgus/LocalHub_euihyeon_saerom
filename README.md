# LocalHub

공공데이터를 기반으로 대전·충청 지역의 관광지, 음식점, 문화시설 등 다양한 지역 정보를 탐색하고, 익명 커뮤니티와 AI 챗봇을 이용할 수 있는 정적 웹 서비스입니다.

LocalHub는 별도의 백엔드와 데이터베이스 없이 Vue.js와 브라우저 기능을 활용해 구현합니다.



## 1. 프로젝트 개요

- 서비스명: LocalHub
- 대상 지역: 대전·충청
- 주요 사용자: 대전·충청 지역 주민 및 관광객
- 프로젝트 형태: 2인 팀 프로젝트
- 제출 기한: 2026년 7월 16일 15:00
- 배포 방식: Netlify 정적 웹 배포

### 프로젝트 목표

사용자가 대전·충청 지역의 관광지, 음식점, 문화시설, 숙박 시설 등을 쉽게 검색하고 탐색할 수 있도록 합니다.

또한 브라우저의 localStorage를 활용한 익명 커뮤니티와 공공데이터 기반 AI 챗봇을 제공하는 것을 목표로 합니다.



## 2. 주요 기능

### 지역 정보 탐색

- 대전·충청 지역 공공데이터 JSON 8개 로드
- 총 1,365건의 지역 정보 통합
- 관광지, 음식점, 문화시설 등 카테고리별 탐색
- 장소명, 주소, 콘텐츠 유형 검색
- 이미지와 주소가 없는 데이터의 대체 화면 처리
- 모바일, 태블릿, 데스크톱 반응형 카드 목록

### 익명 지역 커뮤니티

- 게시글 목록, 상세, 작성, 수정, 삭제
- 브라우저 localStorage를 이용한 데이터 저장
- 수정 및 삭제 시 비밀번호 검증
- 회원가입과 로그인 없이 익명으로 이용
- 같은 브라우저와 기기에서만 게시글 확인 가능

### AI 지역 정보 챗봇

- 플로팅 버튼 형태의 챗봇 UI
- 대전·충청 지역 정보 JSON 기반 질의응답
- 질문과 관련된 지역 데이터를 브라우저에서 먼저 검색
- 필요한 일부 데이터만 OpenAI API에 전달
- 대화 기록, 로딩, 오류, 빈 결과 처리
- 모바일에서 전체 화면에 가까운 반응형 UI

### 지도 시각화

- Leaflet.js 기반 지도
- 좌표가 있는 관광지와 음식점 등의 마커 표시
- 콘텐츠 유형 및 지역 필터
- 현재 검색·필터 결과와 지도 마커 연동



## 3. 현재 구현 상태

### 완료

- [o] Vue 3 + Vite 프로젝트 구성
- [o] Vue Router 구성
- [o] 공통 헤더 및 푸터
- [o] 홈 화면
- [o] 지역 정보, 커뮤니티 라우트 연결
- [o] Netlify 새로고침 대응용 `_redirects`
- [o] 대전·충청 JSON 8개 통합
- [o] 지역 정보 카드 목록
- [o] 장소명, 주소, 콘텐츠 유형 검색
- [o] 카테고리 필터
- [o] 이미지, 주소, 좌표 누락값 처리
- [o] 지역 정보 화면 반응형 구성

### 진행 예정

- [ ] 익명 게시판 CRUD
- [ ] localStorage 저장 및 비밀번호 검증
- [ ] 실제 OpenAI 챗봇 연동
- [ ] 챗봇 로딩 및 오류 처리
- [ ] 광역·세부 지역 필터
- [ ] Leaflet 지도와 마커
- [ ] 전체 모바일 반응형 점검
- [ ] Netlify 최종 배포
- [ ] 통합 테스트 및 최종 문서화



## 4. 기술 스택

| 구분 | 사용 기술 |
|---|---|
| Frontend | Vue.js 3 |
| Build Tool | Vite |
| Routing | Vue Router |
| Data | 공공데이터 JSON |
| Browser Storage | localStorage |
| AI | OpenAI API |
| Map | Leaflet.js |
| Deployment | Netlify |
| Version Control | Git, GitLab |

### 사용하지 않는 기술

이 프로젝트는 아래 기능과 기술을 사용하지 않습니다.

- 별도 백엔드 서버
- 데이터베이스
- 회원가입 및 로그인
- JWT 및 OAuth
- WebSocket
- 실제 다중 사용자 게시판 공유



## 5. 팀 구성 및 역할

| 팀원 | 담당 기능 |
|---|---|
| 한새롬 | 공통 레이아웃, 홈, 지역 정보, 데이터 처리, 검색·필터, AI 챗봇, 통합 및 배포 |
| 이의현 | 익명 커뮤니티 게시판 CRUD, localStorage 저장, 비밀번호 검증, 지도 시각화 |
| 전체 | 테스트, 오류 수정, 문서화, 배포 확인, 발표 준비 |

역할은 작업 충돌을 줄이기 위한 기본 기준이며, 통합과 테스트 단계에서는 팀 전체가 함께 검토합니다.



## 6. 주요 라우트

| 주소 | 화면 |
|---|---|
| `/` | 홈 |
| `/places` | 지역 정보 목록 |
| `/community` | 커뮤니티 게시글 목록 |
| `/community/new` | 게시글 작성 |
| `/community/:id` | 게시글 상세 |
| `/community/:id/edit` | 게시글 수정 |

Vue Router의 History 모드를 사용하므로 Netlify 배포 시 `public/_redirects` 파일을 사용합니다.

```text
/* /index.html 200
```

## 7. 프로젝트 실행 방법

### 저장소 내려받기

```bash
git clone https://lab.ssafy.com/s16/a16/stratcam_teampjt/everywhere_euihyeon_saerom.git
cd everywhere_euihyeon_saerom
```

이미 저장소를 내려받은 경우에는 프로젝트 폴더에서 최신 내용을 받아옵니다.

```bash
git switch master
git pull origin master
```

### 패키지 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

터미널에 표시되는 로컬 주소를 브라우저에서 엽니다.

기본 주소 예시:

```text
http://localhost:5173
```

### 프로덕션 빌드

```bash
npm run build
```

빌드 결과물은 `dist` 폴더에 생성됩니다.

### 빌드 결과 미리보기

```bash
npm run preview
```



## 8. 환경변수

OpenAI 챗봇을 실행하려면 프로젝트 최상위에 `.env` 파일을 생성해야 합니다.

```env
VITE_OPENAI_API_KEY=발급받은_API_키
```

### 환경변수 주의사항

- `.env` 파일은 Git에 커밋하지 않습니다.
- 실제 API 키를 README나 소스 코드에 작성하지 않습니다.
- 공유해야 하는 환경변수 이름은 `.env.example`에만 작성합니다.
- Vite의 `VITE_` 환경변수는 브라우저 번들에 포함될 수 있습니다.
- 교육 과정에서 제공받은 사용량 제한 API 키를 사용합니다.
- API 키의 사용량 및 접근 제한을 설정한 뒤 사용합니다.

`.env.example` 파일은 다음과 같이 작성할 예정입니다.

```env
VITE_OPENAI_API_KEY=
```

---

## 9. 프로젝트 구조

```text
src/
  components/
    common/
      AppHeader.vue
      AppFooter.vue
      BaseButton.vue
    chatbot/
      ChatbotFloatingButton.vue
    places/
      PlaceCard.vue
    community/                 # 게시판 구현 과정에서 추가 예정

  data/
    대전_충청권_관광지.json
    대전_충청권_레포츠.json
    대전_충청권_문화시설.json
    대전_충청권_쇼핑.json
    대전_충청권_숙박.json
    대전_충청권_여행코스.json
    대전_충청권_음식점.json
    대전_충청권_축제공연행사.json

  router/
    index.js

  services/
    placeData.js
    openai.js                  # 챗봇 구현 과정에서 추가 예정
    placeSearch.js             # 챗봇 구현 과정에서 추가 예정

  utils/
    normalizePlace.js
    storage.js                 # 게시판 구현 과정에서 추가 예정

  views/
    HomeView.vue
    PlacesView.vue
    CommunityListView.vue
    CommunityDetailView.vue
    CommunityFormView.vue

  App.vue
  main.js
  style.css

public/
  _redirects

README.md
package.json
vite.config.js
```

일부 폴더와 파일은 게시판, 챗봇, 지도 기능을 구현하면서 추가될 예정입니다.



## 10. 지역 데이터 처리 기준

지역 정보는 제공된 원본 JSON 파일을 직접 수정하지 않고, 화면에서 사용할 때 별도의 변환 함수를 거쳐 사용합니다.

### 데이터 구성

총 8개의 JSON 파일에서 1,365건의 지역 정보를 불러옵니다.

| 콘텐츠 유형 | 데이터 수 |
|---|---:|
| 관광지 | 335 |
| 레포츠 | 68 |
| 문화시설 | 82 |
| 쇼핑 | 258 |
| 숙박 | 52 |
| 여행코스 | 28 |
| 음식점 | 516 |
| 축제공연행사 | 26 |
| 합계 | 1,365 |

### 주요 필드

| 필드 | 의미 |
|---|---|
| `contentid` | 콘텐츠 고유 식별자 |
| `contenttypeid` | 콘텐츠 유형 식별자 |
| `title` | 장소명 |
| `addr1`, `addr2` | 주소 |
| `mapx` | 경도 |
| `mapy` | 위도 |
| `firstimage`, `firstimage2` | 대표 이미지 |
| `tel` | 전화번호 |
| `createdtime` | 데이터 생성 시각 |
| `modifiedtime` | 데이터 수정 시각 |

### 데이터 처리 주의사항

- 목록의 Vue `key`와 장소 식별자로 `contentid`를 사용합니다.
- 최상위 `contentTypeId`는 숫자이고, 항목의 `contenttypeid`는 문자열일 수 있습니다.
- 콘텐츠 유형을 비교할 때는 `String()`을 사용해 타입을 통일합니다.
- `mapx`는 경도이고 `mapy`는 위도입니다.
- Leaflet에서 좌표를 사용할 때는 `[위도, 경도]` 순서로 전달합니다.

```js
[Number(place.mapy), Number(place.mapx)]
```

- 이미지와 주소가 없는 경우 대체 문구를 표시합니다.
- 이미지 주소가 HTTP인 경우 원본 데이터를 수정하지 않고 화면에서 사용할 때만 변환합니다.
- 유효한 좌표가 없는 장소는 지도 마커 대상에서 제외합니다.
- 원본 JSON은 직접 수정하지 않습니다.



## 11. 커뮤니티 데이터 기준

커뮤니티 게시글은 별도의 서버나 데이터베이스 없이 브라우저의 `localStorage`에 저장합니다.

### localStorage 키

```text
localhub_posts_v1
```

키 이름에 버전을 포함해 추후 데이터 구조가 변경될 경우 구분할 수 있도록 합니다.

### 게시글 기본 구조

```js
{
  id,
  title,
  content,
  password,
  category,
  createdAt,
  updatedAt
}
```

### 구현 기준

- 게시글 목록, 상세, 작성, 수정, 삭제 기능을 제공합니다.
- 게시글 ID는 `crypto.randomUUID()`를 우선 사용합니다.
- 수정과 삭제 시 저장된 비밀번호와 입력한 비밀번호를 비교합니다.
- 게시글 본문은 `v-html`을 사용하지 않고 일반 텍스트로 출력합니다.
- 새로고침 후에도 게시글이 유지되어야 합니다.
- 게시글이 없을 경우 빈 목록 안내를 표시합니다.
- 존재하지 않는 게시글 주소로 접근한 경우 예외 화면을 제공합니다.

### 사용상 한계

게시글은 현재 사용 중인 브라우저의 `localStorage`에만 저장됩니다.

따라서 다음과 같은 한계가 있습니다.

- 다른 브라우저에서는 게시글이 보이지 않습니다.
- 다른 기기에서는 게시글이 보이지 않습니다.
- 브라우저 저장 데이터를 삭제하면 게시글도 삭제됩니다.
- 실제 여러 사용자 간 게시글 공유는 지원하지 않습니다.

비밀번호는 교육용 프로젝트 요구사항에 따라 평문으로 저장합니다. 실제 서비스에서는 사용할 수 없는 보안 방식입니다.



## 12. AI 챗봇 구현 기준

챗봇은 사용자의 지역 정보 질문에 답변하는 플로팅 형태의 UI로 구현합니다.

### 처리 흐름

```text
사용자 질문 입력
→ 브라우저에서 질문 관련 키워드 검색
→ 장소명·주소·콘텐츠 유형을 기준으로 관련 데이터 선별
→ 상위 검색 결과의 최소 필드만 추출
→ OpenAI API에 질문과 관련 데이터 전달
→ 답변을 챗봇 화면에 표시
```

총 1,365건의 전체 데이터를 OpenAI API에 매번 전달하지 않습니다.

먼저 브라우저에서 관련 장소를 검색한 뒤 다음과 같은 최소 정보만 전달합니다.

```js
{
  title,
  contentType,
  address,
  tel
}
```

### 답변 기준

챗봇은 제공된 JSON 데이터에 근거해 답변해야 합니다.

현재 데이터에 없는 다음 정보는 추측해서 답변하지 않습니다.

- 운영시간
- 이용요금
- 휴무일
- 상세 메뉴
- 실시간 혼잡도
- 정확한 축제 시작일과 종료일
- 실시간 날씨
- 실시간 교통 상황

정보가 데이터에 없는 경우에는 확인할 수 없다고 안내합니다.

### 필수 상태 처리

- API 키가 없는 경우
- 질문이 비어 있는 경우
- 관련 장소를 찾지 못한 경우
- 답변 생성 중인 경우
- 네트워크 오류
- API 사용량 초과
- OpenAI API 오류
- 정상 답변 완료

모바일에서는 화면 대부분을 사용하는 형태로 챗봇 패널을 표시합니다.



## 13. Git 작업 방식

기본 브랜치는 `master`입니다.

기능별 브랜치를 생성해 작업하고 GitLab의 Merge Request를 통해 `master`에 병합합니다.

### 브랜치 예시

```text
feature/saerom-chatbot
feature/euihyeon-community
fix/place-card-images
docs/update-readme
```

### 새로운 기능 작업 시작

```bash
git switch master
git pull origin master
git switch -c feature/작업명
```

### 작업 저장

```bash
git status
git add .
git commit -m "feat: 작업 내용"
git push -u origin feature/작업명
```

이후 GitLab에서 Merge Request를 생성합니다.

```text
Source branch: 작업 브랜치
Target branch: master
```

### 협업 주의사항

- 새로운 브랜치를 만들기 전에 최신 `master`를 내려받습니다.
- 팀원이 담당하는 파일은 가능한 한 동시에 수정하지 않습니다.
- `.env`와 실제 API 키를 Git에 올리지 않습니다.
- `node_modules`와 `dist` 폴더를 커밋하지 않습니다.
- 기능 구현 후 `npm run build`가 성공하는지 확인합니다.
- Merge Request에서 삭제된 파일과 변경된 파일을 확인한 뒤 병합합니다.


## 14. 데이터 출처 및 라이선스

- 데이터 제공: 한국관광공사
- 데이터 서비스: TourAPI 4.0
- 이용 조건: 공공누리 제3유형
- 대상 권역: 대전·충청

서비스 화면 하단과 최종 기능 명세서에 데이터 출처와 라이선스를 표시합니다.

```text
출처: 한국관광공사 TourAPI 4.0
라이선스: 공공누리 제3유형
```

공공누리 제3유형의 이용 조건을 고려해 원본 데이터를 직접 수정하지 않습니다.

화면에 필요한 지역명, 숫자 좌표, 이미지 주소 등의 값은 변환 함수 또는 Vue의 `computed` 값을 통해 생성합니다.




## 15. Netlify 배포

Netlify를 이용해 정적 웹 서비스로 배포할 예정입니다.

### 배포 설정

```text
Build command: npm run build
Publish directory: dist
```

Vue Router의 History 모드에서 상세 주소를 새로고침할 때 발생하는 404 오류를 방지하기 위해 `public/_redirects` 파일을 사용합니다.

```text
/* /index.html 200
```

### 환경변수 설정

OpenAI 챗봇 배포 시 Netlify 프로젝트 설정에 다음 환경변수를 등록합니다.

```text
VITE_OPENAI_API_KEY
```

실제 API 키는 GitLab 저장소나 README에 작성하지 않습니다.



### 배포 URL

```text
추후 추가
```



## 16. 완료 기준

다음 조건을 모두 충족하면 LocalHub의 MVP가 완료된 것으로 판단합니다.

### 프로젝트 실행

- [ ] `npm install`이 정상적으로 실행된다.
- [ ] `npm run dev`가 정상적으로 실행된다.
- [ ] `npm run build`가 오류 없이 완료된다.
- [ ] 브라우저 콘솔에 치명적인 오류가 없다.

### 라우트

- [ ] 홈 화면이 정상적으로 표시된다.
- [ ] 지역 정보 화면이 정상적으로 표시된다.
- [ ] 커뮤니티 목록·작성·상세·수정 화면이 정상적으로 표시된다.
- [ ] Netlify에서 상세 주소를 새로고침해도 404 오류가 발생하지 않는다.

### 지역 정보

- [o] JSON 8개의 지역 정보가 정상적으로 로드된다.
- [o] 전체 1,365건의 데이터가 통합된다.
- [o] 장소명, 주소, 콘텐츠 유형 검색이 동작한다.
- [o] 카테고리 필터가 동작한다.
- [o] 이미지와 주소가 없는 데이터가 안전하게 처리된다.
- [ ] 광역 및 세부 지역 필터가 동작한다.
- [ ] Leaflet 지도에 현재 필터 결과의 마커가 표시된다.

### 익명 커뮤니티

- [ ] 게시글 작성이 가능하다.
- [ ] 작성한 게시글이 목록에 표시된다.
- [ ] 게시글 상세 화면이 정상적으로 열린다.
- [ ] 올바른 비밀번호로 게시글을 수정할 수 있다.
- [ ] 올바른 비밀번호로 게시글을 삭제할 수 있다.
- [ ] 틀린 비밀번호로는 수정하거나 삭제할 수 없다.
- [ ] 새로고침 후에도 게시글이 유지된다.
- [ ] 같은 브라우저와 기기에서만 보인다는 안내가 표시된다.

### AI 챗봇

- [ ] 챗봇 패널을 열고 닫을 수 있다.
- [ ] 사용자가 질문을 입력하고 전송할 수 있다.
- [ ] 관련 지역 데이터를 먼저 검색한 뒤 OpenAI API를 호출한다.
- [ ] 데이터에 있는 정보만 근거로 답변한다.
- [ ] 운영시간, 가격, 휴무일 등 없는 정보를 추측하지 않는다.
- [ ] 로딩, 빈 결과, API 키 누락, 네트워크 오류를 처리한다.
- [ ] 모바일에서 챗봇을 사용할 수 있다.

### 배포 및 문서

- [ ] Netlify 외부 접속 URL이 정상적으로 열린다.
- [ ] `.env`와 실제 API 키가 Git에 포함되지 않는다.
- [ ] README에 설치 및 실행 방법이 작성되어 있다.
- [ ] 데이터 출처와 라이선스가 화면에 표시된다.
- [ ] GitLab Repository URL과 Netlify URL을 제출할 수 있다.
- [ ] 기능 명세서, WBS, 발표 자료가 준비되어 있다.