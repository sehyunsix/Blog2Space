import { pipeline, env } from '@xenova/transformers'
import { useStore } from '../store/useStore'
import { pca } from './pca'

// Transformers.js 설정
env.allowLocalModels = false
env.allowRemoteModels = true

let embedder = null

// 임베딩 모델 초기화
async function initEmbedder() {
  if (!embedder) {
    console.log('임베딩 모델 로딩 중...')
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      progress_callback: (progress) => {
        if (progress.status === 'downloading') {
          const percent = Math.round((progress.loaded / progress.total) * 100)
          console.log(`모델 다운로드 중: ${percent}%`)
        }
      },
    })
    console.log('임베딩 모델 로드 완료')
  }
  return embedder
}

// 텍스트를 임베딩 벡터로 변환
async function embedText(text) {
  const model = await initEmbedder()
  const output = await model(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data)
}

// 배치 임베딩
async function embedTexts(texts) {
  const embeddings = []

  for (let i = 0; i < texts.length; i++) {
    const embedding = await embedText(texts[i])
    embeddings.push(embedding)

    // 진행 상황 업데이트
    const progress = 10 + ((i + 1) / texts.length) * 40
    useStore.getState().setLoadingProgress(progress, `${i + 1}/${texts.length} 텍스트 처리 중...`)
  }

  return embeddings
}

// 코사인 유사도 계산
export function cosineSimilarity(a, b) {
  let dot = 0
  let magA = 0
  let magB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }

  magA = Math.sqrt(magA)
  magB = Math.sqrt(magB)

  if (magA === 0 || magB === 0) return 0
  return dot / (magA * magB)
}

// 텍스트 처리 전체 파이프라인
export async function processTexts(texts) {
  try {
    // 1. 임베딩 생성
    useStore.getState().setLoadingProgress(10, '임베딩 생성 시작...')
    const embeddings = await embedTexts(texts)
    useStore.getState().setEmbeddings(embeddings)

    // 2. 차원 축소 (384 -> 3)
    useStore.getState().setLoadingProgress(50, '3D 좌표 계산 중...')
    const positions3D = pca(embeddings, 3)

    // 좌표 정규화 및 스케일링
    const normalized = normalizePositions(positions3D)
    useStore.getState().setPositions3D(normalized)

    useStore.getState().setLoadingProgress(100, '완료!')

    console.log('처리 완료:', {
      textsCount: texts.length,
      embeddingsShape: [embeddings.length, embeddings[0].length],
      positions3DShape: [normalized.length, normalized[0].length],
    })
  } catch (error) {
    console.error('처리 중 오류:', error)
    throw error
  }
}

// 3D 좌표 정규화 및 스케일링
function normalizePositions(positions) {
  // 각 차원별 min, max 찾기
  const dims = positions[0].length
  const mins = new Array(dims).fill(Infinity)
  const maxs = new Array(dims).fill(-Infinity)

  for (const pos of positions) {
    for (let i = 0; i < dims; i++) {
      if (pos[i] < mins[i]) mins[i] = pos[i]
      if (pos[i] > maxs[i]) maxs[i] = pos[i]
    }
  }

  // 정규화 및 스케일링 (-20 ~ 20)
  const scale = 40
  return positions.map((pos) =>
    pos.map((val, i) => {
      const normalized = (val - mins[i]) / (maxs[i] - mins[i])
      return (normalized - 0.5) * scale
    })
  )
}

// 검색 기능
export async function searchTexts(query, texts, embeddings) {
  if (!query || !texts || !embeddings) return []

  const queryEmbedding = await embedText(query)

  const results = texts.map((text, i) => ({
    text,
    index: i,
    similarity: cosineSimilarity(queryEmbedding, embeddings[i]),
  }))

  return results.sort((a, b) => b.similarity - a.similarity)
}
