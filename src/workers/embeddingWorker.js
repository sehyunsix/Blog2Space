import { AutoModel, AutoTokenizer } from '@huggingface/transformers'

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2'
let model = null
let tokenizer = null
let device = null

self.onmessage = async (event) => {
  const { type, payload } = event.data

  if (type === 'load-model') {
    try {
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
          percentage: 10,
          status: 'Loading tokenizer...',
        },
      })

      tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID)

      self.postMessage({
        type: 'progress',
        payload: {
          percentage: 30,
          status: 'Loading model...',
        },
      })

      model = await AutoModel.from_pretrained(MODEL_ID, {
        device,
        dtype: device === 'webgpu' ? 'fp32' : 'q8',
        progress_callback: (progress) => {
          if (progress.status === 'progress') {
            const percentage = 30 + Math.round((progress.loaded / progress.total) * 60)
            self.postMessage({
              type: 'progress',
              payload: {
                percentage,
                status: `Loading model... ${percentage}%`,
              },
            })
          }
        },
      })

      self.postMessage({
        type: 'ready',
        payload: { device },
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

      // 배치로 임베딩 생성 (Semantic Galaxy 방식)
      const inputs = tokenizer(texts, {
        padding: true,
        truncation: true,
      })

      self.postMessage({
        type: 'progress',
        payload: {
          percentage: 50,
          status: `Processing ${texts.length} texts...`,
        },
      })

      const outputs = await model(inputs)

      self.postMessage({
        type: 'progress',
        payload: {
          percentage: 80,
          status: 'Converting embeddings...',
        },
      })

      // Mean pooling
      const embeddings = []
      const hiddenStates = outputs.last_hidden_state
      const attentionMask = inputs.attention_mask

      for (let i = 0; i < texts.length; i++) {
        const embedding = meanPooling(hiddenStates, attentionMask, i)
        embeddings.push(Array.from(embedding))

        // 진행 상황 업데이트
        if (i % 5 === 0 || i === texts.length - 1) {
          const progress = 80 + Math.round(((i + 1) / texts.length) * 20)
          self.postMessage({
            type: 'progress',
            payload: {
              percentage: progress,
              status: `Converting ${i + 1}/${texts.length}...`,
            },
          })
        }
      }

      console.log(`Embeddings generated: ${embeddings.length}`)

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
        result[j] += data[batchOffset + i * hiddenSize + j]
      }
      tokenCount++
    }
  }

  // 평균 계산
  if (tokenCount > 0) {
    for (let j = 0; j < hiddenSize; j++) {
      result[j] /= tokenCount
    }
  }

  return result
}
