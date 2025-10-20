/**
 * UMAP (Uniform Manifold Approximation and Projection)
 * Semantic Galaxy와 동일한 차원 축소 기법 사용
 */
import { UMAP } from 'umap-js'

/**
 * UMAP을 사용한 차원 축소
 * @param {Array<Array<number>>} vectors - 입력 벡터들
 * @param {number} targetDim - 목표 차원 (3)
 * @returns {Array<Array<number>>} 축소된 벡터들
 */
export async function reduceWithUMAP(vectors, targetDim = 3) {
  if (vectors.length === 0) {
    console.error('❌ UMAP: 벡터가 비어있습니다')
    return []
  }

  // 데이터가 너무 많으면 랜덤 프로젝션 사용 (성능 이슈 방지)
  if (vectors.length > 100) {
    console.warn('⚠️ 데이터가 많아 랜덤 프로젝션 사용 (성능 최적화)')
    return randomProjection(vectors, targetDim)
  }

  try {
    // UMAP 설정 - 안정적인 파라미터
    const nNeighbors = Math.max(2, Math.min(15, Math.floor(vectors.length / 3)))

    const umap = new UMAP({
      nComponents: targetDim,
      nEpochs: Math.min(200, vectors.length * 10), // epoch 제한
      nNeighbors,
      minDist: 0.1,
      spread: 1.0,
      random: () => Math.random(),
      distanceFn: 'cosine', // 텍스트 임베딩에 적합
    })

    console.log('🗺️ UMAP 시작:', {
      vectors: vectors.length,
      nNeighbors,
      nEpochs: Math.min(200, vectors.length * 10),
    })

    // UMAP 실행 (타임아웃 추가)
    const embedding = await Promise.race([
      umap.fitAsync(vectors),
      new Promise((_, reject) => setTimeout(() => reject(new Error('UMAP timeout')), 30000)),
    ])

    // NaN 체크
    if (embedding.some((e) => e.some((v) => !isFinite(v)))) {
      throw new Error('UMAP produced invalid values')
    }

    console.log('✅ UMAP 완료')
    return embedding
  } catch (error) {
    console.warn('⚠️ UMAP 실패, 랜덤 프로젝션 사용:', error.message)
    return randomProjection(vectors, targetDim)
  }
}

/**
 * 폴백: 랜덤 프로젝션
 */
function randomProjection(vectors, targetDim = 3) {
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
    if (norm > 0) {
      for (let j = 0; j < sourceDim; j++) {
        projectionMatrix[i][j] /= norm
      }
    }
  }

  // 프로젝션 적용
  return vectors.map((vec) => {
    const projected = new Array(targetDim).fill(0)
    for (let i = 0; i < targetDim; i++) {
      for (let j = 0; j < sourceDim; j++) {
        projected[i] += vec[j] * projectionMatrix[i][j]
      }
    }
    return projected
  })
}
