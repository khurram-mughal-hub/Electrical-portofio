import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { Vector3 } from 'three'
import { useMobile, useTablet } from '../hooks/useMobile'

export default function CameraRig({ progress }: { progress: number }) {
  const { camera, size } = useThree((state) => ({ camera: state.camera, size: state.size }))
  const mobile = useMobile()
  const tablet = useTablet()
  const target = useMemo(() => new Vector3(), [])

  useEffect(() => {
    if ('fov' in camera) {
      camera.fov = mobile ? 65 : tablet ? 55 : 47
      camera.position.z = mobile && size.height > size.width ? 12 : mobile ? 11 : tablet ? 10 : 9
      camera.updateProjectionMatrix()
    }
  }, [camera, mobile, size.height, size.width, tablet])

  useFrame((_, delta) => {
    const speed = Math.min(delta * 1.2, 1)
    if (mobile) {
      camera.position.x += (0 - camera.position.x) * speed
      camera.position.y += (0 - camera.position.y) * speed
      target.set(0, 0, -1.5)
      camera.lookAt(target)
      return
    }
    const y = Math.sin(progress * Math.PI * 1.4) * 0.8
    camera.position.x += (Math.sin(progress * Math.PI * 2) * 0.52 - camera.position.x) * speed
    camera.position.y += (y - camera.position.y) * speed
    target.set(0, y * 0.28, -1.5)
    camera.lookAt(target)
  })

  return null
}
