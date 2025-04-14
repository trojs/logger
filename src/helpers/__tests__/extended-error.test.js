import { describe, it } from 'node:test'
import assert from 'node:assert';
import { ExtendedError } from '../extended-error.js';

describe('ExtendedError', () => {
  it('should create an error with a custom message and name', () => {
    const errorInfo = { message: 'Custom error message', name: 'CustomError' };
    const error = new ExtendedError(errorInfo);

    assert.strictEqual(error.message, 'Custom error message');
    assert.strictEqual(error.name, 'CustomError');
  });

  it('should default the name to "Error" if not provided', () => {
    const errorInfo = { message: 'Default name error' };
    const error = new ExtendedError(errorInfo);

    assert.strictEqual(error.message, 'Default name error');
    assert.strictEqual(error.name, 'Error');
  });

  it('should set the stack if provided in the info object', () => {
    const errorInfo = {
      message: 'Error with stack',
      stack: 'Custom stack trace',
    };
    const error = new ExtendedError(errorInfo);

    assert.strictEqual(error.stack, 'Custom stack trace');
  });

  it('should not set the stack if it is not a string', () => {
    const errorInfo = { message: 'Error without valid stack', stack: 12345 };
    const error = new ExtendedError(errorInfo);

    assert.notStrictEqual(error.stack, 12345);
  });
});
