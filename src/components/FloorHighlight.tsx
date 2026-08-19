import { useEffect, useMemo } from 'react'
import { type ThreeEvent, useLoader, useThree } from '@react-three/fiber'
import {
  type BufferGeometry,
  DoubleSide,
  FrontSide,
  Mesh,
  MeshBasicMaterial,
} from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

import type { Vector3Config } from '../config/scene'
import { createVerticalFaceGeometry } from '../three/verticalFaces'

type FloorHighlightProps = Readonly<{
  calibration: boolean
  modelSrc: string
  position: Vector3Config
  selected: boolean
  onReady: () => void
  onSelectedChange: (selected: boolean) => void
}>

export const FloorHighlight = ({
  calibration,
  modelSrc,
  onReady,
  onSelectedChange,
  position,
  selected,
}: FloorHighlightProps) => {
  const source = useLoader(FBXLoader, modelSrc)
  const { invalidate } = useThree()

  const model = useMemo(() => {
    const visible = source.clone(true)
    const hitTarget = source.clone(true)
    const visibleMaterials: MeshBasicMaterial[] = []
    const hitMaterials: MeshBasicMaterial[] = []
    const visibleGeometries: BufferGeometry[] = []

    visible.updateMatrixWorld(true)
    visible.traverse((child) => {
      if (!(child instanceof Mesh)) {
        return
      }

      const geometry = createVerticalFaceGeometry(
        child.geometry,
        child.matrixWorld,
      )
      const material = new MeshBasicMaterial({
        color: '#5cffbd',
        depthTest: true,
        depthWrite: true,
        opacity: 0.001,
        side: FrontSide,
        toneMapped: false,
        transparent: true,
      })
      child.geometry = geometry
      child.material = material
      child.raycast = () => undefined
      child.renderOrder = 2
      visibleGeometries.push(geometry)
      visibleMaterials.push(material)
    })

    hitTarget.traverse((child) => {
      if (!(child instanceof Mesh)) {
        return
      }

      const material = new MeshBasicMaterial({
        depthTest: false,
        depthWrite: false,
        opacity: 0,
        side: DoubleSide,
        transparent: true,
      })
      material.colorWrite = false
      child.material = material
      hitMaterials.push(material)
    })

    return {
      hitMaterials,
      hitTarget,
      visible,
      visibleGeometries,
      visibleMaterials,
    }
  }, [source])

  const { hitMaterials, hitTarget, visible, visibleGeometries, visibleMaterials } = model

  useEffect(() => {
    onReady()
  }, [onReady])

  useEffect(() => {
    visibleMaterials.forEach((material) => {
      material.color.set(calibration ? '#ff4fd8' : '#5cffbd')
      material.opacity = calibration ? 0.3 : selected ? 0.38 : 0.001
      material.wireframe = false
      material.needsUpdate = true
    })
    invalidate()
  }, [calibration, invalidate, selected, visibleMaterials])

  useEffect(
    () => () => {
      visibleGeometries.forEach((geometry) => geometry.dispose())
      visibleMaterials.forEach((material) => material.dispose())
      hitMaterials.forEach((material) => material.dispose())
    },
    [hitMaterials, visibleGeometries, visibleMaterials],
  )

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (event.nativeEvent.pointerType !== 'touch') {
      onSelectedChange(true)
      document.body.style.cursor = 'pointer'
    }
  }

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (event.nativeEvent.pointerType !== 'touch') {
      onSelectedChange(false)
      document.body.style.cursor = ''
    }
  }

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (event.nativeEvent.pointerType === 'touch') {
      onSelectedChange(true)
    }
  }

  useEffect(() => () => void (document.body.style.cursor = ''), [])

  return (
    <group position={[position.x, position.y, position.z]}>
      <primitive object={visible} dispose={null} />
      <primitive
        object={hitTarget}
        dispose={null}
        onPointerDown={handlePointerDown}
        onPointerOut={handlePointerOut}
        onPointerOver={handlePointerOver}
      />
    </group>
  )
}
