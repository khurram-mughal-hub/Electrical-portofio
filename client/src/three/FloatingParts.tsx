import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

const parts = [
  { position: [-4.1, 1.3, -1.8] as [number, number, number], kind: 'resistor' },
  { position: [4.6, 2.1, -2.2] as [number, number, number], kind: 'capacitor' },
  { position: [-5.1, -1.4, -2.6] as [number, number, number], kind: 'chip' },
  { position: [5.1, -1.5, -1.8] as [number, number, number], kind: 'diode' },
  { position: [0.1, 2.9, -2.7] as [number, number, number], kind: 'transformer' },
]

function FloatingPart({ position, kind, index }: { position: [number, number, number]; kind: string; index: number }) {
  const group = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!group.current) return
    const time = clock.elapsedTime + index * 1.7
    group.current.position.y = position[1] + Math.sin(time * 0.3) * 0.16
    group.current.rotation.y = Math.sin(time * 0.22) * 0.25
    group.current.rotation.z = Math.cos(time * 0.18) * 0.14
  })

  return (
    <group ref={group} position={position} rotation={[0.2, index * 0.6, 0]}>
      {kind === 'resistor' && (
        <>
          <mesh><cylinderGeometry args={[0.11, 0.11, 0.58, 6]} /><meshStandardMaterial color="#3a1a21" roughness={0.45} metalness={0.4} /></mesh>
          <mesh position={[0, 0, 0.3]}><cylinderGeometry args={[0.018, 0.018, 0.35, 5]} /><meshBasicMaterial color="#c0344a" /></mesh>
          <mesh position={[0, 0, -0.3]}><cylinderGeometry args={[0.018, 0.018, 0.35, 5]} /><meshBasicMaterial color="#c0344a" /></mesh>
        </>
      )}
      {kind === 'capacitor' && <mesh><cylinderGeometry args={[0.18, 0.18, 0.35, 8]} /><meshStandardMaterial color="#8c1c2e" roughness={0.35} metalness={0.45} /></mesh>}
      {kind === 'chip' && <mesh><boxGeometry args={[0.42, 0.35, 0.12]} /><meshStandardMaterial color="#050304" roughness={0.35} metalness={0.6} /></mesh>}
      {kind === 'diode' && <mesh><octahedronGeometry args={[0.2, 0]} /><meshStandardMaterial color="#c0344a" roughness={0.3} metalness={0.3} /></mesh>}
      {kind === 'transformer' && <mesh><torusGeometry args={[0.2, 0.07, 5, 10]} /><meshStandardMaterial color="#8c1c2e" roughness={0.4} metalness={0.5} /></mesh>}
    </group>
  )
}

export default function FloatingParts() {
  return (
    <group>
      {parts.map((part, index) => <FloatingPart {...part} key={part.kind} index={index} />)}
    </group>
  )
}
