import { describe, expect, it } from 'vitest'

import {
  coverVerticalFovDegrees,
  unrealPositionToThree,
  unrealRotationToThreeBasis,
  verticalFovDegrees,
} from './unrealCamera'

const expectVector = (
  actual: Readonly<{ x: number; y: number; z: number }>,
  expected: readonly [number, number, number],
) => {
  expect(actual.x).toBeCloseTo(expected[0], 6)
  expect(actual.y).toBeCloseTo(expected[1], 6)
  expect(actual.z).toBeCloseTo(expected[2], 6)
}

describe('Unreal camera conversion', () => {
  it('maps Unreal X-forward/Y-right/Z-up into Three coordinates', () => {
    expectVector(unrealPositionToThree({ x: 1, y: 2, z: 3 }), [2, 3, -1])
  })

  it('keeps the identity camera looking down Three local -Z', () => {
    const basis = unrealRotationToThreeBasis({ pitch: 0, yaw: 0, roll: 0 })
    expectVector(basis.forward, [0, 0, -1])
    expectVector(basis.right, [1, 0, 0])
    expectVector(basis.up, [0, 1, 0])
  })

  it('maps positive Unreal yaw and pitch to the expected view axes', () => {
    expectVector(
      unrealRotationToThreeBasis({ pitch: 0, yaw: 90, roll: 0 }).forward,
      [1, 0, 0],
    )
    expectVector(
      unrealRotationToThreeBasis({ pitch: 90, yaw: 0, roll: 0 }).forward,
      [0, 1, 0],
    )
  })

  it('preserves a right-handed orthonormal basis, including roll', () => {
    const basis = unrealRotationToThreeBasis({ pitch: 17, yaw: -64, roll: 31 })
    const back = basis.forward.clone().negate()

    expect(basis.right.length()).toBeCloseTo(1, 8)
    expect(basis.up.length()).toBeCloseTo(1, 8)
    expect(basis.forward.length()).toBeCloseTo(1, 8)
    expect(basis.right.dot(basis.up)).toBeCloseTo(0, 8)
    expect(basis.right.clone().cross(basis.up).dot(back)).toBeCloseTo(1, 8)
  })

  it('derives vertical FOV only from filmback height and focal length', () => {
    expect(verticalFovDegrees(13.365, 25)).toBeCloseTo(29.93058, 5)
  })

  it('matches centered object-fit cover for narrow and wide viewports', () => {
    const source = verticalFovDegrees(13.365, 25)
    const imageAspect = 3439 / 1379

    expect(coverVerticalFovDegrees(source, imageAspect, 9 / 16)).toBeCloseTo(
      source,
      8,
    )
    expect(coverVerticalFovDegrees(source, imageAspect, 32 / 9)).toBeLessThan(
      source,
    )
  })
})
