import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { Vector3 } from 'three'

export default function CameraRig({ progress }: { progress: number }) {
  const camera = useThree((state) => state.camera)
  const target = useMemo(() => new Vector3(), [])

  useFrame((_, delta) => {
    const speed = Math.min(delta * 1.2, 1)
    const y = Math.sin(progress * Math.PI * 1.4) * 0.8
    camera.position.x += (Math.sin(progress * Math.PI * 2) * 0.52 - camera.position.x) * speed
    camera.position.y += (y - camera.position.y) * speed
    target.set(0, y * 0.28, -1.5)
    camera.lookAt(target)
  })

  return null
}
