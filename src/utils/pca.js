/**
 * PCA (Principal Component Analysis) 구현
 * 고차원 임베딩 벡터를 저차원(3D)로 축소
 */

// 평균 계산
function mean(vectors) {
  const dim = vectors[0].length
  const result = new Array(dim).fill(0)

  for (const vec of vectors) {
    for (let i = 0; i < dim; i++) {
      result[i] += vec[i]
    }
  }

  return result.map((val) => val / vectors.length)
}

// 중심화 (평균 제거)
function center(vectors) {
  const meanVec = mean(vectors)
  return vectors.map((vec) => vec.map((val, i) => val - meanVec[i]))
}

// 공분산 행렬 계산 (간소화 버전)
function covarianceMatrix(vectors) {
  const centered = center(vectors)
  const n = centered.length
  const dim = centered[0].length

  // 작은 샘플의 경우, 단순히 처음 몇 개 차원을 사용
  // 실제 PCA는 고유값 분해가 필요하지만, 여기서는 단순화
  const result = []

  for (let i = 0; i < Math.min(dim, 100); i++) {
    let variance = 0
    for (let j = 0; j < n; j++) {
      variance += centered[j][i] * centered[j][i]
    }
    result.push({ index: i, variance: variance / n })
  }

  // 분산이 큰 순서로 정렬
  result.sort((a, b) => b.variance - a.variance)

  return result
}

/**
 * PCA 차원 축소
 * @param {Array<Array<number>>} vectors - 입력 벡터들
 * @param {number} targetDim - 목표 차원 (3)
 * @returns {Array<Array<number>>} 축소된 벡터들
 */
export function pca(vectors, targetDim = 3) {
  if (vectors.length === 0) return []

  const centered = center(vectors)

  // 간단한 PCA: 분산이 가장 큰 차원들을 선택
  const cov = covarianceMatrix(centered)
  const topDimensions = cov.slice(0, targetDim).map((item) => item.index)

  // 선택된 차원만 추출
  const reduced = centered.map((vec) => topDimensions.map((dim) => vec[dim]))

  return reduced
}

/**
 * 대안: 랜덤 프로젝션 (더 빠름)
 */
export function randomProjection(vectors, targetDim = 3) {
  if (vectors.length === 0) return []

  const sourceDim = vectors[0].length

  // 랜덤 프로젝션 행렬 생성
  const projectionMatrix = Array(targetDim)
    .fill(0)
    .map(() =>
      Array(sourceDim)
        .fill(0)
        .map(() => (Math.random() - 0.5) * 2)
    )

  // 정규화
  for (let i = 0; i < targetDim; i++) {
    let norm = 0
    for (let j = 0; j < sourceDim; j++) {
      norm += projectionMatrix[i][j] ** 2
    }
    norm = Math.sqrt(norm)
    for (let j = 0; j < sourceDim; j++) {
      projectionMatrix[i][j] /= norm
    }
  }

  // 프로젝션 적용
  return vectors.map((vec) => {
    const result = new Array(targetDim).fill(0)
    for (let i = 0; i < targetDim; i++) {
      for (let j = 0; j < sourceDim; j++) {
        result[i] += vec[j] * projectionMatrix[i][j]
      }
    }
    return result
  })
}
