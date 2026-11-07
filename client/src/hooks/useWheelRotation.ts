import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { gsap } from 'gsap'

interface DragState {
  pointerId: number
  startX: number
  lastX: number
  lastTime: number
  velocity: number
  moved: boolean
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const wrapIndex = (index: number, count: number) => (index % count + count) % count

export function useWheelRotation(count: number) {
  const stageRef = useRef<HTMLDivElement>(null)
  const angleRef = useRef(90)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const frameRef = useRef<number | null>(null)
  const wheelTimeoutRef = useRef<number | null>(null)
  const activeIndexRef = useRef(0)
  const resumeAtRef = useRef(0)
  const visibleRef = useRef(false)
  const hoveredRef = useRef(false)
  const focusedRef = useRef(false)
  const reducedMotionRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const step = 360 / count

  const renderAngle = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    if (Math.abs(angleRef.current) > 3600) angleRef.current %= 360
    stage.classList.add('is-animating')
    stage.style.setProperty('--wheel-angle', `${angleRef.current}deg`)
    const nextIndex = wrapIndex(Math.round(-angleRef.current / step), count)
    if (activeIndexRef.current !== nextIndex) {
      activeIndexRef.current = nextIndex
      setActiveIndex(nextIndex)
      window.dispatchEvent(new CustomEvent('portfolio:coil-pulse'))
    }
  }, [count, step])

  const cancelTween = useCallback(() => {
    tweenRef.current?.kill()
    tweenRef.current = null
  }, [])

  const snapTo = useCallback((index: number, duration?: number) => {
    cancelTween()
    const normalized = wrapIndex(index, count)
    const baseTarget = -normalized * step
    const target = baseTarget + Math.round((angleRef.current - baseTarget) / 360) * 360
    tweenRef.current = gsap.to(angleRef, {
      current: target,
      duration: duration ?? (reducedMotionRef.current ? 0.14 : 0.78),
      ease: reducedMotionRef.current ? 'power1.out' : 'expo.out',
      onUpdate: renderAngle,
      onComplete: () => {
        angleRef.current = target
        renderAngle()
        stageRef.current?.classList.remove('is-animating')
        tweenRef.current = null
      },
    })
  }, [cancelTween, count, renderAngle, step])

  const interact = useCallback(() => {
    resumeAtRef.current = performance.now() + 2000
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => {
      reducedMotionRef.current = motionPreference.matches
    }
    updateMotionPreference()
    motionPreference.addEventListener('change', updateMotionPreference)

    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
      if (!entry.isIntersecting) tweenRef.current?.pause()
      else if (tweenRef.current?.paused()) tweenRef.current.play()
      if (entry.isIntersecting && angleRef.current === 90) {
        snapTo(0, reducedMotionRef.current ? 0.14 : 0.9)
      }
    }, { threshold: 0.2 })
    observer.observe(stage)

    const updateDocumentVisibility = () => {
      if (document.visibilityState === 'visible' && visibleRef.current) {
        tweenRef.current?.play()
        scheduleFrame()
      } else {
        tweenRef.current?.pause()
      }
    }
    document.addEventListener('visibilitychange', updateDocumentVisibility)

    let previousFrame = 0
    let velocity = 0
    const frame = (time: number) => {
      frameRef.current = null
      const delta = previousFrame ? Math.min((time - previousFrame) / 1000, 0.05) : 0
      previousFrame = time
      const active = visibleRef.current && document.visibilityState === 'visible'
      let angleMoved = false

      if (active && !dragRef.current && !tweenRef.current) {
        if (!reducedMotionRef.current && Math.abs(velocity) > 0.04) {
          angleRef.current += velocity * delta
          velocity *= Math.exp(-3.2 * delta)
          renderAngle()
          angleMoved = true
          if (Math.abs(velocity) <= 0.04) snapTo(wrapIndex(Math.round(-angleRef.current / step), count))
        } else if (!hoveredRef.current && !focusedRef.current && performance.now() >= resumeAtRef.current && !reducedMotionRef.current) {
          angleRef.current -= step * delta / 4
          renderAngle()
          angleMoved = true
        }
      }
      if (!angleMoved && !dragRef.current && !tweenRef.current) {
        stageRef.current?.classList.remove('is-animating')
      }

      if (active) frameRef.current = requestAnimationFrame(frame)
    }
    const scheduleFrame = () => {
      if (frameRef.current === null) frameRef.current = requestAnimationFrame(frame)
    }

    const startInertia = (nextVelocity: number) => {
      velocity = reducedMotionRef.current ? 0 : clamp(nextVelocity, -900, 900)
      scheduleFrame()
    }

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) < 1) return
      event.preventDefault()
      cancelTween()
      interact()
      if (reducedMotionRef.current) {
        const index = wrapIndex(Math.round(-(angleRef.current + event.deltaX * 0.16) / step), count)
        snapTo(index)
        return
      }
      angleRef.current += event.deltaX * 0.16
      renderAngle()
      if (wheelTimeoutRef.current !== null) window.clearTimeout(wheelTimeoutRef.current)
      wheelTimeoutRef.current = window.setTimeout(() => {
        snapTo(wrapIndex(Math.round(-angleRef.current / step), count))
      }, 150)
    }
    stage.addEventListener('wheel', onWheel, { passive: false })

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !event.isPrimary) return
      cancelTween()
      interact()
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        lastX: event.clientX,
        lastTime: performance.now(),
        velocity: 0,
        moved: false,
      }
      stage.setPointerCapture(event.pointerId)
      stage.classList.add('is-dragging')
      stage.classList.add('is-animating')
    }
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      const now = performance.now()
      const deltaX = event.clientX - drag.lastX
      if (Math.abs(event.clientX - drag.startX) > 4) drag.moved = true
      if (deltaX !== 0) {
        const deltaAngle = deltaX * 0.32
        angleRef.current += deltaAngle
        drag.velocity = deltaAngle / Math.max((now - drag.lastTime) / 1000, 0.001)
        drag.lastX = event.clientX
        drag.lastTime = now
        renderAngle()
      }
    }
    const onPointerUp = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      dragRef.current = null
      stage.classList.remove('is-dragging')
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId)
      if (drag.moved) stage.dataset.dragged = 'true'
      window.setTimeout(() => delete stage.dataset.dragged, 80)
      if (drag.moved && !reducedMotionRef.current) startInertia(drag.velocity)
      else snapTo(wrapIndex(Math.round(-angleRef.current / step), count), reducedMotionRef.current ? 0.14 : undefined)
    }
    const onPointerCancel = (event: PointerEvent) => {
      if (dragRef.current?.pointerId !== event.pointerId) return
      dragRef.current = null
      stage.classList.remove('is-dragging')
      snapTo(wrapIndex(Math.round(-angleRef.current / step), count))
    }
    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove)
    stage.addEventListener('pointerup', onPointerUp)
    stage.addEventListener('pointercancel', onPointerCancel)

    scheduleFrame()
    return () => {
      observer.disconnect()
      motionPreference.removeEventListener('change', updateMotionPreference)
      document.removeEventListener('visibilitychange', updateDocumentVisibility)
      stage.removeEventListener('wheel', onWheel)
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerup', onPointerUp)
      stage.removeEventListener('pointercancel', onPointerCancel)
      if (wheelTimeoutRef.current !== null) window.clearTimeout(wheelTimeoutRef.current)
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      cancelTween()
    }
  }, [cancelTween, count, interact, renderAngle, snapTo, step])

  const rotateTo = useCallback((index: number) => {
    interact()
    snapTo(index)
  }, [interact, snapTo])

  const setHovered = useCallback((hovered: boolean) => {
    hoveredRef.current = hovered
    if (!hovered) interact()
  }, [interact])

  const setFocused = useCallback((focused: boolean) => {
    focusedRef.current = focused
    if (!focused) interact()
  }, [interact])

  const previous = useCallback(() => rotateTo(activeIndex - 1), [activeIndex, rotateTo])
  const next = useCallback(() => rotateTo(activeIndex + 1), [activeIndex, rotateTo])

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      previous()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      next()
    }
  }, [next, previous])

  const onClickCard = useCallback((index: number) => {
    const stage = stageRef.current
    if (stage?.dataset.dragged === 'true') return
    if (index !== activeIndex) rotateTo(index)
  }, [activeIndex, rotateTo])

  return {
    activeIndex,
    stageRef,
    rotateTo,
    setHovered,
    setFocused,
    previous,
    next,
    onKeyDown,
    onClickCard,
    step,
  }
}
