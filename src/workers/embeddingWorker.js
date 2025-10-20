import { AutoModel, AutoTokenizer } from '@huggingface/transformers'

// Worker version: 2.0 - 4-stage progress display
const DEFAULT_MODEL_ID = 'Xenova/all-MiniLM-L6-v2'
let model = null
let tokenizer = null
let device = null
let lastProgressUpdate = 0
const PROGRESS_THROTTLE_MS = 200 // UI 업데이트는 200ms마다만

self.onmessage = async (event) => {
  const { type, payload } = event.data

  if (type === 'load-model') {
    try {
      const modelId = payload?.modelId || DEFAULT_MODEL_ID

      // 즉시 첫 번째 progress 메시지 보내기
      self.postMessage({
        type: 'progress',
        payload: {
          percentage: 0,
          status: `[1/4] 초기화 중...`,
        },
      })

      // WebGPU 사용 가능 여부 확인
      let isWebGPUAvailable = false
      if (navigator.gpu) {
        try {
          isWebGPUAvailable = !!(await navigator.gpu.requestAdapter())
        } catch (e) {
          console.log('WebGPU not available:', e)
        }
      }

      device = isWebGPUAvailable ? 'webgpu' : 'wasm'

      self.postMessage({
        type: 'progress',
        payload: {
          percentage: 5,
          status: `[1/4] 토크나이저 다운로드 중...`,
        },
      })

      tokenizer = await AutoTokenizer.from_pretrained(modelId, {
        progress_callback: (progress) => {
          if (progress.status === 'progress') {
            const percentage = 5 + Math.round((progress.loaded / progress.total) * 15)
            self.postMessage({
              type: 'progress',
              payload: {
                percentage,
                status: `[1/4] 토크나이저 다운로드 중...`,
              },
            })
          }
        },
      })

      self.postMessage({
        type: 'progress',
        payload: {
          percentage: 20,
          status: `[2/4] 모델 파일 다운로드 준비 중...`,
        },
      })

      model = await AutoModel.from_pretrained(modelId, {
        device,
        dtype: device === 'webgpu' ? 'fp32' : 'q8',
        progress_callback: (progress) => {
          if (progress.status === 'progress') {
            const percentage = 20 + Math.round((progress.loaded / progress.total) * 60)
            const loadedMB = (progress.loaded / 1024 / 1024).toFixed(1)
            const totalMB = (progress.total / 1024 / 1024).toFixed(1)

            // UI 업데이트 (throttle 적용)
            const now = Date.now()
            const isLastChunk = progress.loaded === progress.total

            if (now - lastProgressUpdate > PROGRESS_THROTTLE_MS || isLastChunk) {
              lastProgressUpdate = now
              self.postMessage({
                type: 'progress',
                payload: {
                  percentage,
                  status: `[2/4] 모델 다운로드 중... ${loadedMB}MB / ${totalMB}MB`,
                },
              })
            }
          } else if (progress.status === 'download') {
            self.postMessage({
              type: 'progress',
              payload: {
                percentage: 25,
                status: `[2/4] 파일 다운로드 시작...`,
              },
            })
          } else if (progress.status === 'done') {
            // 다운로드 완료 후 초기화 시작 안내
            self.postMessage({
              type: 'progress',
              payload: {
                percentage: 85,
                status: '[3/4] 모델 초기화 중... (ONNX Runtime)',
              },
            })
          } else if (progress.status === 'ready') {
            self.postMessage({
              type: 'progress',
              payload: {
                percentage: 95,
                status: '[4/4] 최종 설정 중...',
              },
            })
          }
        },
      })

      // 최종 완료 메시지
      self.postMessage({
        type: 'progress',
        payload: {
          percentage: 100,
          status: '✅ 모델 준비 완료!',
        },
      })

      self.postMessage({
        type: 'ready',
        payload: { device, modelId },
      })
    } catch (error) {
      console.error('Model loading error:', error)
      self.postMessage({
        type: 'error',
        payload: error instanceof Error ? error.message : String(error),
      })
    }
  } else if (type === 'embed' && model && tokenizer) {
    try {
      const { texts } = payload

      // 1단계: 토크나이징 (텍스트를 숫자로 변환)
      self.postMessage({
        type: 'progress',
        payload: {
          percentage: 40,
          status: `[1/3] 토크나이징 중... (${texts.length}개 텍스트)`,
        },
      })

      const inputs = tokenizer(texts, {
        padding: true,
        truncation: true,
      })

      // 2단계: 모델 실행 (임베딩 벡터 생성)
      self.postMessage({
        type: 'progress',
        payload: {
          percentage: 50,
          status: `[2/3] AI 모델 실행 중... (${texts.length}개 처리)`,
        },
      })

      const outputs = await model(inputs)

      // 3단계: Mean Pooling & 정규화
      self.postMessage({
        type: 'progress',
        payload: {
          percentage: 70,
          status: '[3/3] 임베딩 변환 중... (평균화)',
        },
      })

      // Mean pooling
      const embeddings = []
      const hiddenStates = outputs.last_hidden_state
      const attentionMask = inputs.attention_mask

      for (let i = 0; i < texts.length; i++) {
        try {
          const embedding = meanPooling(hiddenStates, attentionMask, i)

          // NaN 체크 및 정규화
          const embeddingArray = Array.from(embedding)

          // NaN이나 Infinity 체크
          const hasInvalidValues = embeddingArray.some((v) => !isFinite(v))
          if (hasInvalidValues) {
            console.warn(`⚠️ Invalid embedding at index ${i}, using fallback`)
            console.warn(`⚠️ 문제 텍스트 (${i}):`, texts[i]?.substring(0, 100))
            // fallback: 작은 랜덤 벡터
            const fallbackEmbedding = new Array(embeddingArray.length)
              .fill(0)
              .map(() => (Math.random() - 0.5) * 0.01)
            embeddings.push(fallbackEmbedding)
            continue
          }

          // L2 정규화 (벡터 길이를 1로 만들기)
          const norm = Math.sqrt(embeddingArray.reduce((sum, val) => sum + val * val, 0))
          const normalizedEmbedding =
            norm > 1e-10
              ? embeddingArray.map((v) => v / norm)
              : new Array(embeddingArray.length).fill(0).map(() => (Math.random() - 0.5) * 0.01) // norm이 너무 작으면 랜덤 벡터

          // 정규화 후에도 NaN 체크
          if (normalizedEmbedding.some((v) => !isFinite(v))) {
            console.warn(`⚠️ Normalization failed at index ${i}, using fallback`)
            const fallbackEmbedding = new Array(normalizedEmbedding.length)
              .fill(0)
              .map(() => (Math.random() - 0.5) * 0.01)
            embeddings.push(fallbackEmbedding)
            continue
          }

          embeddings.push(normalizedEmbedding)
        } catch (error) {
          console.error(`❌ Error processing text ${i}:`, error)
          // fallback: 작은 랜덤 벡터
          const hiddenSize = hiddenStates.dims[2]
          const fallbackEmbedding = new Array(hiddenSize)
            .fill(0)
            .map(() => (Math.random() - 0.5) * 0.01)
          embeddings.push(fallbackEmbedding)
        }

        // 진행 상황 업데이트
        if (i % 10 === 0 || i === texts.length - 1) {
          const progress = 70 + Math.round(((i + 1) / texts.length) * 30)
          self.postMessage({
            type: 'progress',
            payload: {
              percentage: progress,
              status: `[3/3] 임베딩 변환 중... ${i + 1}/${texts.length}`,
            },
          })
        }
      }

      // 최종 검증
      if (embeddings.length !== texts.length) {
        throw new Error(`임베딩 개수 불일치: ${embeddings.length} vs ${texts.length}`)
      }

      // 모든 임베딩이 유효한지 최종 확인
      const invalidCount = embeddings.filter((emb) => emb.some((v) => !isFinite(v))).length
      if (invalidCount > 0) {
        console.error(`❌ ${invalidCount}개의 임베딩에 유효하지 않은 값이 있습니다`)
        throw new Error(`${invalidCount}개의 임베딩 생성 실패`)
      }

      console.log(`✅ Embeddings generated: ${embeddings.length}`)
      console.log(`📊 First embedding sample (10 values):`, embeddings[0]?.slice(0, 10))
      console.log(`📊 Embedding stats:`, {
        min: Math.min(...embeddings[0]),
        max: Math.max(...embeddings[0]),
        avg: embeddings[0].reduce((a, b) => a + b, 0) / embeddings[0].length,
      })

      self.postMessage({
        type: 'embeddings',
        payload: { embeddings },
      })
    } catch (error) {
      console.error('Embedding error:', error)
      self.postMessage({
        type: 'error',
        payload: error instanceof Error ? error.message : String(error),
      })
    }
  }
}

