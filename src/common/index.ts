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

export class Queue {
	public queue: any[]
	constructor() {
		this.queue = []
	}

	/**
	 * 入队
	 */
	enqueue(arg: any) {
		this.queue.push(arg)
	}

	/**
	 * 出队
	 */
	dequeue() {
		let result = this.queue.shift()
		return typeof result !== 'undefined' ? result : false
	}

	/**
	 * 队列是否为空
	 */
	isEmpty() {
		return this.queue.length === 0
	}

	/**
	 * 返回队列长度
	 */
	size() {
		return this.queue.length
	}

	/**
	 * 清空队列
	 */
	clear() {
		this.queue = []
	}

	/**
	 * 将整个队列返回，队列不会清空
	 */
	show() {
		return this.queue
	}

	/**
	 * 出队并且执行，直到清空队列
	 */
	loopExec() {
		if (this.isEmpty()) return
		let element = this.dequeue()
		typeof element === 'function' && element()
		this.loopExec()
	}
}
