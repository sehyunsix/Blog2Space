import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useModel } from '../hooks/useModel'
import { reduceWithUMAP } from '../utils/umap'

export default function SearchPanel() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const {
    texts,
    embeddings,
    setSearchResults,
    setSelectedIndex,
    setCameraTarget,
    setSearchQueryData,
    setPositions3D,
  } = useStore()
  const { embed } = useModel()

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      // 검색어 임베딩
      const queryEmbeddings = await embed([query])
      const queryEmbedding = queryEmbeddings[0]

      console.log('🔍 검색 쿼리와 함께 UMAP 재계산 시작...')

      // 검색 쿼리를 포함하여 전체 UMAP 재계산
      const allEmbeddings = [...embeddings, queryEmbedding]
      const all3DPositions = await reduceWithUMAP(allEmbeddings, 3)

      // 정규화 (InputScreen과 동일한 방식)
      const normalizedPositions = normalizeAllPositions(all3DPositions)

      // 기존 포인트들의 위치 업데이트
      const newPositions3D = normalizedPositions.slice(0, -1) // 검색 쿼리 제외
      const queryPosition = normalizedPositions[normalizedPositions.length - 1] // 검색 쿼리 위치

      console.log('✅ UMAP 재계산 완료:', {
        totalPoints: normalizedPositions.length,
        queryPosition,
      })

      // Store 업데이트
      setPositions3D(newPositions3D)
      setSearchQueryData(query, queryEmbedding, queryPosition)

      // 코사인 유사도 계산
      const results = texts.map((text, i) => ({
        text,
        index: i,
        similarity: cosineSimilarity(queryEmbedding, embeddings[i]),
      }))

      // 유사도 순으로 정렬하고 0.3 이상만 필터링
      const filtered = results
        .filter((r) => r.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)

      setSearchResults(filtered)

      // 검색 쿼리 위치로 카메라 이동
      console.log('🎯 검색 쿼리 위치로 이동:', queryPosition)
      setCameraTarget(queryPosition)

      // 가장 유사한 포인트 선택
      if (filtered.length > 0) {
        setSelectedIndex(filtered[0].index)
      }
    } catch (error) {
      console.error('검색 오류:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // 코사인 유사도 계산
  function cosineSimilarity(a, b) {
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

  // 모든 포인트를 정규화 (InputScreen과 동일한 방식)
  function normalizeAllPositions(positions) {
    if (positions.length === 0) return []

    const dims = positions[0].length
    const mins = new Array(dims).fill(Infinity)
    const maxs = new Array(dims).fill(-Infinity)

    // 최소/최대값 계산
    for (const pos of positions) {
      for (let i = 0; i < dims; i++) {
        if (isFinite(pos[i])) {
          if (pos[i] < mins[i]) mins[i] = pos[i]
          if (pos[i] > maxs[i]) maxs[i] = pos[i]
        }
      }
    }

    // 스케일 계산
    const scale = 100

    return positions.map((pos) =>
      pos.map((val, i) => {
        const range = maxs[i] - mins[i]
        if (range === 0 || !isFinite(range)) {
          return 0
        }
        const normalized = ((val - mins[i]) / range - 0.5) * scale
        return isFinite(normalized) ? normalized : 0
      })
    )
  }

  const handleClear = async () => {
    setQuery('')
    setSearchResults([])
    setSelectedIndex(null)
    setCameraTarget(null)
    useStore.getState().clearSearchQueryData()

    // 검색 쿼리 없이 원래 위치로 복원 (UMAP 재계산)
    console.log('🔄 원래 위치로 복원 중...')
    try {
      const originalPositions = await reduceWithUMAP(embeddings, 3)
      const normalized = normalizeAllPositions(originalPositions)
      setPositions3D(normalized)
      console.log('✅ 원래 위치로 복원 완료')
    } catch (error) {
      console.error('❌ 복원 오류:', error)
    }
  }

  return (
    <div className="absolute top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-30 w-[calc(100%-1rem)] sm:w-full max-w-md px-2 sm:px-4">
      <form
        onSubmit={handleSearch}
        className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg"
      >
        <div className="flex items-center gap-2 p-2 sm:p-3">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="시맨틱 검색..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm sm:text-base"
            disabled={isSearching}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            {isSearching ? '검색 중...' : '검색'}
          </button>
        </div>
      </form>
    </div>
  )
}
