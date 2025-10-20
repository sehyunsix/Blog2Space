import { useState } from 'react'
import { useModel } from '../hooks/useModel'

const POPULAR_MODELS = [
  {
    id: 'Xenova/all-MiniLM-L6-v2',
    name: 'MiniLM-L6',
    description: '빠르고 효율적 (384dim)',
  },
  {
    id: 'Xenova/all-mpnet-base-v2',
    name: 'MPNet Base',
    description: '높은 정확도 (768dim)',
  },
  {
    id: 'Xenova/bge-small-en-v1.5',
    name: 'BGE Small',
    description: '균형잡힌 성능 (384dim)',
  },
  {
    id: 'Xenova/gte-small',
    name: 'GTE Small',
    description: '최신 모델 (384dim)',
  },
  {
    id: 'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
    name: 'Multilingual',
    description: '다국어 지원 (384dim) ⚠️ 큰 파일',
  },
]

export default function ModelSelector() {
  const { loadModel, isLoading, isReady, progress, status, device, modelId } = useModel()
  console.log('🎨 ModelSelector render - progress:', progress, 'status:', status)
  const [selectedModel, setSelectedModel] = useState('Xenova/all-MiniLM-L6-v2')
  const [customModel, setCustomModel] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

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
    <div className="absolute left-2 sm:left-4 top-16 sm:top-20 z-10 w-72 sm:w-80 max-h-[calc(100vh-5rem)] overflow-auto">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border border-cyan-500/30">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-white"
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
            <h3 className="font-semibold text-white">🤗 임베딩 모델</h3>
          </div>
          <svg
            className={`w-5 h-5 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
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

            {/* 인기 모델 목록 */}
            <div className="space-y-2 mb-4">
              <div className="text-xs text-gray-400 mb-2">인기 모델</div>
              {POPULAR_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelChange(model.id)}
                  disabled={isLoading}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedModel === model.id && !showCustom
                      ? 'bg-cyan-500/30 border-2 border-cyan-500'
                      : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="font-medium text-white text-sm">{model.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{model.description}</div>
                </button>
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
                  <p className="text-xs text-gray-400">💡 Transformers.js 호환 모델만 사용 가능</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
