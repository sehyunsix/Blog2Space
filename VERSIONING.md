# 버전 관리 가이드

이 프로젝트는 [Semantic Versioning 2.0.0](https://semver.org/lang/ko/)을 따릅니다.

## 버전 번호 체계

**MAJOR.MINOR.PATCH** (예: 1.2.3)

- **MAJOR**: 호환되지 않는 API 변경
- **MINOR**: 하위 호환되는 기능 추가
- **PATCH**: 하위 호환되는 버그 수정

## 현재 버전

**v0.1.0** - MVP (Minimum Viable Product)

- 0.x.x 버전은 초기 개발 단계를 의미합니다
- API가 안정화되면 1.0.0으로 릴리스 예정

## 버전 업데이트 방법

### 1. Patch 버전 (버그 수정)

```bash
npm run version:patch
# 0.1.0 → 0.1.1
```

**사용 시기:**

- 버그 수정
- 오타 수정
- 성능 개선 (기능 변경 없음)
- 코드 리팩토링

### 2. Minor 버전 (기능 추가)

```bash
npm run version:minor
# 0.1.0 → 0.2.0
```

**사용 시기:**

- 새로운 기능 추가 (하위 호환)
- 기존 기능 개선
- 새로운 API 추가
- Deprecation 경고 추가

### 3. Major 버전 (Breaking Changes)

```bash
npm run version:major
# 0.1.0 → 1.0.0
```

**사용 시기:**

- 호환되지 않는 API 변경
- 기존 기능 제거
- 대규모 아키텍처 변경

## 릴리스 프로세스

### 1. 변경사항 확인

```bash
git status
git log --oneline
```

### 2. CHANGELOG.md 업데이트

```markdown
## [x.y.z] - YYYY-MM-DD

### Added

- 새로운 기능

### Changed

- 변경된 기능

### Fixed

- 수정된 버그

### Removed

- 제거된 기능
```

### 3. 버전 업데이트

```bash
# Patch, Minor, Major 중 선택
npm run version:patch
```

이 명령은 자동으로:

- package.json의 version 업데이트
- Git 커밋 생성
- Git 태그 생성

### 4. 변경사항 푸시

```bash
git push origin main
git push origin --tags
```

## Git 태그 관리

### 태그 목록 확인

```bash
git tag
```

### 특정 태그 정보 확인

```bash
git show v0.1.0
```

### 태그 생성 (수동)

```bash
git tag -a v0.1.0 -m "Release v0.1.0"
```

### 태그 삭제 (로컬)

```bash
git tag -d v0.1.0
```

### 태그 삭제 (원격)

```bash
git push origin :refs/tags/v0.1.0
```

## 커밋 메시지 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/)를 따릅니다:

### 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- **feat**: 새로운 기능
- **fix**: 버그 수정
- **docs**: 문서 변경
- **style**: 코드 포맷팅 (기능 변경 없음)
- **refactor**: 코드 리팩토링
- **perf**: 성능 개선
- **test**: 테스트 추가/수정
- **chore**: 빌드 프로세스, 도구 설정 등
- **ci**: CI 설정 변경

### 예시

```bash
# Minor 버전 업데이트가 필요한 경우
feat: 블로그 URL 스크래핑 기능 추가

# Patch 버전 업데이트가 필요한 경우
fix: 3D 렌더링 시 메모리 누수 수정

# Major 버전 업데이트가 필요한 경우
feat!: API 구조 전면 개편

BREAKING CHANGE: 이전 API와 호환되지 않습니다.
```

## 버전 히스토리

### v0.1.0 (2025-10-20)

- 초기 MVP 버전
- 텍스트 임베딩 및 3D 시각화 기본 기능

### 예정된 릴리스

#### v0.2.0

- [ ] 블로그 URL 스크래핑
- [ ] RSS/Sitemap 파싱
- [ ] 다양한 블로그 플랫폼 지원

#### v0.3.0

- [ ] UMAP/t-SNE 차원 축소 옵션
- [ ] 클러스터 자동 레이블링

#### v1.0.0

- [ ] API 안정화
- [ ] 프로덕션 레디
- [ ] 전체 문서화 완료

## 참고 자료

- [Semantic Versioning](https://semver.org/lang/ko/)
- [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)
- [Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/)
