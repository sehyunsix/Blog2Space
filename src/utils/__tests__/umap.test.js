import { describe, it, expect } from 'vitest'
import { reduceWithUMAP } from '../umap'

describe('UMAP 차원 축소 테스트', () => {
  it('빈 배열을 처리해야 합니다', async () => {
    const result = await reduceWithUMAP([])
    expect(result).toEqual([])
  })

  it('유효한 벡터를 3차원으로 축소해야 합니다', async () => {
    // 5차원 벡터 10개 생성
    const vectors = Array(10)
      .fill(0)
      .map((_, i) => [Math.sin(i), Math.cos(i), Math.sin(i * 2), Math.cos(i * 2), i / 10])

    const result = await reduceWithUMAP(vectors, 3)

    // 결과 검증
    expect(result).toHaveLength(10)
    expect(result[0]).toHaveLength(3)

    // 모든 값이 유한수인지 확인
    result.forEach((point) => {
      point.forEach((value) => {
        expect(isFinite(value)).toBe(true)
        expect(isNaN(value)).toBe(false)
      })
    })
  })

  it('NaN이나 Infinity를 포함한 벡터를 거부해야 합니다', async () => {
    const invalidVectors = [
      [1, 2, 3, NaN, 5],
      [1, 2, 3, 4, 5],
      [1, 2, Infinity, 4, 5],
    ]

    const result = await reduceWithUMAP(invalidVectors, 3)
    expect(result).toEqual([])
  })

  it('대량의 데이터를 샘플링 후 처리해야 합니다', async () => {
    // 600개의 벡터 생성 (샘플링 임계값 초과)
    const vectors = Array(600)
      .fill(0)
      .map((_, i) =>
        Array(5)
          .fill(0)
          .map((_, j) => Math.sin(i + j))
      )

    const result = await reduceWithUMAP(vectors, 3)

    expect(result).toHaveLength(600)
    expect(result[0]).toHaveLength(3)

    // 모든 값이 유한수인지 확인
    result.forEach((point) => {
      point.forEach((value) => {
        expect(isFinite(value)).toBe(true)
      })
    })
  }, 60000) // 타임아웃 60초

  it('정규화된 벡터가 적절한 범위에 있어야 합니다', async () => {
    const vectors = Array(20)
      .fill(0)
      .map((_, i) =>
        Array(10)
          .fill(0)
          .map((_, j) => (i + j) / 20)
      )

    const result = await reduceWithUMAP(vectors, 3)

    // 결과가 너무 극단적인 값이 아닌지 확인
    result.forEach((point) => {
      point.forEach((value) => {
        expect(Math.abs(value)).toBeLessThan(1000)
      })
    })
  })
})
