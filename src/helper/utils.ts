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
