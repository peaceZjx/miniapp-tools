const toString: (val: any) => string = Object.prototype.toString

type DataTypes =
	| 'String'
	| 'Number'
	| 'Boolean'
	| 'Null'
	| 'Undefined'
	| 'Object'
	| 'Array'
	| 'Function'
	| 'Date'
	| 'RegExp'
	| 'Map'
	| 'Set'
	| 'HTMLDivElement'
	| 'WeakMap'
	| 'Window'
	| 'Error'
	| 'Arguments'

export function assertType(data: any, type: DataTypes): boolean {
	let dataType = Object.prototype.toString.call(data)
	return dataType.slice(8, -1) === type
}

export function isObject(val: any): val is Object {
	return val !== null && typeof val === 'object'
}

export function isPlainObject(val: any): val is Object {
	return toString.call(val, null) === '[object Object]'
}

export function isArray(val: any): val is any[] {
	return toString.call(val, null) === '[object Array]'
}

/**
 * 将小程序的异步回调api给promise化
 * @param func 被promise化的函数
 * @param args 传递给这个函数的参数
 */
export const promisely = (func: any, args?: any) => {
	if (typeof func !== 'function') {
		return Promise.reject('[promisely] 第一个参数是函数')
	}
	return new Promise((resolve, reject) => {
		func({
			...args,
			success: resolve,
			fail: reject,
			complete: resolve,
		})
	})
}
