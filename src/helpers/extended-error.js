/**
 * Extended error class to handle additional error information.
 */
export class ExtendedError extends Error {
  /**
   * @param {object} info - Error information.
   */
  constructor (info) {
    super(info.message)

    this.name = info.name || 'Error'
    if (info.stack && typeof info.stack === 'string') {
      this.stack = info.stack
    }
  }
}
