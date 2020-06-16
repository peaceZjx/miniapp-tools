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
