import {
  MathUtils,
  PerspectiveCamera,
  Vector3,
  type Vector3Like,
} from 'three'

import type { UnrealCameraConfig } from '../config/scene'

export const CENTIMETRES_TO_SCENE = 1

const mapUnrealVectorToThree = (vector: Vector3Like) =>
  new Vector3(vector.y, vector.z, -vector.x)

export const unrealPositionToThree = (positionCm: Vector3Like) =>
  mapUnrealVectorToThree(positionCm).multiplyScalar(CENTIMETRES_TO_SCENE)

export const unrealRotationToThreeBasis = (
  rotationDeg: UnrealCameraConfig['rotationDeg'],
) => {
  const pitch = MathUtils.degToRad(rotationDeg.pitch)
  const yaw = MathUtils.degToRad(rotationDeg.yaw)
  const roll = MathUtils.degToRad(rotationDeg.roll)

  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const cr = Math.cos(roll)
  const sr = Math.sin(roll)

  const forwardUnreal = new Vector3(cp * cy, cp * sy, sp)
  const rightUnreal = new Vector3(
    sr * sp * cy - cr * sy,
    sr * sp * sy + cr * cy,
    -sr * cp,
  )
  const upUnreal = new Vector3(
    -(cr * sp * cy + sr * sy),
    sr * cy - cr * sp * sy,
    cr * cp,
  )

  return {
    forward: mapUnrealVectorToThree(forwardUnreal).normalize(),
    right: mapUnrealVectorToThree(rightUnreal).normalize(),
    up: mapUnrealVectorToThree(upUnreal).normalize(),
  }
}

export const verticalFovDegrees = (
  filmbackHeightMm: number,
  focalLengthMm: number,
) =>
  MathUtils.radToDeg(
    2 * Math.atan(filmbackHeightMm / (2 * focalLengthMm)),
  )

export const coverVerticalFovDegrees = (
  sourceVerticalFovDeg: number,
  imageAspect: number,
  viewportAspect: number,
) => {
  if (viewportAspect <= imageAspect) {
    return sourceVerticalFovDeg
  }

  const sourceHalfFov = MathUtils.degToRad(sourceVerticalFovDeg) / 2
  return MathUtils.radToDeg(
    2 * Math.atan(Math.tan(sourceHalfFov) * (imageAspect / viewportAspect)),
  )
}

export const applyUnrealCamera = (
  camera: PerspectiveCamera,
  cameraConfig: UnrealCameraConfig,
  filmbackHeightMm: number,
  viewport: Readonly<{ width: number; height: number }>,
  image: Readonly<{ width: number; height: number }>,
) => {
  const position = unrealPositionToThree(cameraConfig.positionCm)
  const { forward, up } = unrealRotationToThreeBasis(cameraConfig.rotationDeg)

  camera.position.copy(position)
  camera.up.copy(up)
  camera.lookAt(position.clone().add(forward))

  const imageAspect = image.width / image.height
  const viewportAspect = viewport.width / viewport.height
  const sourceFov = verticalFovDegrees(
    filmbackHeightMm,
    cameraConfig.focalLengthMm,
  )

  camera.fov = coverVerticalFovDegrees(
    sourceFov,
    imageAspect,
    viewportAspect,
  )
  camera.aspect = viewportAspect
  camera.near = 10
  camera.far = 100_000
  camera.clearViewOffset()
  camera.updateProjectionMatrix()
  camera.updateMatrixWorld(true)
}