// Mean pooling 함수 (배치 처리용)
function meanPooling(hiddenStates, attentionMask, batchIndex) {
  const seqLength = hiddenStates.dims[1]
  const hiddenSize = hiddenStates.dims[2]
  const data = hiddenStates.data

  const result = new Float32Array(hiddenSize)
  let tokenCount = 0

  const batchOffset = batchIndex * seqLength * hiddenSize

  for (let i = 0; i < seqLength; i++) {
    const maskValue = attentionMask.data[batchIndex * seqLength + i]
    if (maskValue === 1 || maskValue === 1n) {
      for (let j = 0; j < hiddenSize; j++) {
        const value = data[batchOffset + i * hiddenSize + j]
        // NaN/Infinity 체크
        if (isFinite(value)) {
          result[j] += value
        }
      }
      tokenCount++
    }
  }

  // 평균 계산
  if (tokenCount > 0) {
    for (let j = 0; j < hiddenSize; j++) {
      result[j] /= tokenCount
    }
  } else {
    // tokenCount가 0이면 경고하고 작은 랜덤 값으로 채우기
    console.warn(`⚠️ 배치 ${batchIndex}: 유효한 토큰이 없습니다. 기본 임베딩 사용`)
    for (let j = 0; j < hiddenSize; j++) {
      result[j] = (Math.random() - 0.5) * 0.01 // 작은 랜덤 값
    }
  }

  return result
}
