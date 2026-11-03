import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'
import { useMobile } from '../hooks/useMobile'

const traces: [number, number, number][][] = [
  [[-7, -2.2, -5], [-4, -2.2, -5], [-4, -1.3, -5], [-2.4, -1.3, -5], [-2.4, 0.2, -5]],
  [[-6.2, 1.8, -5], [-4.7, 1.8, -5], [-4.7, 0.9, -5], [-3.1, 0.9, -5], [-3.1, 0.2, -5]],
  [[-2.4, 0.2, -5], [-1.4, 0.2, -5], [-1.4, 1.8, -5], [0.2, 1.8, -5], [0.2, 2.5, -5]],
  [[-7, -0.4, -5], [-5.2, -0.4, -5], [-5.2, -1.1, -5], [-3.4, -1.1, -5]],
  [[1.1, -2.1, -5], [2.4, -2.1, -5], [2.4, -1.1, -5], [4.3, -1.1, -5], [4.3, 0.3, -5]],
  [[0.4, 1.6, -5], [1.7, 1.6, -5], [1.7, 0.7, -5], [3.4, 0.7, -5], [3.4, -0.2, -5]],
  [[4.3, 0.3, -5], [5.4, 0.3, -5], [5.4, 1.7, -5], [7, 1.7, -5]],
  [[-0.8, -2.4, -5], [-0.8, -1.2, -5], [0.4, -1.2, -5], [0.4, -0.1, -5], [1.5, -0.1, -5]],
  [[-6.4, 2.5, -5], [-5.3, 2.5, -5], [-5.3, 2.1, -5]],
  [[5.2, -2.2, -5], [5.2, -1.5, -5], [6.8, -1.5, -5]],
]

const pads = [
  [-7, -2.2, -5], [-2.4, 0.2, -5], [0.2, 2.5, -5], [4.3, 0.3, -5],
  [7, 1.7, -5], [-6.4, 2.5, -5], [-0.8, -2.4, -5], [6.8, -1.5, -5],
]

function CurrentPulse({ path, index }: { path: [number, number, number][]; index: number }) {
  const pulse = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!pulse.current) return
    const totalLength = path.slice(1).reduce((sum, point, segment) => {
      const previous = path[segment]
      return sum + Math.hypot(point[0] - previous[0], point[1] - previous[1], point[2] - previous[2])
    }, 0)
    let distance = ((clock.elapsedTime * 0.6 + index * 0.19) % 1) * totalLength
    for (let segment = 0; segment < path.length - 1; segment += 1) {
      const from = path[segment]
      const to = path[segment + 1]
      const length = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2])
      if (distance <= length) {
        const amount = length === 0 ? 0 : distance / length
        pulse.current.position.set(
          from[0] + (to[0] - from[0]) * amount,
          from[1] + (to[1] - from[1]) * amount,
          from[2] + (to[2] - from[2]) * amount + 0.015,
        )
        return
      }
      distance -= length
    }
  })

  return (
    <mesh ref={pulse} position={[path[0][0], path[0][1], path[0][2] + 0.015]} scale={0.04}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={index % 2 ? '#c0344a' : '#f3ebe8'} toneMapped={false} />
    </mesh>
  )
}

export default function CircuitFloor() {
  const mobile = useMobile()
  const visibleTraces = mobile ? traces.slice(0, 6) : traces
  const visiblePads = mobile ? pads.slice(0, 5) : pads

  return (
    <group>
      {visibleTraces.map((trace, index) => (
        <group key={index}>
          <Line points={trace} color={index % 3 === 0 ? '#c0344a' : '#8c1c2e'} lineWidth={1} transparent opacity={0.58} />
          <CurrentPulse path={trace} index={index} />
        </group>
      ))}
      {visiblePads.map((position, index) => (
        <mesh key={index} position={[position[0], position[1], position[2] + 0.01]}>
          <cylinderGeometry args={[0.07, 0.07, 0.025, 8]} />
          <meshBasicMaterial color={index % 2 ? '#8c1c2e' : '#c0344a'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
