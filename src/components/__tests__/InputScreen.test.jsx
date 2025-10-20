import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useStore } from '../../store/useStore'
import InputScreen from '../InputScreen'

// Mock useModel hook
vi.mock('../../hooks/useModel', () => ({
  useModel: () => ({
    embed: vi.fn(async (texts) => {
      // Mock 임베딩 생성 (384차원)
      return texts.map(() =>
        Array(384)
          .fill(0)
          .map(() => Math.random())
      )
    }),
    loadModel: vi.fn(async () => {
      // Mock 모델 로딩
      return Promise.resolve()
    }),
  }),
}))

describe('InputScreen 컴포넌트 테스트', () => {
  beforeEach(() => {
    // 각 테스트 전에 store 초기화
    useStore.setState({
      stage: 'input',
      texts: [],
      embeddings: [],
      positions3D: [],
      loadingProgress: 0,
      loadingMessage: '',
      selectedIndex: null,
      searchQuery: '',
      searchResults: [],
    })
  })

  it('컴포넌트가 렌더링되어야 합니다', () => {
    render(<InputScreen />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Blog2Space')
  })

  it('예시 불러오기 버튼이 있어야 합니다', () => {
    render(<InputScreen />)
    expect(screen.getByText('예시 불러오기')).toBeInTheDocument()
  })

  it('3D 공간 생성 버튼이 있어야 합니다', () => {
    render(<InputScreen />)
    expect(screen.getByText('3D 공간 생성')).toBeInTheDocument()
  })
})
