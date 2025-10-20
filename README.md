# Blog2Space

텍스트를 3D 임베딩 공간으로 시각화하는 웹 애플리케이션

![Blog2Space](https://img.shields.io/badge/React-18.3.1-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.163.0-green)
![Transformers.js](https://img.shields.io/badge/Transformers.js-2.17.1-orange)

## 🌟 특징

- **텍스트 임베딩**: Transformers.js를 사용한 브라우저 내 AI 임베딩 생성
- **3D 시각화**: Three.js로 구현된 인터랙티브한 3D 공간
- **시맨틱 검색**: 의미 기반 텍스트 검색 및 유사도 분석
- **실시간 인터랙션**: 호버, 클릭, 회전 등 다양한 3D 조작

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 열기

### 빌드

```bash
npm run build
```

## 📖 사용 방법

1. **텍스트 입력**: 메인 화면에서 분석하고 싶은 텍스트들을 줄바꿈으로 구분하여 입력
2. **3D 공간 생성**: "3D 공간 생성" 버튼 클릭 (첫 실행 시 AI 모델 다운로드)
3. **탐색**: 마우스로 3D 공간을 회전하고 포인트를 클릭하여 상세 정보 확인
4. **검색**: 상단 검색창에서 시맨틱 검색 수행

## 🛠️ 기술 스택

### 프론트엔드

- **React 18.3**: UI 프레임워크
- **Vite**: 빌드 도구
- **Tailwind CSS**: 스타일링

### 3D 렌더링

- **Three.js**: 3D 그래픽 라이브러리
- **@react-three/fiber**: React용 Three.js 래퍼
- **@react-three/drei**: Three.js 헬퍼 컴포넌트

### AI/ML

- **Transformers.js**: 브라우저 내 AI 모델 실행
- **15개 임베딩 모델 지원**:
  - 추천 모델 (경량, 빠름): MiniLM-L6, BGE Small, GTE Small
  - 다국어 모델: Multilingual MiniLM, E5 Multilingual, MPNet Multilingual
  - 영어 특화: MPNet Base, Nomic Embed, BGE Base/Large
  - 특수 목적: LaBSE (109개 언어), Sentence-T5, BGE Chinese
  - 실험적 모델: Gemma 2 2B, ModernBERT Base
- **UMAP**: 고급 차원 축소 알고리즘 (t-SNE보다 빠름)

### 상태 관리

- **Zustand**: 경량 상태 관리 라이브러리

## 📁 프로젝트 구조

```
Blog2Space/
├── src/
│   ├── components/
│   │   ├── InputScreen.jsx      # 텍스트 입력 화면
│   │   ├── LoadingScreen.jsx    # 로딩 화면
│   │   ├── Viewer3D.jsx         # 3D 뷰어 메인
│   │   ├── PointCloud.jsx       # 3D 포인트 클라우드
│   │   ├── SearchPanel.jsx      # 검색 패널
│   │   └── InfoPanel.jsx        # 정보 패널
│   ├── store/
│   │   └── useStore.js          # Zustand 상태 관리
│   ├── utils/
│   │   ├── embeddings.js        # 임베딩 생성 및 검색
│   │   └── pca.js               # PCA 차원 축소
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 주요 기능

### 1. 임베딩 생성

- **13개 Hugging Face 모델** 지원 (카테고리별 분류)
- 384 ~ 1024차원 임베딩 벡터 생성
- 브라우저에서 직접 실행 (서버 불필요)
- 모델 자동 다운로드 및 캐싱
- 다국어 지원 (최대 109개 언어)

### 2. 차원 축소

- **UMAP** 알고리즘으로 고차원 → 3차원 변환
- 텍스트 간 유사도 관계 보존
- 대규모 데이터셋 최적화 (샘플링 기반)

### 3. 3D 시각화

- Three.js 기반 WebGL 렌더링
- OrbitControls로 자유로운 시점 조작
- 실시간 애니메이션 및 인터랙션

### 4. 시맨틱 검색

- 코사인 유사도 기반 검색
- 검색 결과 실시간 하이라이트
- 유사도 시각화

## 🎯 향후 계획

- [ ] 블로그 URL 입력 및 자동 스크래핑
- [ ] 다양한 블로그 플랫폼 지원 (Tistory, Naver, Medium 등)
- [x] ~~UMAP 차원 축소~~ (v0.2.0)
- [x] ~~다양한 임베딩 모델 지원~~ (v0.5.0 - 13개 모델)
- [ ] 클러스터 자동 레이블링
- [ ] 시간 축 필터링
- [ ] 데이터 내보내기 (JSON, 이미지)
- [ ] 공유 링크 생성
- [x] ~~모바일 최적화~~ (v0.4.0)

## 📝 라이선스

MIT

## 🤝 기여

기여를 환영합니다! 이슈나 PR을 자유롭게 등록해주세요.

## 📧 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.
