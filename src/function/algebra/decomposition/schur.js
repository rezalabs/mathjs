import { factory } from '../../../utils/factory.js'

const name = 'schur'
const dependencies = [
  'typed',
  'matrix',
  'identity',
  'multiply',
  'qr',
  'norm',
  'subtract'
]

export const createSchur = /* #__PURE__ */ factory(name, dependencies, (
  {
    typed,
    matrix,
    identity,
    multiply,
    qr,
    norm,
    subtract
  }
) => {
  /**
   *
   * Performs a real Schur decomposition of the real matrix A = UTU' where U is orthogonal
   * and T is upper quasi-triangular.
   * https://en.wikipedia.org/wiki/Schur_decomposition
   *
   * Algorithm:
   * 1. Reduce A to upper Hessenberg form via Householder reflections.
   * 2. Apply the Francis QR algorithm with Wilkinson shifts to drive
   *    sub-diagonal elements to zero.
   * 3. Accumulate orthogonal transformations into U.
   *
   * Syntax:
   *
   *     math.schur(A)
   *
   * Examples:
   *
   *     const A = [[1, 0], [-4, 3]]
   *     math.schur(A) // returns {T: [[3, 4], [0, 1]], R: [[0, 1], [-1, 0]]}
   *
   * See also:
   *
   *     sylvester, lyap, qr
   *
   * @param {Array | Matrix} A  Matrix A
   * @return {{U: Array | Matrix, T: Array | Matrix}} Object containing both matrix U and T of the Schur Decomposition A=UTU'
   */
  return typed(name, {
    Array: function (X) {
      const r = _schur(matrix(X))
      return {
        U: r.U.valueOf(),
        T: r.T.valueOf()
      }
    },

    Matrix: function (X) {
      return _schur(X)
    }
  })

  function _schur (X) {
    const sz = X.size()
    const n = sz[0]
    if (sz.length !== 2 || sz[0] !== sz[1]) {
      throw new RangeError('Non-square matrix in function schur')
    }

    // Handle trivial cases
    if (n === 1) {
      return { U: identity(1), T: X }
    }
    if (n === 2) {
      return { U: identity(2), T: X }
    }

    // Convert to plain 2D array for efficient element access
    const H = X.toArray().map(row => row.slice())
    const U = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
    )

    // Step 1: Reduce to upper Hessenberg form
    _hessenberg(H, U, n)

    // Step 2: Shifted QR iteration on the full Hessenberg matrix
    _francisQR(H, U, n)

    // Convert back to mathjs Matrices
    return {
      U: matrix(U),
      T: matrix(H)
    }
  }

  /**
   * Reduce a matrix to upper Hessenberg form using Householder reflections.
   * Modifies H and U in place. H = U^T * A_orig * U
   *
   * @param {number[][]} H  n×n matrix (modified in place)
   * @param {number[][]} U  n×n identity (modified in place)
   * @param {number} n  dimension
   */
  function _hessenberg (H, U, n) {
    for (let k = 0; k < n - 2; k++) {
      // Compute Householder reflector for column k below the subdiagonal
      const x = Array.from({ length: n - k - 1 }, (_, i) => H[k + 1 + i][k])

      const alpha = _householderVector(x)
      if (alpha === 0) continue

      const v = x

      // Apply P from the left: H = P * H  (rows k+1..n-1, all cols)
      for (let j = k; j < n; j++) {
        let vtH = 0
        for (let i = k + 1; i < n; i++) {
          vtH += v[i - k - 1] * H[i][j]
        }
        const beta = alpha * vtH
        for (let i = k + 1; i < n; i++) {
          H[i][j] -= beta * v[i - k - 1]
        }
      }

      // Apply P from the right: H = H * P  (all rows, cols k+1..n-1)
      for (let i = 0; i < n; i++) {
        let Hv = 0
        for (let j = k + 1; j < n; j++) {
          Hv += H[i][j] * v[j - k - 1]
        }
        const beta = alpha * Hv
        for (let j = k + 1; j < n; j++) {
          H[i][j] -= beta * v[j - k - 1]
        }
      }

      // Apply P to U from the right: U = U * P
      for (let i = 0; i < n; i++) {
        let Uv = 0
        for (let j = k + 1; j < n; j++) {
          Uv += U[i][j] * v[j - k - 1]
        }
        const beta = alpha * Uv
        for (let j = k + 1; j < n; j++) {
          U[i][j] -= beta * v[j - k - 1]
        }
      }
    }
  }

  /**
   * Compute the Householder vector v such that (I - α * v * v^T) * x = ||x|| * e1.
   * Returns α and modifies x in place to be the vector v.
   *
   * @param {number[]} x  input vector (modified in place)
   * @returns {number}  α (0 if x is already zero)
   */
  function _householderVector (x) {
    const m = x.length
    let xNorm = 0
    for (let i = 0; i < m; i++) {
      xNorm += x[i] * x[i]
    }
    xNorm = Math.sqrt(xNorm)

    if (xNorm === 0) return 0

    // Choose the sign to avoid cancellation
    const sigma = x[0] > 0 ? xNorm : -xNorm
    x[0] += sigma

    // α = 1 / (σ * v[0])  where v[0] = x[0] + σ
    return 1 / (sigma * x[0])
  }

  /**
   * Run the shifted QR algorithm (Francis) on the full Hessenberg matrix.
   * Uses the Wilkinson shift for accelerated convergence.
   * Modifies H and U in place.
   *
   * @param {number[][]} H  n×n Hessenberg matrix (modified in place)
   * @param {number[][]} U  n×n orthogonal matrix (modified in place)
   * @param {number} n  dimension
   */
  function _francisQR (H, U, n) {
    const tol = 1e-12
    const maxIter = 100 * n

    for (let iter = 0; iter < maxIter; iter++) {
      // Check convergence: all subdiagonal elements should be near zero
      let converged = true
      for (let i = 1; i < n; i++) {
        if (Math.abs(H[i][i - 1]) > tol) {
          converged = false
          break
        }
      }
      if (converged) break

      // Wilkinson shift from the bottom-right 2×2 block
      const a = H[n - 2][n - 2]
      const b = H[n - 2][n - 1]
      const c = H[n - 1][n - 2]
      const d = H[n - 1][n - 1]

      const tr = a + d
      const det = a * d - b * c
      const disc = tr * tr - 4 * det

      let shift
      if (disc >= 0) {
        const sqrtDisc = Math.sqrt(disc)
        const r1 = (tr + sqrtDisc) / 2
        const r2 = (tr - sqrtDisc) / 2
        shift = Math.abs(r1 - d) <= Math.abs(r2 - d) ? r1 : r2
      } else {
        shift = tr / 2
      }

      // Compute H - shift*I
      const Hshifted = H.map(row => row.slice())
      for (let i = 0; i < n; i++) {
        Hshifted[i][i] -= shift
      }

      // QR decomposition of the shifted Hessenberg matrix
      const Qmat = qr(matrix(Hshifted)).Q
      const Q = Qmat.valueOf()

      // H = Q^T * H_original * Q (implicitly through R*Q + shift)
      // But we compute it via H_shifted = Q*R, then H_new = R*Q + shift*I
      // First: compute R = Q^T * H_shifted
      const Qt = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => Q[j][i])
      )

      const R = Array.from({ length: n }, () => Array(n).fill(0))
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          let sum = 0
          for (let k = 0; k < n; k++) {
            sum += Qt[i][k] * Hshifted[k][j]
          }
          R[i][j] = sum
        }
      }

      // H_new = R * Q
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          let sum = 0
          for (let k = 0; k < n; k++) {
            sum += R[i][k] * Q[k][j]
          }
          H[i][j] = sum
        }
      }

      // Restore the shift on the diagonal
      for (let i = 0; i < n; i++) {
        H[i][i] += shift
      }

      // U = U * Q
      const Unew = Array.from({ length: n }, () => Array(n).fill(0))
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          let sum = 0
          for (let k = 0; k < n; k++) {
            sum += U[i][k] * Q[k][j]
          }
          Unew[i][j] = sum
        }
      }
      for (let i = 0; i < n; i++) {
        U[i] = Unew[i]
      }
    }
  }
})
