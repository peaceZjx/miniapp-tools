> 在开发过程当中，经常会有一些通用的工具方法，所以这里整理出来，减少CV操作。

目前主要分为两类工具：

- 通用工具 - **common**，`import { common } from '@i965/mini-tools';`
- 微信小程序 - **mp**，`import { mp } from '@i965/mini-tools';`



## common

### assertType

> 类型断言，主要是使用的`Object.prototype.toString`方法进行判断。

```js
const str = 'this is String';
assertType(str, 'String'); // true

const fn = () => {};
assertType(fn, 'Function'); // true
```



### Queue

> 队列类

|   方法   | 参数 |             说明             |
| :------: | :--: | :--------------------------: |
| enqueue  | any  |           数据入队           |
| dequeue  |  无  |           数据出队           |
| isEmpty  |  无  |        *队列是否为空*        |
|   size   |  无  |        *返回队列长度*        |
|  clear   |  无  |           清空队列           |
|   show   |  无  | 将整个队列返回，队列不会清空 |
| loopExec |  无  |  出队并且执行，直到清空队列  |



## mp

### diff

> 比较两个对象的节点差异，主要是为了优化小程序的`setData`。

```js
const cur = {
  a: 1,
  b: 2,
  c: 'str',
  d: { e: [2, { a: 4 }, 5] },
  f: true,
  h: [1],
  g: { a: [1, 2], j: 111 },
}
				
const pre = {
	a: [],
  b: 'aa',
  c: 3,
  d: { e: [3, { a: 3 }] },
  f: false,
  h: [1, 2],
  g: { a: [1, 1, 1], i: 'delete' },
  k: 'del',
}

diff(cur, pre) // { a: 1, b: 2, c: 'str', 'd.e[0]': 2, 'd.e[1].a': 4, 'd.e[2]': 5, f: true, h: [1], 'g.a': [1, 2], 'g.j': 111, 'g.i': null, k: null }
```



### promisely

> 将小程序api的回调风格转换为promise风格。

```js
const response = await mp.promisely(wx.request, {...requestOptions});
```



### request

> 因为业务需求，每次登陆小程序都要验证token，而小程序没有统一的登陆入口，所以这里将小程序的请求进行了一层封装，默认第一次请求的时候会预先请求token。

```
import { mp } from '@i965/mini-tools';
const request = new mp.Request(constructOptions);
```

构造函数入参是一个对象：

- baseURL - 请求地址的基础URL
- loginUrl - 获取登陆凭证的地址，如果你的小程序接入了登陆凭证验证如 **token**，在处理接口时，会默认不处理这个url；如果你没有传入这个参数，就表示你没有使用登陆凭证验证，会直接进行请求。
- getToken - 从本地获取登陆凭证的方法，支持promise
- setToken - 将登陆凭证存放在本地的方法，支持promise
- requestToken - 后端服务获取 token 的方法，必须是一个promise

生成的实例方法：

- request 

  参数是一个对象，同wx.request或者wx.uploadFile，在此基础上另外多了一个 `type?: 'request' | 'uploadFile'`，如果是request，实质调用的是wx.request；如果是uploadFile，实质是调用的wx.uploadFile；默认是request。

- post

  实质调用的是上面的`request({method: 'post',type: 'request', ...others})`

- get

  实质调用的是上面的`request({method: 'get', type: 'request', ...others})`

- uploadFile

  实质调用的是上面的`request({type: 'uploadFile', ...others})`

- before

  请求拦截，可以在这里处理请求头等等信息。参数是一个函数，该函数的参数是传入的请求参数。

- after

  响应拦截，可以自定义处理响应信息。参数是一个函数，`(resolve, reject, response) => void`，前两个是该请求的promise的状态处理，后一个是返回的具体信息。假设我们约定返回的`response.data.code === 0`是正常的，其它都是错误的，那么这个response的结果的可以通过`resolve(response)`返回成功态，`reject(response)`返回失败态。

```js
// request.js
import { mp } from '@i965/mini-tools';
import CODE from './code';
import { REQUEST } from '../../config/index';
const app = getApp();
const baseURL = REQUEST.baseURL;

// 从本地获取 token 的方法
const getToken = () => {
  return app.globalData.userInfo ? app.globalData.userInfo.token : '';
};

// 将 token 存放在本地的方法
const setToken = (token) => {
  const userInfo = {
    token,
  };
  Object.assign(app.globalData.userInfo, userInfo);
};

// 后端服务获取 token 的方法
const requestToken = () =>
  new Promise(async (resolve, reject) => {
    const { code } = await mp.promisely(wx.login);
    const response = await mp
      .promisely(wx.request, {
        url: `${baseURL}user/WxUser/wxLogin?appId=${REQUEST.appId}`,
        method: 'post',
        data: { code },
      })
      .catch((res) => {
        wx.showToast({
          title: `获取登陆凭证失败`,
          icon: 'none',
        });
        return res;
      });
    const { data, statusCode } = response;
    if (statusCode === 200 && data && data.result) {
      resolve(data.result.token);
    } else {
      reject(response);
    }
  });

const request = new mp.Request({
  baseURL,
  loginUrl: 'wxLogin',
  getToken,
  setToken,
  requestToken,
});

// 请求拦截
request.before((options) => {
  options.header = {
    'content-type': 'application/json', // 默认值
    Authorization: `Bearer ${options.token}`,
  };
  options.url += `${options.url.includes('?') ? '&' : '?'}appId=${REQUEST.appId}`;
  return options;
});

// 响应拦截
request.after((resolve, reject, response) => {
  const { statusCode, data } = response;
  if (statusCode === 200) {
    switch (data.code) {
      case CODE.SUCCESS:
        resolve(data);
        break;
      case CODE.AUTHENTICATION_FAILED:
        wx.showModal({
          title: '提示',
          content: '会话失效，请重新进入小程序',
          confirmColor: '#4685FC',
        });
        reject(data);
        break;
      default:
        const msg = data.errorMsg && typeof data.errorMsg == 'string' ? data.errorMsg : '网络错误';
        wx.showToast({
          title: msg,
          icon: 'none',
        });
        console.log(`接口错误，状态码：${statusCode}; 信息：${response}`);
        reject(data);
    }
  } else {
    console.log(`网络错误，状态码：${statusCode}; 信息：${response}`);
    wx.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none',
    });
    reject(data);
  }
});

export default request;


// api.js
import request from './request';

export const getCart = () =>
  request.post({
    url: 'cart/wx/cart/getCart',
  });

```

