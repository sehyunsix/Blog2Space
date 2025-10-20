import { useStore } from '../store/useStore'

export default function LoadingScreen() {
  const { loadingProgress, loadingMessage, texts } = useStore()

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">3D 공간 생성 중...</h2>

          <div className="mb-6">
            <div className="w-full bg-white/10 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-right text-white text-sm font-semibold">
              {Math.round(loadingProgress)}%
            </div>
          </div>

          <div className="space-y-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">{loadingProgress >= 10 ? '✓' : '⏳'}</div>
              <div className="flex-1">
                <span className={loadingProgress >= 10 ? 'text-green-400' : 'text-gray-300'}>
                  {texts.length}개 텍스트 로드 완료
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {loadingProgress >= 50 ? '✓' : loadingProgress >= 10 ? '⏳' : '○'}
              </div>
              <div className="flex-1">
                <span
                  className={
                    loadingProgress >= 50
                      ? 'text-green-400'
                      : loadingProgress >= 10
                        ? 'text-white'
                        : 'text-gray-500'
                  }
                >
                  임베딩 벡터 생성 중...
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {loadingProgress >= 80 ? '✓' : loadingProgress >= 50 ? '⏳' : '○'}
              </div>
              <div className="flex-1">
                <span
                  className={
                    loadingProgress >= 80
                      ? 'text-green-400'
                      : loadingProgress >= 50
                        ? 'text-white'
                        : 'text-gray-500'
                  }
                >
                  3D 좌표 계산 중...
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {loadingProgress >= 100 ? '✓' : loadingProgress >= 80 ? '⏳' : '○'}
              </div>
              <div className="flex-1">
                <span
                  className={
                    loadingProgress >= 100
                      ? 'text-green-400'
                      : loadingProgress >= 80
                        ? 'text-white'
                        : 'text-gray-500'
                  }
                >
                  3D 공간 렌더링 준비 중...
                </span>
              </div>
            </div>
          </div>

          {loadingMessage && (
            <div className="mt-6 text-center text-gray-300 text-sm">{loadingMessage}</div>
          )}

          <div className="mt-6 text-center text-gray-400 text-xs">
            처음 실행 시 AI 모델을 다운로드하므로 시간이 걸릴 수 있습니다.
          </div>
        </div>
      </div>
    </div>
  )
}
