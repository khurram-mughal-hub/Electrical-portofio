import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import CameraRig from './CameraRig'
import CircuitFloor from './CircuitFloor'
import FloatingParts from './FloatingParts'
import LivingCoil from './LivingCoil'
import Particles from './Particles'

export default function Scene({ progress }: { progress: number }) {
  return (
    <Canvas
      className="electrical-canvas"
      aria-hidden="true"
      camera={{ position: [0, 0, 9], fov: 47, near: 0.1, far: 40 }}
      dpr={[1, 1.35]}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      performance={{ min: 0.55 }}
      fallback={null}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.55} color="#f3ebe8" />
        <pointLight position={[1, 3, 2]} intensity={3} color="#8c1c2e" distance={12} />
        <CameraRig progress={progress} />
        <CircuitFloor />
        <FloatingParts />
        <Particles />
        <LivingCoil progress={progress} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.48} luminanceThreshold={0.35} luminanceSmoothing={0.7} mipmapBlur />
          <Vignette offset={0.35} darkness={0.72} />
          <Noise opacity={0.025} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
