import type { Dispatch, SetStateAction } from 'react'

import type { Vector3Config } from '../config/scene'

type CalibrationPanelProps = Readonly<{
  position: Vector3Config
  setPosition: Dispatch<SetStateAction<Vector3Config>>
}>

const AXES = ['x', 'y', 'z'] as const

export const CalibrationPanel = ({
  position,
  setPosition,
}: CalibrationPanelProps) => (
  <aside className="calibration-panel">
    <strong>Калибровка модели</strong>
    {AXES.map((axis) => (
      <label key={axis}>
        {axis.toUpperCase()}
        <input
          type="number"
          step="10"
          value={position[axis]}
          onChange={(event) => {
            const value = event.currentTarget.valueAsNumber
            if (Number.isFinite(value)) {
              setPosition((current) => ({ ...current, [axis]: value }))
            }
          }}
        />
      </label>
    ))}
    <code>{`{ x: ${position.x}, y: ${position.y}, z: ${position.z} }`}</code>
  </aside>
)

