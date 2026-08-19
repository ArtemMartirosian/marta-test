import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'

import { SCENE_CONFIG, type Vector3Config } from '../config/scene'
import { useFrameUrl } from '../hooks/useFrameUrl'
import { CalibrationPanel } from './CalibrationPanel'
import { CameraRig } from './CameraRig'
import { FloorHighlight } from './FloorHighlight'

const frameIds = SCENE_CONFIG.frames.map((frame) => frame.id)

export const FacadeViewer = () => {
  const { frameId, selectFrame } = useFrameUrl(frameIds)
  const frame =
    SCENE_CONFIG.frames.find((candidate) => candidate.id === frameId) ??
    SCENE_CONFIG.frames[0]
  const calibration = useMemo(
    () =>
      import.meta.env.DEV &&
      new URL(window.location.href).searchParams.has('calibrate'),
    [],
  )
  const [modelPosition, setModelPosition] = useState<Vector3Config>(
    SCENE_CONFIG.model.positionScene,
  )
  const [modelReady, setModelReady] = useState(false)
  const [selected, setSelected] = useState(false)
  const handleModelReady = useCallback(() => setModelReady(true), [])

  useEffect(() => {
    SCENE_CONFIG.frames.forEach((candidate) => {
      const image = new Image()
      image.src = candidate.image.src
    })
  }, [])

  useEffect(() => setSelected(false), [frame.id])

  return (
    <main className="facade-viewer">
      <img
        className="facade-image"
        src={frame.image.src}
        alt="Фасад жилого комплекса"
        width={frame.image.width}
        height={frame.image.height}
        draggable={false}
        fetchPriority="high"
      />

      <Canvas
        className="scene-canvas"
        camera={{ fov: 30, near: 10, far: 100_000 }}
        dpr={[1, 2]}
        frameloop="demand"
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        onPointerMissed={() => setSelected(false)}
      >
        <CameraRig filmbackHeightMm={SCENE_CONFIG.filmbackHeightMm} frame={frame} />
        <Suspense fallback={null}>
          <FloorHighlight
            calibration={calibration}
            modelSrc={SCENE_CONFIG.model.src}
            onReady={handleModelReady}
            onSelectedChange={setSelected}
            position={modelPosition}
            selected={selected}
          />
        </Suspense>
      </Canvas>

      <header className="top-bar">
        <div className="brand-mark" aria-hidden="true">M</div>
        <div>
          <p className="eyebrow">Выбор квартиры</p>
          <p className="building-name">Корпус А · 7 этаж</p>
        </div>
      </header>

      <div className={`interaction-status${selected ? ' is-active' : ''}`} aria-live="polite">
        <span className="status-dot" />
        {selected ? '7 этаж выбран' : 'Наведите или коснитесь этажа'}
      </div>

      <nav className="frame-switcher" aria-label="Ракурс здания">
        {SCENE_CONFIG.frames.map((candidate) => (
          <button
            className={candidate.id === frame.id ? 'is-current' : undefined}
            key={candidate.id}
            type="button"
            aria-pressed={candidate.id === frame.id}
            onClick={() => selectFrame(candidate.id)}
          >
            <span>{candidate.id}</span>
            {candidate.label}
          </button>
        ))}
      </nav>

      {!modelReady && <div className="loading-indicator">Загружаем этаж…</div>}
      {calibration && (
        <CalibrationPanel position={modelPosition} setPosition={setModelPosition} />
      )}
    </main>
  )
}

