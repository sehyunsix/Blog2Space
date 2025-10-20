import { create } from 'zustand'

export const useStore = create((set) => ({
  // Stage: 'input' | 'loading' | 'viewer'
  stage: 'input',
  setStage: (stage) => set({ stage }),

  // 텍스트 데이터
  texts: [],
  setTexts: (texts) => set({ texts }),

  // 임베딩 데이터
  embeddings: [],
  setEmbeddings: (embeddings) => set({ embeddings }),

  // 3D 포지션
  positions3D: [],
  setPositions3D: (positions3D) => set({ positions3D }),

  // 로딩 상태
  loadingProgress: 0,
  loadingMessage: '',
  setLoadingProgress: (progress, message) =>
    set({ loadingProgress: progress, loadingMessage: message }),

  // 선택된 포인트
  selectedIndex: null,
  setSelectedIndex: (index) => set({ selectedIndex: index }),

  // 검색 쿼리
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // 검색 결과
  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),
}))
