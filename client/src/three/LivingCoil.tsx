import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { CatmullRomCurve3, Float32BufferAttribute, Group, TubeGeometry, Vector3, ShaderMaterial } from 'three'
import { coilFragmentShader, coilVertexShader } from './coilShader'

const SEGMENTS = 520
const SIDES = 6

function createCoilGeometry() {
  const solenoid = Array.from({ length: 420 }, (_, index) => {
    const t = index / 419
    const angle = t * Math.PI * 2 * 22
    return new Vector3(Math.cos(angle) * 0.62, (t - 0.5) * 2.3, Math.sin(angle) * 0.62)
  })

  const toroid = Array.from({ length: 420 }, (_, index) => {
    const t = index / 419
    const outerAngle = t * Math.PI * 2 * 5
    const innerAngle = t * Math.PI * 2 * 27
    const radius = 0.88 + Math.cos(innerAngle) * 0.36
    return new Vector3(Math.cos(outerAngle) * radius, Math.sin(innerAngle) * 0.36, Math.sin(outerAngle) * radius)
  })

  const sine = Array.from({ length: 420 }, (_, index) => {
    const t = index / 419
    return new Vector3((t - 0.5) * 3.4, Math.sin(t * Math.PI * 2 * 2.5) * 0.65, Math.cos(t * Math.PI * 2 * 2.5) * 0.08)
  })

  const spiralPoints: Vector3[] = []
  const turns = 8
  for (let turn = 0; turn < turns; turn += 1) {
    const radius = 1.35 - turn * 0.12
    for (let corner = 0; corner <= 4; corner += 1) {
      const angle = corner / 4 * Math.PI * 2 + Math.PI / 4
      spiralPoints.push(new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
    }
  }
  const squareCurve = new CatmullRomCurve3(spiralPoints, false, 'centripetal')

  const paths = [
    new CatmullRomCurve3(solenoid, false, 'centripetal'),
    new CatmullRomCurve3(toroid, false, 'centripetal'),
    new CatmullRomCurve3(sine, false, 'centripetal'),
    squareCurve,
  ]
  const geometries = paths.map((path) => new TubeGeometry(path, SEGMENTS, 0.024, SIDES, false))
  const base = geometries[0]
  for (let shape = 1; shape < geometries.length; shape += 1) {
    base.setAttribute(`aShape${shape}`, new Float32BufferAttribute(geometries[shape].attributes.position.array.slice(), 3))
    geometries[shape].dispose()
  }
  return base
}

export default function LivingCoil({ progress }: { progress: number }) {
  const group = useRef<Group>(null)
  const material = useRef<ShaderMaterial>(null)
  const geometry = useMemo(createCoilGeometry, [])
  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uGlow: { value: 0 },
  }), [])
  const previous = useRef(progress)

  useFrame(({ clock }, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.09
      group.current.rotation.x = Math.sin(clock.elapsedTime * 0.12) * 0.08
    }
    if (material.current) {
      material.current.uniforms.uProgress.value += (progress - material.current.uniforms.uProgress.value) * Math.min(delta * 1.8, 1)
      material.current.uniforms.uTime.value = clock.elapsedTime
      const velocity = Math.abs(progress - previous.current) / Math.max(delta, 0.001)
      material.current.uniforms.uGlow.value += (Math.min(velocity, 1.4) - material.current.uniforms.uGlow.value) * Math.min(delta * 3, 1)
      previous.current = progress
    }
  })

  return (
    <group ref={group} position={[2.8, 0.05, -1.6]} scale={0.9}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={material}
          vertexShader={coilVertexShader}
          fragmentShader={coilFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
