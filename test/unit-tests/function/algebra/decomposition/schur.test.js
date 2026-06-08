// test schur decomposition
import assert from 'assert'

import math from '../../../../../src/defaultInstance.js'

describe('schur', function () {
  const A5 = [
    [-5.3, -1.4, -0.2, 0.7, 1.0],
    [-0.4, -1.0, -0.1, -1.2, 0.7],
    [0.3, 0.7, -2.5, 0.7, -0.3],
    [3.6, -0.1, 1.4, -2.4, 0.3],
    [2.8, 0.7, 1.4, 0.5, -4.8]
  ]

  /**
   * Verify that a matrix is quasi upper triangular:
   * all elements below the subdiagonal must be zero (within tolerance).
   */
  function assertQuasiUpperTriangular (M, tol) {
    tol = tol || 1e-10
    const arr = M.valueOf ? M.valueOf() : M
    for (let i = 2; i < arr.length; i++) {
      for (let j = 0; j < i - 1; j++) {
        assert.ok(
          Math.abs(arr[i][j]) < tol,
          'T[' + i + '][' + j + '] = ' + arr[i][j] + ' should be zero'
        )
      }
    }
  }

  /**
   * Verify that a matrix is orthogonal: M * M^T ≈ I.
   */
  function assertOrthogonal (M, tol) {
    tol = tol || 1e-10
    const MT = math.transpose(M)
    const I = math.identity(M.size()[0])
    const diff = math.norm(math.subtract(math.multiply(M, MT), I))
    assert.ok(diff < tol, 'U is not orthogonal: ||U*U^T - I|| = ' + diff)
  }

  it('should decompose a 3x3 orthogonal matrix (regression test)', function () {
    const A = math.matrix([
      [-0.03591206220229135, -0.09100469507870354, 0.9952027277203429],
      [-0.3802068171617618, -0.9197139315803332, -0.09782157349362577],
      [0.9242040358990549, -0.38189583596928406, -0.0015717815434243287]
    ])

    const { U, T } = math.schur(A)

    // T should be quasi upper triangular
    assertQuasiUpperTriangular(T)

    // U should be orthogonal
    assertOrthogonal(U)

    // A = U * T * U^T
    const reconstructed = math.multiply(math.multiply(U, T), math.transpose(U))
    assert.ok(
      math.norm(math.subtract(reconstructed, A)) < 1e-10,
      'Reconstruction A = U*T*U^T failed'
    )
  })

  it('should decompose a 3x3 matrix (Array input)', function () {
    const A = [[1, 0], [-4, 3]]
    const { U, T } = math.schur(A)

    assertQuasiUpperTriangular(T)
    assertOrthogonal(math.matrix(U))
    const reconstructed = math.multiply(
      math.multiply(math.matrix(U), math.matrix(T)),
      math.transpose(math.matrix(U))
    )
    assert.ok(
      math.norm(math.subtract(reconstructed, math.matrix(A))) < 1e-10,
      'Reconstruction A = U*T*U^T failed'
    )
  })

  it('should decompose a 5x5 matrix (Array input)', function () {
    const { U, T } = math.schur(A5)

    assertQuasiUpperTriangular(T)
    assertOrthogonal(math.matrix(U))
    const reconstructed = math.multiply(
      math.multiply(math.matrix(U), math.matrix(T)),
      math.transpose(math.matrix(U))
    )
    assert.ok(
      math.norm(math.subtract(reconstructed, math.matrix(A5))) < 1e-10,
      'Reconstruction A = U*T*U^T failed'
    )
  })

  it('should decompose a 5x5 matrix (Matrix input)', function () {
    const A = math.matrix(A5)
    const { U, T } = math.schur(A)

    assertQuasiUpperTriangular(T)
    assertOrthogonal(U)
    const reconstructed = math.multiply(
      math.multiply(U, T),
      math.transpose(U)
    )
    assert.ok(
      math.norm(math.subtract(reconstructed, A)) < 1e-10,
      'Reconstruction A = U*T*U^T failed'
    )
  })

  it('should decompose a symmetric 3x3 matrix', function () {
    const A = [[4, 1, 1], [1, 3, -1], [1, -1, 2]]
    const { U, T } = math.schur(A)

    assertQuasiUpperTriangular(T)
    assertOrthogonal(math.matrix(U))
    const reconstructed = math.multiply(
      math.multiply(math.matrix(U), math.matrix(T)),
      math.transpose(math.matrix(U))
    )
    assert.ok(
      math.norm(math.subtract(reconstructed, math.matrix(A))) < 1e-10,
      'Reconstruction A = U*T*U^T failed'
    )
  })

  it('should throw an error for non-square matrices', function () {
    assert.throws(
      function () { math.schur([[1, 2, 3], [4, 5, 6]]) },
      /Non-square matrix/
    )
  })
})
