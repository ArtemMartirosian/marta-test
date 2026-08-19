import { BoxGeometry, Matrix3, Matrix4, Vector3 } from 'three'
import { describe, expect, it } from 'vitest'

import { createVerticalFaceGeometry } from './verticalFaces'

const worldNormalYValues = (geometry: BoxGeometry, worldMatrix: Matrix4) => {
  const position = geometry.getAttribute('position')
  const normalMatrix = new Matrix3().getNormalMatrix(worldMatrix)
  const a = new Vector3()
  const b = new Vector3()
  const c = new Vector3()
  const edgeAB = new Vector3()
  const edgeAC = new Vector3()
  const normal = new Vector3()
  const values: number[] = []

  for (let index = 0; index < position.count; index += 3) {
    a.fromBufferAttribute(position, index)
    b.fromBufferAttribute(position, index + 1)
    c.fromBufferAttribute(position, index + 2)
    edgeAB.subVectors(b, a)
    edgeAC.subVectors(c, a)
    normal
      .crossVectors(edgeAB, edgeAC)
      .normalize()
      .applyMatrix3(normalMatrix)
      .normalize()
    values.push(Math.abs(normal.y))
  }

  return values
}

describe('createVerticalFaceGeometry', () => {
  it('removes the top and bottom faces from an upright box', () => {
    const source = new BoxGeometry(2, 1, 3)
    const result = createVerticalFaceGeometry(source, new Matrix4())

    expect(result.getAttribute('position').count).toBe(24)
    expect(
      worldNormalYValues(result as BoxGeometry, new Matrix4()).every(
        (normalY) => normalY < 0.5,
      ),
    ).toBe(true)

    source.dispose()
    result.dispose()
  })

  it('classifies faces after the FBX child rotation', () => {
    const source = new BoxGeometry(2, 3, 1)
    const worldMatrix = new Matrix4().makeRotationX(-Math.PI / 2)
    const result = createVerticalFaceGeometry(source, worldMatrix)

    expect(result.getAttribute('position').count).toBe(24)
    expect(
      worldNormalYValues(result as BoxGeometry, worldMatrix).every(
        (normalY) => normalY < 0.5,
      ),
    ).toBe(true)

    source.dispose()
    result.dispose()
  })
})
