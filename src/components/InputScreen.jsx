import { useState } from 'react'
import { useStore } from '../store/useStore'
import { processTexts } from '../utils/embeddings'

export default function InputScreen() {
  const [inputText, setInputText] = useState('')
  const { setStage, setTexts } = useStore()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!inputText.trim()) {
      alert('텍스트를 입력해주세요.')
      return
    }

    // 텍스트를 줄바꿈으로 분리
    const texts = inputText
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    if (texts.length === 0) {
      alert('유효한 텍스트를 입력해주세요.')
      return
    }

    setTexts(texts)
    setStage('loading')

    // 임베딩 처리 시작
    try {
      await processTexts(texts)
      setStage('viewer')
    } catch (error) {
      console.error('처리 중 오류 발생:', error)
      alert('처리 중 오류가 발생했습니다: ' + error.message)
      setStage('input')
    }
  }

  const handleExample = () => {
    const exampleTexts = `React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다.
Vue.js는 프로그레시브 자바스크립트 프레임워크입니다.
Angular는 TypeScript 기반의 웹 애플리케이션 프레임워크입니다.
Python은 다양한 용도로 사용되는 고급 프로그래밍 언어입니다.
Java는 객체지향 프로그래밍 언어로 많은 기업에서 사용됩니다.
JavaScript는 웹 브라우저에서 동작하는 스크립트 언어입니다.
TypeScript는 JavaScript에 타입을 추가한 언어입니다.
머신러닝은 데이터에서 패턴을 학습하는 기술입니다.
딥러닝은 신경망을 기반으로 한 머신러닝의 한 분야입니다.
자연어 처리는 컴퓨터가 인간의 언어를 이해하도록 하는 기술입니다.
컴퓨터 비전은 컴퓨터가 이미지를 이해하도록 하는 기술입니다.
데이터베이스는 구조화된 데이터를 저장하고 관리하는 시스템입니다.
SQL은 데이터베이스를 조작하기 위한 언어입니다.
NoSQL은 비관계형 데이터베이스를 의미합니다.
클라우드 컴퓨팅은 인터넷을 통해 컴퓨팅 리소스를 제공하는 서비스입니다.
도커는 컨테이너 기반의 가상화 플랫폼입니다.
쿠버네티스는 컨테이너 오케스트레이션 플랫폼입니다.
Git은 분산 버전 관리 시스템입니다.
GitHub는 Git 저장소 호스팅 서비스입니다.
REST API는 HTTP를 기반으로 한 웹 서비스 아키텍처입니다.`
    setInputText(exampleTexts)
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Blog<span className="text-purple-400">2</span>Space
          </h1>
          <p className="text-gray-300 text-lg">텍스트를 3D 임베딩 공간으로 시각화하세요</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl"
        >
          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-3">
              텍스트 입력 (한 줄에 하나씩)
            </label>
            <textarea
              className="w-full h-64 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="예시:&#10;React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다.&#10;Vue.js는 프로그레시브 자바스크립트 프레임워크입니다.&#10;Python은 다양한 용도로 사용되는 고급 프로그래밍 언어입니다.&#10;..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <p className="text-gray-400 text-sm mt-2">
              {inputText.split('\n').filter((t) => t.trim()).length}개의 텍스트
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              3D 공간 생성
            </button>
            <button
              type="button"
              onClick={handleExample}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              예시 불러오기
            </button>
          </div>

          <div className="mt-6 text-gray-400 text-sm">
            <p className="mb-2">💡 사용 팁:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>최소 3개 이상의 텍스트를 입력하세요</li>
              <li>유사한 주제의 텍스트는 3D 공간에서 가까이 배치됩니다</li>
              <li>각 텍스트는 한 줄에 하나씩 입력하세요</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  )
}
