import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useModel } from '../hooks/useModel'

export default function SearchPanel() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { texts, embeddings, setSearchResults } = useStore()
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

  const handleClear = () => {
    setQuery('')
    setSearchResults([])
  }

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
      <form
        onSubmit={handleSearch}
        className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg"
      >
        <div className="flex items-center gap-2 p-3">
          <svg
            className="w-5 h-5 text-gray-400"
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
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            disabled={isSearching}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
