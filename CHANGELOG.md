# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-20

### Added

- 텍스트 입력 기능 (줄바꿈으로 구분)
- Transformers.js를 사용한 AI 임베딩 생성 (all-MiniLM-L6-v2)
- PCA 알고리즘을 통한 차원 축소 (384D → 3D)
- Three.js 기반 3D 시각화
- 인터랙티브 3D 조작 (회전, 확대/축소, 클릭)
- 포인트 호버 시 텍스트 미리보기
- 포인트 선택 시 상세 정보 패널
- 시맨틱 검색 기능 (코사인 유사도 기반)
- 유사한 텍스트 자동 추천
- 로딩 진행 상황 표시
- 예시 텍스트 제공

### Technical

- React 18.3 + Vite 빌드 시스템
- Tailwind CSS 스타일링
- Zustand 상태 관리
- @react-three/fiber + @react-three/drei 3D 렌더링
- 브라우저 내 AI 모델 실행 (서버리스)

[0.1.0]: https://github.com/yourusername/blog2space/releases/tag/v0.1.0
