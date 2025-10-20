import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useModel } from '../useModel'

describe('useModel', () => {
  let mockWorker

  beforeEach(() => {
    // Mock Worker
    mockWorker = {
      postMessage: vi.fn(),
      onmessage: null,
      onerror: null,
      terminate: vi.fn(),
    }

    global.Worker = vi.fn(() => mockWorker)
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('초기 상태가 올바르게 설정되어야 함', () => {
    const { result } = renderHook(() => useModel())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isReady).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.progress).toBe(0)
    expect(result.current.status).toBe('Waiting to start...')
  })

  it('진행 상황 메시지를 처리해야 함', async () => {
    const { result } = renderHook(() => useModel())

    // Simulate progress message
    const progressMessage = {
      data: {
        type: 'progress',
        payload: {
          percentage: 50,
          status: '[2/4] 모델 다운로드 중...',
        },
      },
    }

    // Trigger the worker's onmessage
    mockWorker.onmessage?.(progressMessage)

    await waitFor(() => {
      expect(result.current.progress).toBe(50)
      expect(result.current.status).toBe('[2/4] 모델 다운로드 중...')
    })
  })

  it('ready 메시지를 처리해야 함', async () => {
    const { result } = renderHook(() => useModel())

    const readyMessage = {
      data: {
        type: 'ready',
        payload: {
          device: 'webgpu',
          modelId: 'Xenova/all-MiniLM-L6-v2',
        },
      },
    }

    mockWorker.onmessage?.(readyMessage)

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.progress).toBe(100)
      expect(result.current.device).toBe('webgpu')
      expect(result.current.modelId).toBe('Xenova/all-MiniLM-L6-v2')
    })
  })

  it('에러 메시지를 처리해야 함', async () => {
    const { result } = renderHook(() => useModel())

    const errorMessage = {
      data: {
        type: 'error',
        payload: 'Model loading failed',
      },
    }

    mockWorker.onmessage?.(errorMessage)

    await waitFor(() => {
      expect(result.current.error).toBe('Model loading failed')
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('loadModel이 worker에 메시지를 보내야 함', async () => {
    const { result } = renderHook(() => useModel())

    result.current.loadModel('Xenova/test-model')

    await waitFor(() => {
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'load-model',
        payload: { modelId: 'Xenova/test-model' },
      })
      expect(result.current.isLoading).toBe(true)
    })
  })

  it('4단계 진행 상황을 순차적으로 처리해야 함', async () => {
    const { result } = renderHook(() => useModel())

    const stages = [
      { percentage: 5, status: '[1/4] 토크나이저 다운로드 중...' },
      { percentage: 20, status: '[2/4] 모델 파일 다운로드 준비 중...' },
      { percentage: 50, status: '[2/4] 모델 다운로드 중... 100.0MB / 200.0MB' },
      { percentage: 85, status: '[3/4] 모델 초기화 중... (ONNX Runtime)' },
      { percentage: 95, status: '[4/4] 최종 설정 중...' },
      { percentage: 100, status: '✅ 모델 준비 완료!' },
    ]

    for (const stage of stages) {
      mockWorker.onmessage?.({
        data: {
          type: 'progress',
          payload: stage,
        },
      })

      await waitFor(() => {
        expect(result.current.progress).toBe(stage.percentage)
        expect(result.current.status).toBe(stage.status)
      })
    }
  })

  it('embed 함수가 텍스트를 임베딩해야 함', async () => {
    const { result } = renderHook(() => useModel())

    // Set worker as ready
    mockWorker.onmessage?.({
      data: {
        type: 'ready',
        payload: { device: 'webgpu', modelId: 'test' },
      },
    })

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })

    const texts = ['hello', 'world']
    const embedPromise = result.current.embed(texts)

    // Simulate embeddings response
    setTimeout(() => {
      mockWorker.onmessage?.({
        data: {
          type: 'embeddings',
          payload: {
            embeddings: [
              [0.1, 0.2, 0.3],
              [0.4, 0.5, 0.6],
            ],
          },
        },
      })
    }, 10)

    const embeddings = await embedPromise

    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: 'embed',
      payload: { texts },
    })
    expect(embeddings).toEqual([
      [0.1, 0.2, 0.3],
      [0.4, 0.5, 0.6],
    ])
  })
})
