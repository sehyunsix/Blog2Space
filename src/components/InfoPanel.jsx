import { useStore } from '../store/useStore'
import { useMemo } from 'react'

export default function InfoPanel() {
  const { texts, selectedIndex, setSelectedIndex, embeddings, positions3D, searchResults } =
    useStore()

  const selectedText = selectedIndex !== null ? texts[selectedIndex] : null
  const selectedEmbedding = selectedIndex !== null ? embeddings[selectedIndex] : null

  // 검색 결과가 있을 때는 모든 텍스트 표시
  const showAllTexts = searchResults.length > 0

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

  // 유사한 텍스트 찾기
  const similarTexts = useMemo(() => {
    if (selectedIndex === null || !selectedEmbedding) return []

    const similarities = texts
      .map((text, i) => ({
        text,
        index: i,
        similarity: i === selectedIndex ? 0 : cosineSimilarity(selectedEmbedding, embeddings[i]),
      }))
      .filter((item) => item.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)

    return similarities
  }, [selectedIndex, selectedEmbedding, texts, embeddings])

  // 검색 결과나 선택된 항목이 없으면 패널 숨김
  if (selectedIndex === null && !showAllTexts) return null

  return (
    <div className="hidden md:flex absolute top-16 sm:top-24 right-2 sm:right-4 w-80 sm:w-96 bg-gray-900/95 backdrop-blur-sm text-white rounded-lg shadow-2xl overflow-hidden z-10 max-h-[60vh] sm:max-h-[80vh] flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 sm:p-4 flex items-center justify-between">
        <h3 className="font-semibold text-sm sm:text-base">
          {showAllTexts ? '검색 결과' : '텍스트 정보'}
        </h3>
        <button
          onClick={() => setSelectedIndex(null)}
          className="text-white/80 hover:text-white transition-colors touch-manipulation"
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
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1">
        {/* 모든 텍스트 & 임베딩 표시 (검색 결과가 있을 때) */}
        {showAllTexts && (
          <div className="space-y-3">
            <div className="text-xs text-gray-400 mb-2">
              전체 {texts.length}개 텍스트 (유사도 순)
            </div>
            {searchResults
              .sort((a, b) => b.similarity - a.similarity)
              .map((result) => {
                const isHighSimilarity = result.similarity > 0.7
                return (
                  <div
                    key={result.index}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedIndex === result.index
                        ? 'bg-cyan-700 border-2 border-cyan-400'
                        : isHighSimilarity
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedIndex(result.index)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-cyan-400">
                        #{result.index + 1}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          isHighSimilarity ? 'text-cyan-300' : 'text-cyan-400'
                        }`}
                      >
                        유사도: {(result.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div
                      className={`text-sm line-clamp-2 ${
                        isHighSimilarity ? 'text-cyan-200 font-semibold' : 'text-gray-300'
                      }`}
                    >
                      {texts[result.index]}
                    </div>
                  </div>
                )
              })}
          </div>
        )}

        {/* 선택된 텍스트 상세 정보 (검색 결과가 없을 때) */}
        {!showAllTexts && selectedIndex !== null && (
          <>
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-1">선택된 텍스트</div>
              <div className="text-sm bg-gray-800 p-3 rounded-lg">{selectedText}</div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-1">임베딩 벡터 (처음 10개)</div>
              <div className="text-xs font-mono bg-gray-800 p-2 rounded max-h-32 overflow-y-auto">
                [
                {selectedEmbedding
                  ?.slice(0, 10)
                  .map((v) => v.toFixed(4))
                  .join(',\n ')}
                ...]
              </div>
            </div>

            <div className="mb-2">
              <div className="text-xs text-gray-400 mb-1">3D 좌표</div>
              <div className="text-xs font-mono bg-gray-800 p-2 rounded">
                x: {positions3D[selectedIndex][0].toFixed(2)}
                <br />
                y: {positions3D[selectedIndex][1].toFixed(2)}
                <br />
                z: {positions3D[selectedIndex][2].toFixed(2)}
              </div>
            </div>

            {similarTexts.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-gray-400 mb-2">유사한 텍스트 (코사인 유사도)</div>
                <div className="space-y-2">
                  {similarTexts.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIndex(item.index)}
                      className="w-full text-left bg-gray-800 hover:bg-gray-700 p-2 rounded transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-cyan-400">
                          #{item.index + 1}
                        </span>
                        <span className="text-xs text-cyan-400">
                          유사도: {(item.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 line-clamp-2">{item.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
