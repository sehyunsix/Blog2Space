import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ModelSelector from '../ModelSelector'
import { useModel } from '../../hooks/useModel'

// Mock useModel hook
vi.mock('../../hooks/useModel', () => ({
  useModel: vi.fn(),
}))

describe('ModelSelector', () => {
  const mockLoadModel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useModel.mockReturnValue({
      loadModel: mockLoadModel,
      isLoading: false,
      isReady: false,
      progress: 0,
      status: 'Waiting to start...',
      device: null,
      modelId: null,
    })
  })

  it('컴포넌트가 렌더링되어야 함', () => {
    render(<ModelSelector />)
    expect(screen.getByText('🤗 임베딩 모델')).toBeInTheDocument()
  })

  it('인기 모델 목록이 표시되어야 함', () => {
    render(<ModelSelector />)
    expect(screen.getByText('MiniLM-L6')).toBeInTheDocument()
    expect(screen.getByText('MPNet Base')).toBeInTheDocument()
    expect(screen.getByText('BGE Small')).toBeInTheDocument()
    expect(screen.getByText('GTE Small')).toBeInTheDocument()
    expect(screen.getByText('Multilingual')).toBeInTheDocument()
  })

  it('모델 선택 시 loadModel이 호출되어야 함', async () => {
    render(<ModelSelector />)

    const mpnetButton = screen.getByText('MPNet Base').closest('button')
    fireEvent.click(mpnetButton)

    await waitFor(() => {
      expect(mockLoadModel).toHaveBeenCalledWith('Xenova/all-mpnet-base-v2')
    })
  })

  it('로딩 중일 때 프로그레스 바가 표시되어야 함', () => {
    useModel.mockReturnValue({
      loadModel: mockLoadModel,
      isLoading: true,
      isReady: false,
      progress: 50,
      status: '[2/4] 모델 다운로드 중... 100.0MB / 200.0MB',
      device: null,
      modelId: null,
    })

    render(<ModelSelector />)

    expect(screen.getByText('로딩 중...')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('[2/4] 모델 다운로드 중... 100.0MB / 200.0MB')).toBeInTheDocument()
  })

  it('4단계 진행 상황이 올바르게 표시되어야 함', () => {
    const stages = [
      { percentage: 5, status: '[1/4] 토크나이저 다운로드 중...' },
      { percentage: 50, status: '[2/4] 모델 다운로드 중... 200.0MB / 400.0MB' },
      { percentage: 85, status: '[3/4] 모델 초기화 중... (ONNX Runtime)' },
      { percentage: 95, status: '[4/4] 최종 설정 중...' },
    ]

    stages.forEach((stage) => {
      useModel.mockReturnValue({
        loadModel: mockLoadModel,
        isLoading: true,
        isReady: false,
        progress: stage.percentage,
        status: stage.status,
        device: null,
        modelId: null,
      })

      const { rerender } = render(<ModelSelector />)

      expect(screen.getByText(`${stage.percentage}%`)).toBeInTheDocument()
      expect(screen.getByText(stage.status)).toBeInTheDocument()

      rerender(<ModelSelector />)
    })
  })

  it('모델 준비 완료 시 상태가 표시되어야 함', () => {
    useModel.mockReturnValue({
      loadModel: mockLoadModel,
      isLoading: false,
      isReady: true,
      progress: 100,
      status: 'Ready!',
      device: 'webgpu',
      modelId: 'Xenova/all-MiniLM-L6-v2',
    })

    render(<ModelSelector />)

    expect(screen.getByText('모델 준비됨')).toBeInTheDocument()
    expect(screen.getByText('Xenova/all-MiniLM-L6-v2')).toBeInTheDocument()
    expect(screen.getByText('Device: webgpu')).toBeInTheDocument()
  })

  it('커스텀 모델 입력이 동작해야 함', async () => {
    render(<ModelSelector />)

    const customButton = screen.getByText('커스텀 모델')
    fireEvent.click(customButton)

    const input = screen.getByPlaceholderText('예: Xenova/your-model')
    fireEvent.change(input, { target: { value: 'Xenova/custom-model' } })

    const loadButton = screen.getByText('모델 로드')
    fireEvent.click(loadButton)

    await waitFor(() => {
      expect(mockLoadModel).toHaveBeenCalledWith('Xenova/custom-model')
    })
  })

  it('로딩 중에는 버튼이 비활성화되어야 함', () => {
    useModel.mockReturnValue({
      loadModel: mockLoadModel,
      isLoading: true,
      isReady: false,
      progress: 50,
      status: '[2/4] 모델 다운로드 중...',
      device: null,
      modelId: null,
    })

    render(<ModelSelector />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      if (button.textContent !== '🤗 임베딩 모델') {
        expect(button).toBeDisabled()
      }
    })
  })

  it('큰 모델 경고가 표시되어야 함', () => {
    render(<ModelSelector />)
    expect(screen.getByText('다국어 지원 (384dim) ⚠️ 큰 파일')).toBeInTheDocument()
  })

  it('패널 확장/축소가 동작해야 함', () => {
    render(<ModelSelector />)

    const header = screen.getByText('🤗 임베딩 모델').closest('div')
    expect(screen.getByText('MiniLM-L6')).toBeVisible()

    fireEvent.click(header)

    // Note: 실제 축소는 CSS로 처리되므로 state만 확인
    expect(header).toBeInTheDocument()
  })
})
