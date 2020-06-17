import { promisely } from './tools'
import { assertType, Queue } from '../common'

export interface Rconf {
	baseURL: string
	loginUrl?: string
	header?: WechatMiniprogram.RequestOption['header']
	type?: 'request' | 'uploadFile'
	getToken?: () => Promise<unknown> | any
	setToken?: (token: string) => Promise<unknown> | any
	requestToken?: () => Promise<unknown> | any
}

export interface ROptions extends WechatMiniprogram.RequestOption {
	type?: 'request' | 'uploadFile'
	token?: string
}

export type ResponseData = {
	error?: string
	message?: string
	path?: string
	status?: number
	data?: {
		code?: number
		result?: AnyObject
	}
} & AnyObject

export interface Response<T = ResponseData> extends WechatMiniprogram.RequestSuccessCallbackResult {
	data: WechatMiniprogram.RequestSuccessCallbackResult['data'] & T
}

export interface RequestPromise<T = AnyObject> extends Promise<Response<T>> {}

export class Request {
	public pendingQueue: any
	public conf: Rconf
	public options: ROptions
	private token?: string
	private _getToken: Rconf['getToken']
	private _setToken: Rconf['setToken']
	private _requestToken: Rconf['requestToken']
	private _before: any
	private _after: any
	constructor(conf: Rconf) {
		this.pendingQueue = new Queue()
		this.conf = conf
		this.options = { url: '', type: 'request' }
		this._getToken = conf.getToken
		this._setToken = conf.setToken
		this._requestToken = conf.requestToken
	}

	// 请求之前，用于改变请求入参
	before(beforeHandler: (c: ROptions) => ROptions) {
		if (typeof beforeHandler !== 'function') {
			return console.warn('[ before ] 参数只支持函数 ')
		}
		this._before = beforeHandler
	}

	// 请求之后，用于封装返回值
	after(afterHandler: (resolve: (value?: any) => void, reject: (value?: any) => void, response: ResponseData) => any) {
		if (typeof afterHandler !== 'function') {
			return console.warn('[ after ] 参数只支持函数 ')
		}
		this._after = afterHandler
	}

	// 获取登陆凭证
	async getToken() {
		return new Promise(async (resolve, reject) => {
			if (this._getToken) {
				try {
					const response = await this._getToken()
					resolve(response)
				} catch (err) {
					reject(err)
				}
			} else {
				throw new Error('[ getToken ] 没有传入获取登陆凭证的方法')
			}
		})
	}

	async handleNotAuthRequest(config: ROptions, resolve: (value?: any) => void, reject: (value?: any) => void) {
		const notTokenRequest = async () => {
			return resolve(await this.request(config).catch((err) => reject(err)))
		}
		this.pendingQueue.enqueue(notTokenRequest)
		if (typeof this._getToken !== 'function') {
			throw new Error('[ handleNotAuthRequest ] 获取登陆凭证方法必须是函数')
		}
		if (this.pendingQueue.size() === 1 && !this.token) {
			await new Promise(async (res, ret) => {
				try {
					if (typeof this._requestToken === 'function') {
						const token = await this._requestToken()
						if (this._setToken) {
							await this._setToken(token as string)
						}
						res(token)
					} else {
						ret('[ handleNotAuthRequest ] 请求登陆凭证方法必须是函数')
					}
				} catch (err) {
					ret(err)
				}
			})
			this.pendingQueue.loopExec()
		}
	}

	async doRequest(options: ROptions, resolve: (value?: any) => void, reject: (value?: any) => void) {
		options.url = this.conf.baseURL + options.url
		const requestType = {
			request: wx.request,
			uploadFile: wx.uploadFile,
		}
		promisely(requestType[options.type || 'request'], options)
			.then((response) => {
				if (assertType(this._after, 'Function')) {
					this._after(resolve, reject, response)
				} else {
					resolve(response)
				}
			})
			.catch((err) => {
				if (assertType(this._after, 'Function')) {
					this._after(resolve, reject, err)
				} else {
					reject(err)
				}
			})
	}

	request(options: ROptions) {
		const { baseURL, loginUrl } = this.conf
		const header = { ...this.conf.header, ...options.header }
		options = { ...this.conf, ...options, header }
		const p = new Promise<Response<ResponseData>>(async (resolve, reject) => {
			if (!loginUrl) {
				this.doRequest(options, resolve, reject)
			} else {
				if (typeof this._getToken !== 'function') {
					throw new Error('[ getToken ] 没有传入获取登陆凭证的方法')
				}
				const token = await this.getToken()
				this.token = token as string
				options.token = this.token
				this._before(options)
				const url = baseURL + options.url
				if (!url.includes(loginUrl) && !token) {
					this.handleNotAuthRequest(options, resolve, reject)
				} else {
					this.doRequest(options, resolve, reject)
				}
			}
		})
		return p
	}

	post(config: ROptions) {
		config.method = 'POST'
		return this.request(config)
	}

	get(config: ROptions) {
		config.method = 'GET'
		return this.request(config)
	}

	uploadFile(config: ROptions) {
		config.header = {
			'Content-Type': 'multipart/form-data',
		}
		config.type = 'uploadFile'
		return this.request(config)
	}
}
