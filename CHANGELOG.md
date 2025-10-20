# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
