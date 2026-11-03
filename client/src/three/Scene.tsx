import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import { useMobile, useTablet } from '../hooks/useMobile'
import CameraRig from './CameraRig'
import CircuitFloor from './CircuitFloor'
import FloatingParts from './FloatingParts'
import LivingCoil from './LivingCoil'
import Particles from './Particles'

function SceneRuntime({ mobile, lowEnd }: { mobile: boolean; lowEnd: boolean }) {
  const { setDpr, setFrameloop } = useThree()
  const elapsed = useRef(0)
  const slowFrames = useRef(0)
  const fastFrames = useRef(0)
  const reducedQuality = useRef(false)

  useEffect(() => {
    const updateVisibility = () => setFrameloop(document.hidden ? 'never' : 'always')
    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)
    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [setFrameloop])

  useFrame((_, delta) => {
    elapsed.current += delta
    if (delta > 1 / 40) slowFrames.current += 1
    else fastFrames.current += 1
    if (elapsed.current < 2) return

    if (!reducedQuality.current && slowFrames.current > fastFrames.current) {
      reducedQuality.current = true
      setDpr(1)
    } else if (reducedQuality.current && fastFrames.current > slowFrames.current * 2 && !lowEnd) {
      reducedQuality.current = false
      setDpr(mobile ? 1.5 : 1.35)
    }
    elapsed.current = 0
    slowFrames.current = 0
    fastFrames.current = 0
  })

  return null
}

export default function Scene({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
  const mobile = useMobile()
  const tablet = useTablet()
  const coarseTablet = tablet && window.matchMedia('(pointer: coarse)').matches
  const lowEnd = mobile || coarseTablet || (typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4)

  return (
    <Canvas
      className="electrical-canvas"
      aria-hidden="true"
      camera={{
        position: [0, 0, mobile ? 12 : tablet ? 10 : 9],
        fov: mobile ? 65 : tablet ? 55 : 47,
        near: 0.1,
        far: 40,
      }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      performance={{ min: 0.55 }}
      fallback={null}
    >
      <Suspense fallback={null}>
        <SceneRuntime mobile={mobile} lowEnd={lowEnd} />
        <ambientLight intensity={0.55} color="#f3ebe8" />
        <pointLight position={[1, 3, 2]} intensity={3} color="#8c1c2e" distance={12} />
        <CameraRig progress={progress} />
        <CircuitFloor />
        <FloatingParts />
        <Particles />
        <LivingCoil progress={progress} reducedMotion={reducedMotion} />
        {lowEnd ? (
          <EffectComposer multisampling={0}>
            <Vignette offset={0.35} darkness={0.72} />
          </EffectComposer>
        ) : (
          <EffectComposer multisampling={0}>
            <Bloom intensity={0.48} luminanceThreshold={0.35} luminanceSmoothing={0.7} mipmapBlur />
            <Vignette offset={0.35} darkness={0.72} />
            <Noise opacity={0.025} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  )
}
