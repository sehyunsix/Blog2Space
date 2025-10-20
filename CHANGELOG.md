# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2025-10-20

### Added

- 🤗 대폭 확장된 임베딩 모델 선택 (6개 → 13개)
  - **⭐ 추천 모델** (3개)
    - MiniLM-L6: 빠르고 효율적 (~23MB, 384dim)
    - BGE Small: 균형잡힌 성능 (~33MB, 384dim)
    - GTE Small: 최신 모델 (~33MB, 384dim)
  - **🌏 다국어 모델** (3개)
    - Multilingual MiniLM: 50개 언어 (~470MB, 384dim)
    - E5 Multilingual: 100개 언어 (~470MB, 384dim)
    - MPNet Multilingual: 다국어 고성능 (~420MB, 768dim)
  - **🇺🇸 영어 특화** (4개)
    - MPNet Base: 높은 정확도 (~420MB, 768dim)
    - Nomic Embed: 고성능 임베딩 (~550MB, 768dim)
    - BGE Base: 고성능 영어 (~420MB, 768dim)
    - BGE Large: 최고 성능 (~1.2GB, 1024dim) ⚠️
  - **🎯 특수 목적** (3개)
    - LaBSE: 109개 언어, 병렬 텍스트 (~470MB, 768dim)
    - Sentence-T5: T5 기반 임베딩 (~220MB, 768dim)
    - BGE Chinese: 중국어 특화 (~95MB, 512dim)

### Changed

- 🎨 모델 선택 UI 개선
  - 카테고리별 그룹화로 가독성 향상
  - 각 모델의 파일 크기 표시 추가
  - Cyan 강조 색상으로 시각적 통일성
  - 모바일 터치 최적화 (touch-manipulation)

### Fixed

- 🐛 호환되지 않는 모델 제거
  - `Xenova/all-distilroberta-v1` → `Xenova/bge-small-zh-v1.5`로 교체
  - Transformers.js와 호환되는 검증된 모델만 사용

### Added (추가)

- 🔷 Google 모델 카테고리 신설
  - Gemma 3n 300M: Google의 임베딩 전용 모델 (~300MB, 768dim)
  - 경량화된 고성능 임베딩 생성
- 🧪 실험적 모델 카테고리 추가 (2개)
  - Gemma 2 2B: Google Gemma 모델 (~1.5GB) ⚠️ 실험적
  - ModernBERT Base: 최신 BERT 변형 (~440MB, 768dim)

## [0.4.1] - 2025-10-20

### Added

- 🎨 SVG 파비콘 추가
  - Cyan 그라데이션 "2" 로고
  - 우주 테마 (검은 배경 + 별)
  - 빛나는 효과

### Changed

