import { assign, isEmpty, mapValues, isNil, keys, omitBy } from 'lodash-es';
import fetch from 'isomorphic-fetch';
import URLSearchParams from 'url-search-params';
import { message, notification } from 'antd';
import history from 'common/history';
import replacePlaceholder from 'common/replacePlaceholder';

const navTo = history.push;

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户授权过期请重新登录。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

export class Http {
  constructor() {
    this.defaultConfig = {
      prefix: process.env.HTTP_PREFIX || '',
      errorHook: (error, url) => {
        console.error(`${error}, from: ${url}`);
        throw error;
      },
      notLoginInErrorCode: /^(1005)$/g,
      notLoginInUrl: '/login',
      parseResult: (data) => data,
      isGetParamJsonStringfy: false,
      correctErrCode: 200,
    };

    this.notLogin = () => {
      localStorage.removeItem('Authorization');
      const redirectUrl =
        window.location.origin +
        encodeURIComponent(
          `${history.location.pathname}${
            history.location.search.substr(1) ? `&${history.location.search.substr(1)}` : ''
          }`,
        );
      navTo({
        pathname: this.defaultConfig.notLoginInUrl,
        search: `?redirectUrl=${redirectUrl}`,
      });
    };

    this.request = async (lUrl, init, headers = {}, config = {}) => {
      let url = (lUrl || '').startsWith('/') ? lUrl : `/${lUrl}`;
      if (this.defaultConfig.prefix && !(url || '').startsWith(this.defaultConfig.prefix)) {
        url = `${this.defaultConfig.prefix}${url}`;
      }
      // loadingState could be false or ture or the message displaying when loading
      const defaultRequestConfig = {
        throwError: false,
        loadingState: false,
        loadingStateMessage: undefined,
      };

      const cfg = Object.assign(defaultRequestConfig, config);
      const options = assign(
        { credentials: 'include' },
        url.startsWith('http') ? { mode: 'cors' } : null,
        init,
      );
      const token = await this.getToken();
      options.headers = {
        'x-requested-with': 'XMLHttpRequest',
        Authorization: token && `Bearer  ${token}`,
        ...(options.headers || {}),
        ...(headers || {}),
      };
      try {
        let response = await fetch(url, options);
        response = await this.processResult(response);
        return response;
      } catch (error) {
        this.defaultConfig.errorHook(error, url);
        if (cfg.throwError) throw error;
        return null;
      }
    };

    this.token = null;
    this.replaceRESTfulPlaceholder = (api, data = {}) => {
      const result = replacePlaceholder(api, /:\w+/g, data);
      return {
        api: result.string,
        data: omitBy(result.data, isNil),
      };
    };
    this.fileNameFromHeader = (disposition) => {
        let result = null;
        if (disposition && /filename=.*/gi.test(disposition)) {
          result = disposition.match(/filename=.*/gi);
          return decodeURI(result[0].split('=')[1]);
        }
        return null;
      };
  }

  checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    if (response.status === 401) {
      this.notLogin();
      return response;
    }
    if (codeMessage[response.status]) {
      notification.error({
        message: codeMessage[response.status],
      });
    }
    const error = new Error(response.statusText || codeMessage[response.status]);
    error.status = response.status;
    error.data = response;
    throw error;
  }

  isFormData = (v) => {
    return Object.prototype.toString.call(v) === '[object FormData]';
  };

  checkErrCode(dataObj) {
    //   if (dataObj.code != 200)
    //   { HttpCodeCheckout(JSON.stringify(dataObj.code),dataObj.msg)

    // }
    const { code: lErrCode, data, msg } = dataObj;
    const code = !isNil(lErrCode) ? lErrCode : 200;

    if (!code || code === this.defaultConfig.correctErrCode) {
      return;
    }
    if (this.defaultConfig.notLoginInErrorCode.test(code)) {
      message.destroy();
      message.warn('登录超时了，请重新登录');
      this.notLogin();
      return;
    }

    const error = new Error(msg);
    error.code = code;
    error.data = data;

    throw error;
  }

  parseResult(data) {
    return data;
    // this.checkErrCode(data);
    // return this.defaultConfig.parseResult ? this.defaultConfig.parseResult(data) : data;
  }

  async parseJSON(response) {
    return response.json();
  }

  async processResult(response) {
    this.checkStatus(response);
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/vnd.ms-excel')) {
      return {
        fileName: this.fileNameFromHeader(response.headers.get('content-disposition')),
        datas: response.blob(),
      };
    }
    const returnResponse = await this.parseJSON(response);
    return this.parseResult(returnResponse, response.url);
  }

  /**
   * headers
   * host
   **/
  set config(config) {
    this.defaultConfig = {
      ...this.defaultConfig,
      ...config,
    };
  }

  async getToken() {
    return localStorage.getItem('Authorization');
  }

  async get(getApi, getData = {}, customeHeaders = {}, config = {}) {
    const { api, data } = this.replaceRESTfulPlaceholder(getApi, getData);
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      ...customeHeaders,
    };

    let query;
    if (isEmpty(data)) {
      query = '';
    } else if (this.defaultConfig.isGetParamJsonStringfy) {
      query = `?json=${encodeURIComponent(
        JSON.stringify(
          mapValues(data, (o) => {
            return isNil(o) ? '' : o;
          }),
        ),
      )}`;
    } else {
      // https://developer.mozilla.org/zh-CN/docs/Web/API/URLSearchParams
      const searchParams = new URLSearchParams();
      keys(data).forEach((key) => {
        searchParams.append(key, isNil(data[key]) ? '' : data[key]);
      });
      query = `?${searchParams.toString()}`;
    }
    return this.request(`${getApi}${query}`, {}, headers, config);
  }

  async post(postApi, postData = {}, customeHeaders = {}, config = {}) {
    let headers;
    if (this.isFormData(postData)) {
      headers = {
        ...customeHeaders,
      };
    } else {
      headers = {
        'Content-Type': 'application/json; charset=utf-8',
        ...customeHeaders,
      };
    }
    const formBody = this.isFormData(postData) ? postData : JSON.stringify(postData);
    return this.request(
      postApi,
      {
        method: 'POST',
        headers,
        body: formBody,
      },
      {},
      { loadingState: true, ...config },
    );
  }

  async delete(postApi, postData = {}, customeHeaders = {}, config = {}) {
    // const { api, data } = this.replaceRESTfulPlaceholder(postApi, postData);
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      ...customeHeaders,
    };
    const formBody = JSON.stringify(postData);
    return this.request(
      postApi,
      {
        method: 'DELETE',
        headers,
        body: formBody,
      },
      {},
      { loadingState: true, ...config },
    );
  }

  async put(postApi, postData = {}, customeHeaders = {}, config = {}) {
    const { api, data } = this.replaceRESTfulPlaceholder(postApi, postData);
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      ...customeHeaders,
    };
    const formBody = JSON.stringify(data);
    return this.request(
      api,
      {
        method: 'PUT',
        headers,
        body: formBody,
      },
      {},
      { loadingState: true, ...config },
    );
  }

  async form(formApi, formData, customeHeaders = {}, config = {}) {
    const { api, data } = this.replaceRESTfulPlaceholder(formApi, formData);
    const headers = {
      ...customeHeaders,
    };
    return this.request(
      api,
      {
        method: 'POST',
        headers,
        body: data,
      },
      {},
      config,
    );
  }
}

const http = new Http();

export default http;
