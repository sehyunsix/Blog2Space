import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useStore } from '../store/useStore'

export default function PointCloud() {
  const { texts, positions3D, selectedIndex, setSelectedIndex, searchResults } = useStore()
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // 개별 구체 렌더링 (클릭 가능하도록)
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
    color = '#ffff00'
  } else if (searchResults.length > 0) {
    const result = searchResults.find((r) => r.index === index)
    if (result) {
      const similarity = result.similarity
      color = `hsl(${(0.15 - similarity * 0.15) * 360}, 100%, 50%)`
    } else {
      color = '#444444'
    }
  } else {
    color = `hsl(${270 + index * 3.6}, 70%, 60%)`
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
    <mesh
      ref={meshRef}
      position={position}
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

      {/* 호버 시 툴팁 */}
      {isHovered && (
        <Html distanceFactor={10}>
          <div className="bg-gray-900/95 text-white px-3 py-2 rounded-lg shadow-lg max-w-xs backdrop-blur-sm">
            <div className="text-sm font-medium line-clamp-2">{text}</div>
          </div>
        </Html>
      )}
    </mesh>
  )
}
