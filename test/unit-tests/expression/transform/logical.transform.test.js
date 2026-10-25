import assert from 'assert'
import math from '../../../../src/defaultInstance.js'
import { ArgumentsError } from '../../../../src/error/ArgumentsError.js'

function arityError (name, count) {
  return function (err) {
    assert.ok(err instanceof ArgumentsError)
    assert.strictEqual(
      err.message,
      `Wrong number of arguments in function ${name} (${count} provided, 2 expected)`)
    return true
  }
}

describe('logical.transform', function () {
  const cases = [
    {
      name: 'and',
      two: 'and(true, false)',
      twoResult: false,
      lazy: 'and(false, undefinedSymbol)',
      lazyResult: false
    },
    {
      name: 'or',
      two: 'or(false, true)',
      twoResult: true,
      lazy: 'or(true, undefinedSymbol)',
      lazyResult: true
    },
    {
      name: 'bitAnd',
      two: 'bitAnd(6, 3)',
      twoResult: 2,
      lazy: 'bitAnd(0, undefinedSymbol)',
      lazyResult: 0
    },
    {
      name: 'bitOr',
      two: 'bitOr(4, 1)',
      twoResult: 5,
      lazy: 'bitOr(-1, undefinedSymbol)',
      lazyResult: -1
    },
    {
      name: 'nullish',
      two: 'nullish(null, 8)',
      twoResult: 8,
      lazy: 'nullish(2, undefinedSymbol)',
      lazyResult: 2
    }
  ]

  cases.forEach(function ({ name, two, twoResult, lazy, lazyResult }) {
    describe(name, function () {
      it('should evaluate a function call with two arguments', function () {
        assert.strictEqual(math.evaluate(two), twoResult)
      })

      it('should short-circuit without evaluating the second argument', function () {
        assert.strictEqual(math.evaluate(lazy), lazyResult)
      })

      it('should throw an ArgumentsError when called without arguments', function () {
        assert.throws(
          () => math.evaluate(`${name}()`),
          arityError(name, 0))
      })

      it('should throw an ArgumentsError when called with one argument', function () {
        assert.throws(
          () => math.evaluate(`${name}(true)`),
          arityError(name, 1))
      })

      it('should throw an ArgumentsError when called with three arguments', function () {
        assert.throws(
          () => math.evaluate(`${name}(1, 2, 3)`),
          arityError(name, 3))
      })

      it('should not evaluate any argument when the argument count is wrong', function () {
        const scope = {}
        assert.throws(
          () => math.evaluate(`${name}((a = false), (b = true), (c = true))`, scope),
          arityError(name, 3))
        assert.deepStrictEqual(scope, {})
      })
    })
  })
})
