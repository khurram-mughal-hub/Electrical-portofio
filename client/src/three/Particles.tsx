import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { BufferAttribute, BufferGeometry, Points } from 'three'
import { useMobile } from '../hooks/useMobile'

export default function Particles() {
  const mobile = useMobile()
  const particles = useRef<Points>(null)
  const pointer = useThree((state) => state.pointer)
  const geometry = useMemo(() => {
    const count = mobile ? 640 : 1600
    const values = new Float32Array(count * 3)
    for (let index = 0; index < count; index += 1) {
      values[index * 3] = (Math.random() - 0.5) * 14
      values[index * 3 + 1] = (Math.random() - 0.5) * 8
      values[index * 3 + 2] = -3.4 + (Math.random() - 0.5) * 4
    }
    const result = new BufferGeometry()
    result.setAttribute('position', new BufferAttribute(values, 3))
    return result
  }, [mobile])

  useFrame((_, delta) => {
    if (!particles.current) return
    particles.current.rotation.y += delta * 0.012
    if (mobile) {
      particles.current.position.x = Math.sin(_.clock.elapsedTime * 0.18) * 0.08
      particles.current.position.y = Math.cos(_.clock.elapsedTime * 0.14) * 0.05
    } else {
      particles.current.position.x += (pointer.x * 0.28 - particles.current.position.x) * Math.min(delta, 0.05)
      particles.current.position.y += (pointer.y * 0.18 - particles.current.position.y) * Math.min(delta, 0.05)
    }
  })

  return (
    <points ref={particles} geometry={geometry}>
      <pointsMaterial color="#c0344a" size={0.025} transparent opacity={0.58} sizeAttenuation depthWrite={false} />
    </points>
  )
}
