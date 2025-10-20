import { useState, useCallback, useEffect } from 'react'

let worker = null
let workerReady = false
let deviceType = null // 전역 변수로 device 저장
const pendingEmbeddings = []

export const useModel = () => {
  const [state, setState] = useState({
    isLoading: false,
    isReady: false,
    error: null,
    progress: 0,
    status: 'Waiting to start...',
    device: null,
  })

  useEffect(() => {
    if (!worker) {
      worker = new Worker(new URL('../workers/embeddingWorker.js', import.meta.url), {
        type: 'module',
      })

      worker.onmessage = (event) => {
        const { type, payload } = event.data

        if (type === 'progress') {
          setState((prev) => ({
            ...prev,
            progress: payload.percentage,
            status: payload.status,
          }))
        } else if (type === 'ready') {
          workerReady = true
          deviceType = payload.device
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isReady: true,
            progress: 100,
            status: 'Ready!',
            device: payload.device,
          }))
        } else if (type === 'error') {
          console.error('Worker error:', payload)
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: payload,
            status: 'An error occurred',
          }))
        } else if (type === 'embeddings') {
          if (pendingEmbeddings.length > 0) {
            const callback = pendingEmbeddings.shift()
            callback?.(payload.embeddings)
          }
        }
      }

      worker.onerror = (error) => {
        console.error('Worker error:', error)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
          status: 'Worker error occurred',
        }))
      }
    }

    return () => {
      // Cleanup은 하지 않음 - worker를 재사용
    }
  }, [])

  const loadModel = useCallback(async () => {
    if (workerReady && deviceType) {
      return { device: deviceType }
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0,
      status: 'Initializing...',
    }))

    worker?.postMessage({ type: 'load-model' })

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Model loading timeout'))
      }, 60000)

      const checkReady = () => {
        if (workerReady && deviceType) {
          clearTimeout(timeout)
          resolve({ device: deviceType })
        } else if (state.error) {
          clearTimeout(timeout)
          reject(state.error)
        } else {
          setTimeout(checkReady, 500)
        }
      }
      checkReady()
    })
  }, [state.error])

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
