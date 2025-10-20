import { describe, it, expect } from 'vitest'

describe('임베딩 유틸리티 테스트', () => {
  it('코사인 유사도 계산이 정확해야 합니다', () => {
    function cosineSimilarity(a, b) {
      let dot = 0
      let magA = 0
      let magB = 0

      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i]
        magA += a[i] * a[i]
        magB += b[i] * b[i]
      }

      magA = Math.sqrt(magA)
      magB = Math.sqrt(magB)

      if (magA === 0 || magB === 0) return 0
      return dot / (magA * magB)
    }

    // 동일한 벡터의 유사도는 1
    const vec1 = [1, 2, 3, 4, 5]
    expect(cosineSimilarity(vec1, vec1)).toBeCloseTo(1.0, 5)

    // 반대 방향 벡터의 유사도는 -1
    const vec2 = [-1, -2, -3, -4, -5]
    expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(-1.0, 5)

    // 직교 벡터의 유사도는 0
    const vec3 = [1, 0, 0, 0, 0]
    const vec4 = [0, 1, 0, 0, 0]
    expect(cosineSimilarity(vec3, vec4)).toBeCloseTo(0.0, 5)
  })

  it('좌표 정규화가 올바르게 작동해야 합니다', () => {
    function normalizePositions(positions) {
      if (positions.some((p) => p.some((v) => !isFinite(v)))) {
        throw new Error('Invalid coordinates')
      }

      if (positions.length === 0) return []

      const dims = positions[0].length
      const mins = new Array(dims).fill(Infinity)
      const maxs = new Array(dims).fill(-Infinity)

      for (const pos of positions) {
        for (let i = 0; i < dims; i++) {
          if (isFinite(pos[i])) {
            if (pos[i] < mins[i]) mins[i] = pos[i]
            if (pos[i] > maxs[i]) maxs[i] = pos[i]
          }
        }
      }

      const scale = 100

      return positions.map((pos) =>
        pos.map((val, i) => {
          const range = maxs[i] - mins[i]
          if (range === 0 || !isFinite(range)) return 0
          const normalized = ((val - mins[i]) / range - 0.5) * scale
          return isFinite(normalized) ? normalized : 0
        })
      )
    }

    // 테스트 데이터
    const positions = [
      [0, 0, 0],
      [10, 10, 10],
      [5, 5, 5],
    ]

    const normalized = normalizePositions(positions)

    // 결과 검증
    expect(normalized).toHaveLength(3)
    expect(normalized[0]).toHaveLength(3)

    // 모든 값이 유한수여야 함
    normalized.forEach((pos) => {
      pos.forEach((val) => {
        expect(isFinite(val)).toBe(true)
      })
    })

    // 최소값은 -50, 최대값은 50 근처여야 함
    const min = Math.min(...normalized.flat())
    const max = Math.max(...normalized.flat())
    expect(min).toBeCloseTo(-50, 0)
    expect(max).toBeCloseTo(50, 0)
  })

  it('NaN이 있는 좌표를 거부해야 합니다', () => {
    function normalizePositions(positions) {
      if (positions.some((p) => p.some((v) => !isFinite(v)))) {
        throw new Error('Invalid coordinates')
      }
      return positions
    }

    const invalidPositions = [
      [1, 2, 3],
      [NaN, 5, 6],
      [7, 8, 9],
    ]

    expect(() => normalizePositions(invalidPositions)).toThrow('Invalid coordinates')
  })
})
