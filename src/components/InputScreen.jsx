import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useModel } from '../hooks/useModel'
import { reduceWithUMAP } from '../utils/umap'

const EXAMPLE_TEXTS = `React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다.
Vue.js는 프로그레시브 자바스크립트 프레임워크입니다.
Angular는 TypeScript 기반의 웹 애플리케이션 프레임워크입니다.
Python은 다양한 용도로 사용되는 고급 프로그래밍 언어입니다.
Java는 객체지향 프로그래밍 언어로 많은 기업에서 사용됩니다.
JavaScript는 웹 브라우저에서 동작하는 스크립트 언어입니다.
TypeScript는 JavaScript에 타입을 추가한 언어입니다.
머신러닝은 데이터에서 패턴을 학습하는 기술입니다.
딥러닝은 신경망을 기반으로 한 머신러닝의 한 분야입니다.
자연어 처리는 컴퓨터가 인간의 언어를 이해하도록 하는 기술입니다.
컴퓨터 비전은 컴퓨터가 이미지를 이해하도록 하는 기술입니다.
데이터베이스는 구조화된 데이터를 저장하고 관리하는 시스템입니다.
SQL은 데이터베이스를 조작하기 위한 언어입니다.
NoSQL은 비관계형 데이터베이스를 의미합니다.
클라우드 컴퓨팅은 인터넷을 통해 컴퓨팅 리소스를 제공하는 서비스입니다.
도커는 컨테이너 기반의 가상화 플랫폼입니다.
쿠버네티스는 컨테이너 오케스트레이션 플랫폼입니다.
Git은 분산 버전 관리 시스템입니다.
GitHub는 Git 저장소 호스팅 서비스입니다.
REST API는 HTTP를 기반으로 한 웹 서비스 아키텍처입니다.`

export default function InputScreen() {
  const [inputText, setInputText] = useState(EXAMPLE_TEXTS)
  const [modelId, setModelId] = useState('Xenova/all-MiniLM-L6-v2')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { setStage, setTexts, setEmbeddings, setPositions3D, setLoadingProgress } = useStore()
  const { embed, loadModel } = useModel()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!inputText.trim()) {
      alert('텍스트를 입력해주세요.')
      return
    }

    // 텍스트를 줄바꿈으로 분리
    const texts = inputText
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    if (texts.length === 0) {
      alert('유효한 텍스트를 입력해주세요.')
      return
    }

    if (texts.length < 3) {
      alert('최소 3개 이상의 텍스트가 필요합니다.\n\n예제 버튼을 눌러보세요! 📚')
      return
    }

    setTexts(texts)
    setStage('loading')

    try {
      // 1. 모델 로드 (사용자가 선택한 모델 ID 전달)
      setLoadingProgress(10, `모델 로딩 중... (${modelId})`)
      await loadModel(modelId)

      // 2. 임베딩 생성
      setLoadingProgress(40, '임베딩 생성 중...')
      const embeddings = await embed(texts)

      // 임베딩 검증
      if (!embeddings || embeddings.length === 0) {
        throw new Error('임베딩 생성 실패: 빈 결과')
      }

      if (embeddings.length !== texts.length) {
        throw new Error(`임베딩 개수 불일치: ${embeddings.length} vs ${texts.length}`)
      }

      console.log('✅ 임베딩 생성 완료:', {
        count: embeddings.length,
        dimension: embeddings[0]?.length,
        sample: embeddings[0]?.slice(0, 5),
      })

      setEmbeddings(embeddings)

      // 3. 차원 축소 (UMAP)
      setLoadingProgress(60, '3D 좌표 계산 중 (UMAP)...')
      const positions3D = await reduceWithUMAP(embeddings, 3)

      // 좌표 검증
      if (!positions3D || positions3D.length === 0) {
        throw new Error('차원 축소 실패: 빈 결과')
      }

      console.log('✅ 차원 축소 완료:', {
        count: positions3D.length,
        sample: positions3D[0],
      })

      // 좌표 정규화
      setLoadingProgress(90, '최적화 중...')
      const normalized = normalizePositions(positions3D)
      setPositions3D(normalized)

      setLoadingProgress(100, '완료!')
      setTimeout(() => setStage('viewer'), 100)
    } catch (error) {
      console.error('❌ 처리 중 오류 발생:', error)
      alert('처리 중 오류가 발생했습니다: ' + error.message)
      setStage('input')
    }
  }

  // 3D 좌표 정규화 및 스케일링
  function normalizePositions(positions) {
    // NaN 체크
    if (positions.some((p) => p.some((v) => !isFinite(v)))) {
      console.error('❌ Invalid coordinates detected:', positions.slice(0, 3))
      throw new Error('유효하지 않은 좌표가 생성되었습니다. 다시 시도해주세요.')
    }

    if (positions.length === 0) {
      console.error('❌ No positions to normalize')
      return []
    }

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
    const scale = 100 // 스케일 대폭 증가 (더 넓게 분산)

    console.log('📊 정규화 정보:', {
      count: positions.length,
      mins: mins.map((v) => v.toFixed(2)),
      maxs: maxs.map((v) => v.toFixed(2)),
      scale,
    })

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

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-auto relative">
      {/* 별 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
      <div className="max-w-2xl w-full mx-2 sm:mx-4 my-4 sm:my-8 relative z-10">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">
            Blog<span className="text-purple-400">2</span>Space
          </h1>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg">
            텍스트를 3D 임베딩 공간으로 시각화하세요
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl"
        >
          {/* 고급 설정 토글 */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mb-4 text-purple-300 hover:text-purple-100 text-sm flex items-center gap-2 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            고급 설정 (임베딩 모델 변경)
          </button>

          {/* 모델 선택 (고급 설정) */}
          {showAdvanced && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <label className="block text-white text-sm font-semibold mb-2">
                🤗 Hugging Face 모델 ID
              </label>
              <input
                type="text"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono"
                placeholder="예: Xenova/all-MiniLM-L6-v2"
              />
              <p className="text-gray-400 text-xs mt-2">
                💡 Transformers.js 호환 임베딩 모델만 사용 가능합니다.
                <br />
                추천: Xenova/all-MiniLM-L6-v2, Xenova/bge-small-en-v1.5
              </p>
            </div>
          )}

          <div className="mb-4 sm:mb-6">
            <label className="block text-white text-sm font-semibold mb-2 sm:mb-3">
              텍스트 입력 (한 줄에 하나씩)
            </label>
            <textarea
              className="w-full h-48 sm:h-56 md:h-64 px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="예시:&#10;React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다.&#10;Vue.js는 프로그레시브 자바스크립트 프레임워크입니다.&#10;Python은 다양한 용도로 사용되는 고급 프로그래밍 언어입니다.&#10;..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <p className="text-gray-400 text-xs sm:text-sm mt-2">
              {inputText.split('\n').filter((t) => t.trim()).length}개의 텍스트
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 touch-manipulation shadow-lg hover:shadow-purple-500/50"
          >
            🚀 3D 우주로 시각화
          </button>
        </form>
      </div>
    </div>
  )
}
