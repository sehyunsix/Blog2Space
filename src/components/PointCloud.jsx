import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useStore } from '../store/useStore'

export default function PointCloud() {
  const {
    texts,
    positions3D,
    selectedIndex,
    setSelectedIndex,
    searchResults,
    searchQueryText,
    searchQueryPosition,
  } = useStore()
  const [hoveredIndex, setHoveredIndex] = useState(null)

  if (!positions3D || positions3D.length === 0) {
    return null
  }

  return (
    <group>
      {/* 기존 텍스트 포인트들 */}
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
          isSearchQuery={false}
        />
      ))}

      {/* 검색 쿼리 포인트 */}
      {searchQueryText && searchQueryPosition && (
        <Sphere
          key="search-query"
          position={searchQueryPosition}
          index={-1}
          text={searchQueryText}
          isSelected={false}
          isHovered={hoveredIndex === -1}
          onHover={() => setHoveredIndex(-1)}
          onUnhover={() => setHoveredIndex(null)}
          onClick={() => {}}
          searchResults={[]}
          isSearchQuery={true}
        />
      )}
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
  isSearchQuery,
}) {
  const meshRef = useRef()

  // 유사도 가져오기
  const searchResult = searchResults.find((r) => r.index === index)
  const similarity = searchResult ? searchResult.similarity : null

  // 색상 결정
  let color
  if (isSearchQuery) {
    // 검색 쿼리는 특별한 색상 (빨간색/주황색)
    color = '#ef4444' // 밝은 빨간색
  } else if (isSelected) {
    color = '#fbbf24' // 노란색
  } else if (searchResults.length > 0) {
    if (searchResult) {
      const sim = searchResult.similarity
      color = `hsl(${(0.15 - sim * 0.15) * 360}, 100%, 50%)`
    } else {
      color = '#444444'
    }
  } else if (isHovered) {
    color = '#34d399' // 초록색
  } else {
    color = `hsl(${(200 + index * 3.6) % 360}, 70%, 60%)`
  }

  // 크기 결정
  let size = 0.75 // 기본 크기
  if (isSearchQuery) {
    size = 1.5 // 검색 쿼리는 더 크게
  } else if (isSelected) {
    size = 1.25 // 선택 시 크기
  } else if (isHovered) {
    size = 1.0 // 호버 시 크기
  } else if (searchResults.length > 0) {
    const result = searchResults.find((r) => r.index === index)
    size = result ? 1.0 : 0.4
  }

  // 애니메이션 - 별처럼 반짝이기
  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected || isHovered) {
        // 선택/호버: 맥동 효과
        meshRef.current.scale.setScalar(size + Math.sin(state.clock.elapsedTime * 3) * 0.1)
      } else {
        // 모든 포인트: 은은하게 반짝이기
        const twinkle = Math.sin(state.clock.elapsedTime * 2 + index * 0.5) * 0.05 + 0.95
        meshRef.current.scale.setScalar(size * twinkle)
      }
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
          emissiveIntensity={isSelected || isHovered ? 1.5 : 1.0} // 매우 밝게!
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={
            searchResults.length > 0 && !searchResults.find((r) => r.index === index) ? 0.3 : 1
          }
        />
      </mesh>

      {/* 텍스트 라벨 - 항상 표시 */}
      <Html
        position={[0, size + 2.5, 0]}
        center
        distanceFactor={18}
        style={{
          transition: 'all 0.2s',
          pointerEvents: 'none',
        }}
      >
        <div className="flex flex-col items-center gap-2">
          {/* 텍스트 */}
          <div
            className="text-center px-5 py-4 rounded-lg shadow-2xl whitespace-nowrap"
            style={{
              background: 'rgba(0, 0, 0, 0.9)', // 모두 검은 배경
              color: isSearchQuery ? '#ef4444' : '#ffffff', // 검색 쿼리는 빨간 글자
              fontSize: isSearchQuery ? '216px' : isSelected ? '192px' : '144px',
              fontWeight: isSearchQuery
                ? '900'
                : similarity > 0.7
                  ? '900'
                  : isSelected
                    ? '700'
                    : '600',
              maxWidth: '2000px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              opacity: isSelected || isHovered || isSearchQuery ? 1 : 0.85,
              border: isSearchQuery
                ? '6px solid rgba(239, 68, 68, 1)' // 검색 쿼리는 빨간 테두리
                : isSelected
                  ? '5px solid rgba(251, 191, 36, 1)'
                  : similarity > 0.7
                    ? '4px solid rgba(251, 191, 36, 0.8)'
                    : 'none',
              textShadow: '0 0 30px rgba(255, 255, 255, 0.9), 0 0 50px rgba(100, 200, 255, 0.6)',
              textDecoration: 'none', // 취소선 제거
            }}
          >
            {text.length > 30 ? text.substring(0, 30) + '...' : text}
          </div>

          {/* 유사도 표시 - 검색 결과가 있을 때만 */}
          {similarity !== null && (
            <div
              className="px-4 py-2 rounded-full shadow-xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(147, 51, 234, 0.9))',
                fontSize: '96px',
                fontWeight: '700',
                color: '#ffffff',
                textShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
                border: '3px solid rgba(255, 255, 255, 0.5)',
              }}
            >
              {(similarity * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </Html>

      {/* 호버 시 전체 텍스트 툴팁 */}
      {isHovered && text.length > 30 && (
        <Html position={[0, size + 5, 0]} center distanceFactor={22}>
          <div
            className="bg-black/95 text-white px-10 py-8 rounded-2xl shadow-2xl backdrop-blur-sm"
            style={{
              fontSize: '108px',
              maxWidth: '2000px',
              textShadow: '0 0 30px rgba(255, 255, 255, 0.9), 0 0 50px rgba(100, 200, 255, 0.6)',
              fontWeight: '500',
            }}
          >
            {text}
          </div>
        </Html>
      )}
    </group>
  )
}
