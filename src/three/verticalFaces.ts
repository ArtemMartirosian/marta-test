import {
  BufferGeometry,
  Float32BufferAttribute,
  Matrix3,
  type Matrix4,
  Vector3,
} from 'three'

const DEFAULT_MAX_ABS_WORLD_NORMAL_Y = 0.5

export const createVerticalFaceGeometry = (
  source: BufferGeometry,
  worldMatrix: Matrix4,
  maxAbsWorldNormalY = DEFAULT_MAX_ABS_WORLD_NORMAL_Y,
) => {
  const geometry = source.index ? source.toNonIndexed() : source
  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  const uv = geometry.getAttribute('uv')
  const normalMatrix = new Matrix3().getNormalMatrix(worldMatrix)

  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const a = new Vector3()
  const b = new Vector3()
  const c = new Vector3()
  const edgeAB = new Vector3()
  const edgeAC = new Vector3()
  const faceNormal = new Vector3()

  for (let index = 0; index + 2 < position.count; index += 3) {
    a.fromBufferAttribute(position, index)
    b.fromBufferAttribute(position, index + 1)
    c.fromBufferAttribute(position, index + 2)
    edgeAB.subVectors(b, a)
    edgeAC.subVectors(c, a)
    faceNormal.crossVectors(edgeAB, edgeAC)

    if (faceNormal.lengthSq() === 0) {
      continue
    }

    faceNormal.normalize().applyMatrix3(normalMatrix).normalize()
    if (Math.abs(faceNormal.y) > maxAbsWorldNormalY) {
      continue
    }

    for (let vertex = index; vertex < index + 3; vertex += 1) {
      positions.push(
        position.getX(vertex),
        position.getY(vertex),
        position.getZ(vertex),
      )

      if (normal) {
        normals.push(normal.getX(vertex), normal.getY(vertex), normal.getZ(vertex))
      }

      if (uv) {
        uvs.push(uv.getX(vertex), uv.getY(vertex))
      }
    }
  }

  const result = new BufferGeometry()
  result.setAttribute('position', new Float32BufferAttribute(positions, 3))

  if (normal) {
    result.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  } else {
    result.computeVertexNormals()
  }

  if (uv) {
    result.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  }

  result.computeBoundingBox()
  result.computeBoundingSphere()

  if (geometry !== source) {
    geometry.dispose()
  }

  return result
}
