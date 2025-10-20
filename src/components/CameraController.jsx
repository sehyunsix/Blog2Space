import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useStore } from '../store/useStore'
import * as THREE from 'three'

/**
 * 카메라 자동 이동 컨트롤러
 * 검색 시 가장 유사한 포인트로 카메라를 부드럽게 이동
 */
export default function CameraController() {
  const { camera, controls } = useThree()
  const { cameraTarget, setCameraTarget } = useStore()
  const targetRef = useRef(null)
  const isAnimating = useRef(false)
  const startPosition = useRef(new THREE.Vector3())
  const startTarget = useRef(new THREE.Vector3())
  const progress = useRef(0)

  useEffect(() => {
    console.log('🔍 CameraController useEffect 실행:', {
      hasCameraTarget: !!cameraTarget,
      cameraTarget,
      hasControls: !!controls,
      controlsType: controls?.constructor?.name,
    })

    if (cameraTarget && controls && Array.isArray(cameraTarget) && cameraTarget.length === 3) {
      // 애니메이션 시작
      isAnimating.current = true
      progress.current = 0

      // 현재 위치 저장
      startPosition.current.copy(camera.position)
      startTarget.current.copy(controls.target)

      // 목표 위치 설정 (포인트에서 약간 떨어진 곳)
      targetRef.current = {
        position: new THREE.Vector3(
          cameraTarget[0] + 30, // 옆에서
          cameraTarget[1] + 20, // 위에서
          cameraTarget[2] + 30 // 앞에서 보기
        ),
        target: new THREE.Vector3(cameraTarget[0], cameraTarget[1], cameraTarget[2]),
      }

      console.log('🎬 카메라 애니메이션 시작:', {
        from: startPosition.current.toArray(),
        to: targetRef.current.position.toArray(),
        targetPoint: targetRef.current.target.toArray(),
      })
    }
  }, [cameraTarget, camera, controls])

  useFrame((state, delta) => {
    if (!isAnimating.current || !targetRef.current || !controls) {
      return
    }

    if (isAnimating.current && targetRef.current && controls) {
      // 진행도 증가 (2초 동안 애니메이션)
      progress.current += delta / 2
      progress.current = Math.min(progress.current, 1)

      // Ease-in-out 함수
      const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      }

      const easedProgress = easeInOutCubic(progress.current)

      // 카메라 위치 보간
      camera.position.lerpVectors(startPosition.current, targetRef.current.position, easedProgress)

      // 컨트롤 타겟 보간
      controls.target.lerpVectors(startTarget.current, targetRef.current.target, easedProgress)

      controls.update()

      // 진행 상황 로깅 (10% 단위로)
      const currentPercent = Math.floor(progress.current * 10) * 10
      const prevPercent = Math.floor((progress.current - delta / 2) * 10) * 10
      if (currentPercent > prevPercent && currentPercent <= 100) {
        console.log(`📹 카메라 이동 중: ${currentPercent}%`, {
          currentPos: camera.position.toArray(),
          targetPos: targetRef.current.position.toArray(),
        })
      }

      // 애니메이션 완료
      if (progress.current >= 1) {
        isAnimating.current = false
        setCameraTarget(null) // 타겟 초기화
        console.log('✅ 카메라 애니메이션 완료', {
          finalPos: camera.position.toArray(),
          finalTarget: controls.target.toArray(),
        })
      }
    }
  })

  return null
}
