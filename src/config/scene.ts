export type Vector3Config = Readonly<{
  x: number
  y: number
  z: number
}>

export type UnrealCameraConfig = Readonly<{
  positionCm: Vector3Config
  rotationDeg: Readonly<{
    pitch: number
    yaw: number
    roll: number
  }>
  focalLengthMm: number
}>

export type SceneFrame = Readonly<{
  id: string
  label: string
  image: Readonly<{
    src: string
    width: number
    height: number
  }>
  camera: UnrealCameraConfig
}>

export type SceneConfig = Readonly<{
  filmbackHeightMm: number
  model: Readonly<{
    src: string
    positionScene: Vector3Config
  }>
  frames: readonly SceneFrame[]
}>

const assetUrl = (filename: string) =>
  `${import.meta.env.BASE_URL}assets/${filename}`

export const SCENE_CONFIG = {
  filmbackHeightMm: 13.365,
  model: {
    src: assetUrl('SM_highlight_A_7F.fbx'),
    positionScene: { x: 10_800, y: 150, z: 7_800 },
  },
  frames: [
    {
      id: '01',
      label: 'Ракурс 01',
      image: {
        src: assetUrl('Pogod_01.jpg'),
        width: 3439,
        height: 1379,
      },
      camera: {
        positionCm: {
          x: -8219.125682,
          y: 17917.186677,
          z: 21877.937132,
        },
        rotationDeg: {
          pitch: -16.484003,
          yaw: -90.03614,
          roll: 0,
        },
        focalLengthMm: 25,
      },
    },
    {
      id: '02',
      label: 'Ракурс 02',
      image: {
        src: assetUrl('Pogod_02.jpg'),
        width: 3439,
        height: 1382,
      },
      camera: {
        positionCm: {
          x: -26815.163848,
          y: -299.492574,
          z: 22587.838344,
        },
        rotationDeg: {
          pitch: -18.527453,
          yaw: -1.348379,
          roll: -0,
        },
        focalLengthMm: 25,
      },
    },
  ],
} as const satisfies SceneConfig