- 🎨 Cyan 테마 통일
  - Viewer3D 로고 "2" 색상 변경 (purple → cyan)
  - theme-color 변경 (#7c3aed → #00d4ff)
  - InfoPanel 헤더 그라데이션 변경 (purple-pink → cyan-blue)
  - 검색 결과 텍스트 cyan 계열로 통일
- 🚀 LoadingScreen 우주선 아이콘 개선
  - 이모티콘 → SVG 우주선으로 변경
  - animate-bounce 효과 추가
- 🧹 UI 정리
  - Viewer3D 조작법 패널 제거 (간결한 UI)
  - InfoPanel에서 임베딩/위치 정보 제거
  - 유사도 정보만 표시하도록 간소화
  - "유사도:" 라벨 추가로 가독성 향상

## [0.4.0] - 2025-10-20

### Added

- 📱 모바일 환경 완전 지원
  - 반응형 디자인 (스마트폰, 태블릿, 데스크톱)
  - 터치 제스처 최적화
  - 모바일 Safe Area 지원 (노치, 홈 인디케이터 고려)
  - PWA 메타 태그 추가 (홈 화면 추가 지원)
- 🌐 커스텀 도메인 지원
  - Vite allowedHosts 설정 추가 (www.sobut.shop)
- 🎨 모바일 UI/UX 개선
  - InputScreen 반응형 레이아웃
  - ModelSelector 패널 크기/위치 최적화
  - InfoPanel 모바일 크기 조정
  - SearchPanel 너비 자동 조정
  - 버튼 크기 및 간격 터치 친화적으로 조정
- ✨ 터치 최적화
  - touch-manipulation 클래스 추가
  - active 상태 스타일링
  - 탭 하이라이트 제거
- 📏 반응형 타이포그래피
  - 제목/본문 크기 자동 조정 (text-3xl sm:text-4xl md:text-5xl)
  - 입력 필드 및 버튼 크기 조정

### Changed

- 🔄 전역 상태 관리 개선 (Pub-Sub 패턴)
  - useModel hook을 싱글톤으로 리팩토링
  - 모든 컴포넌트가 동일한 모델 상태 공유
  - 구독자 패턴으로 리렌더링 최적화
- 🎯 임베딩 완료 시 자동 상태 리셋
  - isLoading 플래그 정확한 관리
  - 모델 준비 상태 즉시 반영
- 📱 CSS 최적화
  - 100dvh (Dynamic Viewport Height) 사용
  - 커스텀 스크롤바 스타일링
  - webkit-tap-highlight-color 최적화
- 🎨 레이아웃 개선
  - 패널 간격 및 위치 조정 (모바일 친화적)
  - 버튼 배치 (모바일에서 세로, 데스크톱에서 가로)
  - textarea 높이 반응형 조정

### Fixed

- 🐛 ModelSelector 리렌더링 문제 완전 해결
  - Worker 메시지가 모든 구독자에게 전파
  - 진행률 업데이트 실시간 반영
- 🔧 임베딩 완료 후 "로딩 중" 상태 유지 문제 해결
- 📱 모바일 스크롤 및 터치 이벤트 충돌 해결
- 🎯 Safe Area Inset 적용으로 노치 디바이스 지원

### Technical

- 🏗️ useModel hook 아키텍처 개선 (모듈 레벨 전역 상태 + 구독 패턴)
- 🧹 setState 로직 최적화 (클로저 문제 해결)
- 📝 모바일 최적화 주석 추가
- 🚀 성능 개선 (불필요한 리렌더링 제거)

## [0.3.0] - 2025-10-20

### Added

- 🎨 4단계 모델 로딩 프로그레스 표시
  - [1/4] 토크나이저 다운로드 (0-20%)
  - [2/4] 모델 파일 다운로드 (20-85%)
  - [3/4] ONNX Runtime 초기화 (85-95%)
  - [4/4] 최종 설정 (95-100%)
- 🖥️ 왼쪽 패널 모델 선택 UI
  - 5가지 인기 임베딩 모델 (MiniLM-L6, MPNet Base, BGE Small, GTE Small, Multilingual)
  - 커스텀 Hugging Face 모델 URL 입력 지원
  - 실시간 다운로드 진행 상황 표시
- ✅ 임베딩 유효성 검증 및 fallback 처리
  - NaN/Infinity 값 자동 감지 및 대체
  - L2 정규화 적용
  - 안정적인 mean pooling 구현
- 📊 UMAP 차원 축소 개선
  - 입력 벡터 검증 강화
  - 샘플링 기반 대용량 데이터 처리 (500개 이상)
  - PCA fallback 구현
- 🧪 테스트 코드 추가
  - useModel hook 테스트
  - ModelSelector 컴포넌트 테스트
  - UMAP 유틸리티 테스트

### Changed

- ⚡ Worker 캐시 버스팅 구현 (실시간 업데이트 보장)
- 🔄 React state 관리 최적화 (리렌더링 개선)
- 📦 모델 로딩 타임아웃 증가 (60초 → 180초)
- 🎯 Progress throttling 적용 (200ms 간격)

### Fixed

- 🐛 임베딩 생성 시 NaN 값 발생 문제 해결
- 🔧 ModelSelector 리렌더링 문제 해결
- ✅ 대용량 모델 다운로드 안정성 개선
- 🎨 UI 업데이트 누락 문제 해결

### Technical

- 🏗️ Worker 메시지 처리 로직 개선
- 🧹 불필요한 디버그 로그 정리
- 📝 상세한 주석 및 문서화
- ⚡ 성능 최적화

## [0.2.0] - 2025-10-20

### Added

- ✨ UMAP (Uniform Manifold Approximation and Projection) 차원 축소 기법 구현
- 🏷️ 3D 포인트 클라우드 위에 텍스트 라벨 추가 (항상 표시)
- 💬 호버 시 전체 텍스트 툴팁 표시 기능
- 📦 `umap-js` 패키지 추가
- 🎨 향상된 텍스트 시각화 (선택/호버 상태에 따른 동적 스타일링)
- ⚡ 대용량 데이터 처리를 위한 랜덤 프로젝션 폴백 (100개 이상)
- ⏱️ UMAP 타임아웃 추가 (30초)

### Changed

- 🔄 PCA에서 UMAP으로 차원 축소 알고리즘 변경 (더 나은 시각화 품질)
- 🎯 텍스트 라벨이 항상 표시되도록 개선 (투명도로 가시성 조절)
- 📊 로딩 진행 상황 표시 개선 (UMAP 단계 추가)
- 🧹 불필요한 디버그 로그 제거 및 코드 정리
- ⚙️ UMAP 파라미터 최적화 (안정성 및 성능 개선)
- 🎨 포인트 색상 개선 (더 다양한 색상 스펙트럼)

### Removed

- 🗑️ `src/utils/pca.js` 파일 삭제 (UMAP으로 대체)
- 🧹 과도한 콘솔 로그 제거

### Fixed

- 🐛 NaN 좌표 문제 수정 (최소 3개 텍스트 요구사항 추가)
- ✅ UMAP 실행 시 에러 처리 및 폴백 로직 개선
- 🎨 PointCloud 렌더링 최적화
- 🔧 UMAP 스택 오버플로우 문제 해결 (epoch 제한, 타임아웃 추가)

### Technical

- 🔧 Worker 메시지 로깅 최소화
- 🎯 좌표 정규화 함수 최적화
- 🏗️ 코드 구조 개선 및 가독성 향상
- 🚀 대용량 데이터 자동 폴백 로직 구현

## [0.1.0] - 2025-10-20

### Added

- 초기 프로젝트 구조 설정
- Git 버전 관리 초기화
- SemVer 기반 버전 관리 시스템 구축
- ESLint 및 Prettier 설정
- Husky pre-commit 훅 설정
- lint-staged 구성
- React 18+ with Vite
- Three.js + @react-three/fiber 3D 렌더링
- Transformers.js (@huggingface/transformers) 텍스트 임베딩
- Web Workers를 통한 백그라운드 모델 처리
- Zustand 상태 관리
- Tailwind CSS 스타일링
- 기본 3D 시각화 기능
- 텍스트 입력 기능 (줄바꿈으로 구분)
- AI 임베딩 생성 (all-MiniLM-L6-v2)
- 인터랙티브 3D 조작 (회전, 확대/축소, 클릭)
- 포인트 호버 시 텍스트 미리보기
- 포인트 선택 시 상세 정보 패널
- 시맨틱 검색 기능 (코사인 유사도 기반)
- 유사한 텍스트 자동 추천
- 로딩 진행 상황 표시
- 예시 텍스트 제공

[0.2.0]: https://github.com/yourusername/blog2space/releases/tag/v0.2.0
[0.1.0]: https://github.com/yourusername/blog2space/releases/tag/v0.1.0
