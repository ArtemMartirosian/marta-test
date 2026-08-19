import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PerspectiveCamera } from 'three'

import type { SceneFrame } from '../config/scene'
import { applyUnrealCamera } from '../three/unrealCamera'

type CameraRigProps = Readonly<{
  filmbackHeightMm: number
  frame: SceneFrame
}>

export const CameraRig = ({ filmbackHeightMm, frame }: CameraRigProps) => {
  const { camera, invalidate, size } = useThree()

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) {
      return
    }

    applyUnrealCamera(
      camera,
      frame.camera,
      filmbackHeightMm,
      size,
      frame.image,
    )
    invalidate()
  }, [camera, filmbackHeightMm, frame, invalidate, size])

  return null
}

