import { useState } from 'react'
import { useModel } from '../hooks/useModel'

const MODEL_CATEGORIES = {
  recommended: {
    title: '⭐ 추천 모델',
    models: [
      {
        id: 'Xenova/all-MiniLM-L6-v2',
        name: 'MiniLM-L6',
        description: '빠르고 효율적 (384dim)',
        size: '~23MB',
      },
      {
        id: 'Xenova/bge-small-en-v1.5',
        name: 'BGE Small',
        description: '균형잡힌 성능 (384dim)',
        size: '~33MB',
      },
      {
        id: 'Xenova/gte-small',
        name: 'GTE Small',
        description: '최신 모델 (384dim)',
        size: '~33MB',
      },
    ],
  },
  multilingual: {
    title: '🌏 다국어 모델',
    models: [
      {
        id: 'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
        name: 'Multilingual MiniLM',
        description: '50개 언어 지원 (384dim)',
        size: '~470MB',
      },
      {
        id: 'Xenova/multilingual-e5-small',
        name: 'E5 Multilingual',
        description: '100개 언어 (384dim)',
        size: '~470MB',
      },
      {
        id: 'Xenova/paraphrase-multilingual-mpnet-base-v2',
        name: 'MPNet Multilingual',
        description: '다국어 고성능 (768dim)',
        size: '~420MB',
      },
    ],
  },
  english: {
    title: '🇺🇸 영어 특화',
    models: [
      {
        id: 'Xenova/all-mpnet-base-v2',
        name: 'MPNet Base',
        description: '높은 정확도 (768dim)',
        size: '~420MB',
      },
      {
        id: 'Xenova/nomic-embed-text-v1.5',
        name: 'Nomic Embed',
        description: '고성능 임베딩 (768dim)',
        size: '~550MB',
      },
      {
        id: 'Xenova/bge-base-en-v1.5',
        name: 'BGE Base',
        description: '고성능 영어 (768dim)',
        size: '~420MB',
      },
      {
        id: 'Xenova/bge-large-en-v1.5',
        name: 'BGE Large',
        description: '최고 성능 (1024dim) ⚠️',
        size: '~1.2GB',
      },
    ],
  },
  specialized: {
    title: '🎯 특수 목적',
    models: [
      {
        id: 'Xenova/LaBSE',
        name: 'LaBSE',
        description: '109개 언어, 병렬 텍스트 (768dim)',
        size: '~470MB',
      },
      {
        id: 'Xenova/sentence-t5-base',
        name: 'Sentence-T5',
        description: 'T5 기반 임베딩 (768dim)',
        size: '~220MB',
      },
      {
        id: 'Xenova/all-distilroberta-v1',
        name: 'DistilRoBERTa',
        description: '경량 RoBERTa (768dim)',
        size: '~82MB',
      },
    ],
  },
}

export default function ModelSelector() {
  const { loadModel, isLoading, isReady, progress, status, device, modelId } = useModel()
  console.log('🎨 ModelSelector render - progress:', progress, 'status:', status)
  const [selectedModel, setSelectedModel] = useState('Xenova/all-MiniLM-L6-v2')
  const [customModel, setCustomModel] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  // 모바일에서는 기본적으로 닫힌 상태
  const [isExpanded, setIsExpanded] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 768
  )
  // 모바일에서 패널 완전히 숨김/표시
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleModelChange = async (modelId) => {
    setSelectedModel(modelId)
    setShowCustom(false)
    try {
      await loadModel(modelId)
    } catch (error) {
      console.error('모델 로드 실패:', error)
      alert('모델 로드에 실패했습니다: ' + error.message)
    }
  }

  const handleCustomModelLoad = async () => {
    if (!customModel.trim()) {
      alert('모델 ID를 입력해주세요.')
      return
    }
    setSelectedModel(customModel)
    try {
      await loadModel(customModel)
    } catch (error) {
      console.error('커스텀 모델 로드 실패:', error)
      alert('모델 로드에 실패했습니다: ' + error.message)
    }
  }

  return (
    <>
      {/* 모바일 플로팅 버튼 */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed left-4 bottom-4 z-20 w-14 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center touch-manipulation"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
      </button>

      {/* 패널 - 모바일: 조건부 표시, 데스크톱: 항상 표시 */}
      <div
        className={`absolute left-2 sm:left-4 top-16 sm:top-20 z-10 w-72 sm:w-80 max-h-[calc(100vh-5rem)] overflow-auto transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-[120%]'
        } md:translate-x-0`}
      >
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border border-cyan-500/30">
          {/* Header - 항상 표시 */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 sm:p-4 flex items-center justify-between">
            <div
              className="flex items-center gap-2 flex-1 cursor-pointer touch-manipulation"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
              <h3 className="font-semibold text-white text-sm sm:text-base">🤗 모델 선택</h3>
              <svg
                className={`w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* 모바일 닫기 버튼 */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden ml-2 text-white/80 hover:text-white transition-colors touch-manipulation"
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
          </div>

          {/* Content */}
          {isExpanded && (
            <div className="p-4">
              {/* 현재 모델 상태 */}
              {isLoading && (
                <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-blue-400 font-medium">{progress}%</span>
                  </div>
                  <div className="text-sm text-white font-medium break-words mb-2">{status}</div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    💡 큰 모델은 다운로드에 시간이 걸릴 수 있습니다 (최대 3분)
                  </div>
                </div>
              )}

              {isReady && (
                <div className="mb-4 p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-cyan-400 font-medium">모델 준비됨</span>
                  </div>
                  <div className="text-xs text-gray-300 mt-1 truncate" title={modelId}>
                    {modelId || 'Xenova/all-MiniLM-L6-v2'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Device: {device || 'unknown'}</div>
                </div>
              )}

              {/* 카테고리별 모델 목록 */}
              <div className="space-y-4 mb-4">
                {Object.entries(MODEL_CATEGORIES).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="space-y-2">
                    <div className="text-xs font-semibold text-cyan-400 mb-2">{category.title}</div>
                    {category.models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelChange(model.id)}
                        disabled={isLoading}
                        className={`w-full text-left p-3 rounded-lg transition-all touch-manipulation ${
                          selectedModel === model.id && !showCustom
                            ? 'bg-cyan-500/30 border-2 border-cyan-500'
                            : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-medium text-white text-sm">{model.name}</div>
                            <div className="text-xs text-gray-400 mt-1">{model.description}</div>
                          </div>
                          <div className="text-xs text-cyan-400 whitespace-nowrap">
                            {model.size}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* 커스텀 모델 */}
              <div className="border-t border-gray-700 pt-4">
                <button
                  onClick={() => setShowCustom(!showCustom)}
                  className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors mb-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium">커스텀 모델</span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${showCustom ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>

                {showCustom && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      placeholder="예: Xenova/your-model"
                      disabled={isLoading}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                      onClick={handleCustomModelLoad}
                      disabled={isLoading || !customModel.trim()}
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      모델 로드
                    </button>
                    <p className="text-xs text-gray-400">
                      💡 Transformers.js 호환 모델만 사용 가능
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
