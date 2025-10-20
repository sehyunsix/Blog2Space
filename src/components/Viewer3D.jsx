import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useStore } from '../store/useStore'
import PointCloud from './PointCloud'
import SearchPanel from './SearchPanel'
import InfoPanel from './InfoPanel'

export default function Viewer3D() {
  const { texts, setStage } = useStore()

  const handleBack = () => {
    setStage('input')
  }

  return (
    <div className="w-full h-full bg-gray-900 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-gray-900/90 to-transparent p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-white hover:text-purple-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">
              Blog<span className="text-purple-400">2</span>Space
            </h1>
          </div>

          <div className="text-white/70 text-sm">{texts.length}개 텍스트</div>
        </div>
      </div>

      {/* Search Panel */}
      <SearchPanel />

      {/* Info Panel */}
      <InfoPanel />

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 50], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #0f172a, #1e1b4b)' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <PointCloud />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          minDistance={10}
          maxDistance={150}
        />

        {/* Grid Helper */}
        <gridHelper args={[100, 20, '#666666', '#333333']} rotation={[0, 0, 0]} />
      </Canvas>

      {/* Controls Help */}
      <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm text-white text-xs p-3 rounded-lg">
        <div className="font-semibold mb-2">조작법</div>
        <div className="space-y-1 text-white/70">
          <div>🖱️ 드래그: 회전</div>
          <div>🔍 휠: 확대/축소</div>
          <div>👆 클릭: 텍스트 선택</div>
        </div>
      </div>
    </div>
  )
}
