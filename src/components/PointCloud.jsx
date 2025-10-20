import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useStore } from '../store/useStore'

export default function PointCloud() {
  const { texts, positions3D, selectedIndex, setSelectedIndex, searchResults } = useStore()
  const [hoveredIndex, setHoveredIndex] = useState(null)

  if (!positions3D || positions3D.length === 0) {
    return null
  }

  return (
    <group>
      {positions3D.map((pos, i) => (
        <Sphere
          key={i}
          position={pos}
          index={i}
          text={texts[i]}
          isSelected={selectedIndex === i}
          isHovered={hoveredIndex === i}
          onHover={() => setHoveredIndex(i)}
          onUnhover={() => setHoveredIndex(null)}
          onClick={() => setSelectedIndex(i === selectedIndex ? null : i)}
          searchResults={searchResults}
        />
      ))}
    </group>
  )
}

function Sphere({
  position,
  index,
  text,
  isSelected,
  isHovered,
  onHover,
  onUnhover,
  onClick,
  searchResults,
}) {
  const meshRef = useRef()

  // 색상 결정
  let color
  if (isSelected) {
    color = '#fbbf24' // 노란색
  } else if (searchResults.length > 0) {
    const result = searchResults.find((r) => r.index === index)
    if (result) {
      const similarity = result.similarity
      color = `hsl(${(0.15 - similarity * 0.15) * 360}, 100%, 50%)`
    } else {
      color = '#444444'
    }
  } else if (isHovered) {
    color = '#34d399' // 초록색
  } else {
    color = `hsl(${(200 + index * 3.6) % 360}, 70%, 60%)`
  }

  // 크기 결정
  let size = 0.5
  if (isSelected) {
    size = 1.0
  } else if (isHovered) {
    size = 0.8
  } else if (searchResults.length > 0) {
    const result = searchResults.find((r) => r.index === index)
    size = result ? 0.7 : 0.3
  }

  // 애니메이션
  useFrame((state) => {
    if (meshRef.current && (isSelected || isHovered)) {
      meshRef.current.scale.setScalar(size + Math.sin(state.clock.elapsedTime * 3) * 0.1)
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={onHover}
        onPointerOut={onUnhover}
        scale={size}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected || isHovered ? 0.5 : 0.2}
          transparent
          opacity={
            searchResults.length > 0 && !searchResults.find((r) => r.index === index) ? 0.3 : 1
          }
        />
      </mesh>

      {/* 텍스트 라벨 - 항상 표시 */}
      <Html
        position={[0, size + 0.8, 0]}
        center
        distanceFactor={8}
        style={{
          transition: 'all 0.2s',
          pointerEvents: 'none',
        }}
      >
        <div
          className="text-white text-center px-2 py-1 rounded shadow-lg whitespace-nowrap"
          style={{
            background: isSelected
              ? 'rgba(251, 191, 36, 0.95)'
              : isHovered
                ? 'rgba(52, 211, 153, 0.9)'
                : 'rgba(17, 24, 39, 0.75)',
            fontSize: isSelected ? '13px' : '10px',
            fontWeight: isSelected ? '600' : '400',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            opacity: isSelected || isHovered ? 1 : 0.8,
          }}
        >
          {text.length > 30 ? text.substring(0, 30) + '...' : text}
        </div>
      </Html>

      {/* 호버 시 전체 텍스트 툴팁 */}
      {isHovered && text.length > 30 && (
        <Html position={[0, size + 2, 0]} center distanceFactor={10}>
          <div className="bg-gray-900/95 text-white px-4 py-3 rounded-lg text-sm max-w-md shadow-xl border border-emerald-500/50 backdrop-blur-sm">
            {text}
          </div>
        </Html>
      )}
    </group>
  )
}
