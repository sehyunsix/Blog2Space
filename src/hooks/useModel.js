import { useState, useCallback, useEffect } from 'react'

let worker = null
let workerReady = false
let deviceType = null
const pendingEmbeddings = []

// 전역 상태 (모든 컴포넌트가 공유)
let globalState = {
  isLoading: false,
  isReady: false,
  error: null,
  progress: 0,
  status: 'Waiting to start...',
  device: null,
  modelId: null,
}

// 구독자 목록 (모든 컴포넌트의 setState)
const subscribers = new Set()

// 전역 상태 업데이트 함수
const updateGlobalState = (newState) => {
  globalState = { ...globalState, ...newState }
  // 모든 구독자에게 알림
  subscribers.forEach((setState) => setState(globalState))
}

export const useModel = () => {
  const [state, setState] = useState(globalState)

  useEffect(() => {
    // 이 컴포넌트를 구독자로 등록
    subscribers.add(setState)
    console.log('🔧 useModel 구독 등록, 총 구독자:', subscribers.size)

    // Worker 초기화 (한 번만)
    if (!worker) {
      const workerUrl = new URL('../workers/embeddingWorker.js', import.meta.url)
      workerUrl.searchParams.set('v', Date.now().toString())
      console.log('🚀 Creating worker with URL:', workerUrl.toString())
      worker = new Worker(workerUrl, { type: 'module' })
      console.log('✅ Worker created successfully')

      worker.onmessage = (event) => {
        const { type, payload } = event.data
        console.log('📨 Worker message:', type, payload)

        if (type === 'progress') {
          console.log('📊 Updating progress:', payload.percentage, payload.status)
          updateGlobalState({
            progress: payload.percentage,
            status: payload.status,
            isLoading: true,
          })
        } else if (type === 'ready') {
          workerReady = true
          deviceType = payload.device
          updateGlobalState({
            isLoading: false,
            isReady: true,
            progress: 100,
            status: 'Ready!',
            device: payload.device,
            modelId: payload.modelId,
          })
        } else if (type === 'error') {
          console.error('Worker error:', payload)
          updateGlobalState({
            isLoading: false,
            error: payload,
            status: 'An error occurred',
          })
        } else if (type === 'embeddings') {
          // 임베딩 완료 시 로딩 상태 리셋
          updateGlobalState({
            isLoading: false,
            progress: 0,
            status: 'Ready!',
          })

          if (pendingEmbeddings.length > 0) {
            const callback = pendingEmbeddings.shift()
            callback?.(payload.embeddings)
          }
        }
      }

      worker.onerror = (error) => {
        console.error('Worker error:', error)
        updateGlobalState({
          isLoading: false,
          error: error.message,
          status: 'Worker error occurred',
        })
      }
    }

    return () => {
      // 언마운트 시 구독 해제
      subscribers.delete(setState)
      console.log('🔧 useModel 구독 해제, 남은 구독자:', subscribers.size)
    }
  }, [])

  const loadModel = useCallback(async (modelId) => {
    // 같은 모델이 이미 로드되어 있으면 건너뛰기
    if (workerReady && deviceType && globalState.modelId === modelId) {
      console.log('✅ Model already loaded:', modelId || 'default')
      return { device: deviceType }
    }

    // 모델이 변경되면 worker 재시작
    if (workerReady && globalState.modelId && globalState.modelId !== modelId) {
      console.log('🔄 Reloading with new model:', modelId)
      workerReady = false
    }

    updateGlobalState({
      isLoading: true,
      error: null,
      progress: 0,
      status: 'Initializing...',
      modelId: modelId || globalState.modelId || 'Xenova/all-MiniLM-L6-v2',
    })

    worker?.postMessage({ type: 'load-model', payload: { modelId } })

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('⏱️ 모델 로딩 타임아웃 (3분)')
        reject(
          new Error('Model loading timeout (3 minutes). 모델이 너무 크거나 네트워크가 느립니다.')
        )
      }, 180000)

      const checkReady = () => {
        if (workerReady && deviceType) {
          clearTimeout(timeout)
          resolve({ device: deviceType })
        } else if (globalState.error) {
          clearTimeout(timeout)
          reject(globalState.error)
        } else {
          setTimeout(checkReady, 500)
        }
      }
      checkReady()
    })
  }, [])

  const embed = useCallback(async (texts) => {
    return new Promise((resolve, reject) => {
      if (!workerReady) {
        reject(new Error('Model not ready'))
        return
      }

      pendingEmbeddings.push(resolve)
      worker?.postMessage({ type: 'embed', payload: { texts } })

      setTimeout(() => {
        if (pendingEmbeddings.includes(resolve)) {
          const index = pendingEmbeddings.indexOf(resolve)
          pendingEmbeddings.splice(index, 1)
          reject(new Error('Embedding timeout'))
        }
      }, 120000)
    })
  }, [])

  return {
    ...state,
    loadModel,
    embed,
  }
}
