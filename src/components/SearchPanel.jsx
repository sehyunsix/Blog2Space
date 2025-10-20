import { useState } from 'react'
import { useStore } from '../store/useStore'
import { searchTexts } from '../utils/embeddings'

export default function SearchPanel() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { texts, embeddings, setSearchResults } = useStore()

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchTexts(query, texts, embeddings)
      setSearchResults(results.filter((r) => r.similarity > 0.3)) // 유사도 0.3 이상만
    } catch (error) {
      console.error('검색 오류:', error)
    } finally {
      setIsSearching(false)
    }
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
