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

  // 입력 벡터 검증 - NaN이나 Infinity 체크
  if (vectors.some((v) => v.some((x) => !isFinite(x)))) {
    console.error('❌ UMAP: 입력 벡터에 유효하지 않은 값이 있습니다')
    return []
  }

  // 데이터가 너무 많으면 샘플링 후 UMAP 사용 (성능 이슈 방지)
  if (vectors.length > 500) {
    console.warn('⚠️ 데이터가 많아 샘플링된 UMAP 사용 (성능 최적화)')
    return sampledUMAP(vectors, targetDim)
  }

  try {
    // UMAP 설정 - 안정적인 파라미터
    const nNeighbors = Math.max(2, Math.min(15, Math.floor(vectors.length / 3)))

    const umap = new UMAP({
      nComponents: targetDim,
      nEpochs: Math.min(200, vectors.length * 10), // epoch 제한
      nNeighbors,
      minDist: 0.5, // 최소 거리 대폭 증가
      spread: 3.0, // 퍼짐 정도 대폭 증가
      random: () => Math.random(),
      // distanceFn 제거 - umap-js가 문자열을 지원하지 않음
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
    console.warn('⚠️ UMAP 실패, 샘플링된 UMAP으로 재시도:', error.message)
    // UMAP 실패 시에도 샘플링된 UMAP 사용
    if (vectors.length > 100) {
      return sampledUMAP(vectors, targetDim)
    }
    // 데이터가 적으면 간단한 PCA 폴백
    return simplePCA(vectors, targetDim)
  }
}

/**
 * 간단한 PCA 폴백 (소량의 데이터용)
 */
function simplePCA(vectors, targetDim = 3) {
  console.log('🔄 간단한 PCA 사용')

  if (vectors.length === 0) return []

  // 평균 중심화
  const mean = vectors[0].map((_, i) => {
    const sum = vectors.reduce((acc, vec) => acc + vec[i], 0)
    return sum / vectors.length
  })

  const centered = vectors.map((vec) => vec.map((val, i) => val - mean[i]))

  // 간단한 랜덤 프로젝션 (PCA 근사)
  const sourceDim = vectors[0].length
  const projection = []

  for (let i = 0; i < targetDim; i++) {
    const component = new Array(sourceDim).fill(0).map(() => Math.random() - 0.5)
    const norm = Math.sqrt(component.reduce((sum, v) => sum + v * v, 0))
    projection.push(component.map((v) => v / norm))
  }

  // 프로젝션 적용
  const result = centered.map((vec) => {
    return projection.map((comp) => {
      let sum = 0
      for (let i = 0; i < vec.length; i++) {
        sum += vec[i] * comp[i]
      }
      return sum
    })
  })

  console.log('✅ PCA 완료')
  return result
}

/**
 * 샘플링된 UMAP - 데이터가 많을 때
 */
async function sampledUMAP(vectors, targetDim = 3) {
  console.log('🎲 샘플링 시작:', vectors.length, '개 → 300개로 샘플링')

  // 300개로 샘플링
  const sampleSize = 300
  const indices = []
  const step = Math.floor(vectors.length / sampleSize)

  for (let i = 0; i < vectors.length; i += step) {
    if (indices.length < sampleSize) {
      indices.push(i)
    }
  }

  const sampledVectors = indices.map((i) => vectors[i])

  // 샘플에 UMAP 적용
  const nNeighbors = Math.max(2, Math.min(15, Math.floor(sampledVectors.length / 3)))
  const umap = new UMAP({
    nComponents: targetDim,
    nEpochs: Math.min(200, sampledVectors.length * 10),
    nNeighbors,
    minDist: 0.5,
    spread: 3.0,
    random: () => Math.random(),
  })

  const sampledEmbedding = await umap.fitAsync(sampledVectors)

  // 나머지 데이터를 가까운 샘플 기반으로 배치
  const allEmbedding = vectors.map((vec, idx) => {
    if (indices.includes(idx)) {
      return sampledEmbedding[indices.indexOf(idx)]
    }

    // 가장 가까운 샘플 찾기
    let minDist = Infinity
    let closestIdx = 0

    for (let i = 0; i < sampledVectors.length; i++) {
      const dist = euclideanDistance(vec, sampledVectors[i])
      if (dist < minDist) {
        minDist = dist
        closestIdx = i
      }
    }

    // 가까운 샘플 위치에 약간의 노이즈 추가
    return sampledEmbedding[closestIdx].map((v) => v + (Math.random() - 0.5) * 2)
  })

  console.log('✅ 샘플링된 UMAP 완료')
  return allEmbedding
}

/**
 * 유클리드 거리 계산
 */
function euclideanDistance(a, b) {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i]
    sum += diff * diff
  }
  return Math.sqrt(sum)
}
