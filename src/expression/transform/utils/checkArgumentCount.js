import { ArgumentsError } from '../../../error/ArgumentsError.js'

/**
 * Validate that a rawArgs transform receives exactly the expected number of
 * arguments, throwing before any argument is evaluated. Transforms that
 * evaluate their arguments one at a time in order to short-circuit cannot
 * defer this validation to the underlying typed function, since that would
 * require evaluating all arguments first.
 *
 * @param {string} name     Name of the function, used in the error message
 * @param {Array} args      The raw, unevaluated argument nodes of the transform
 * @param {number} expected The exact number of arguments expected
 * @throws {ArgumentsError} Throws when the number of arguments
 *                          is not equal to the expected number
 */
export function checkArgumentCount (name, args, expected) {
  if (args.length !== expected) {
    throw new ArgumentsError(name, args.length, expected)
  }
}
