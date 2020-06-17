import { isObject, isPlainObject, isArray, assertType } from '../../src/common'
// import { Request, promisely } from '../../src/mp'
// import { Response } from '../../src/mp/request'

describe('helpers:util', () => {
	describe('isXXX', () => {
		test('should validate Object', () => {
			expect(isObject([])).toBeTruthy()
			expect(isObject(undefined)).toBeFalsy()
		})
		test('should validate plainObject', () => {
			expect(isPlainObject({})).toBeTruthy()
		})
		test('should validate Array', () => {
			expect(isArray([])).toBeTruthy()
			expect(isArray([1, 2])).toBeTruthy()
			expect(isArray([{}])).toBeTruthy()
			expect(isArray({})).toBeFalsy()
		})
		test('assert type', () => {
			expect(assertType('', 'String')).toBeTruthy()
			expect(assertType(undefined, 'Undefined')).toBeTruthy()
			expect(assertType([1, 2, {}], 'Array')).toBeTruthy()
		})
	})
})
