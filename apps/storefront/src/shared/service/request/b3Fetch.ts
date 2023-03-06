import {
  b3Fetch,
} from './fetch'
import {
  B2B_BASIC_URL,
  RequestType,
  queryParse,
} from './base'

import {
  B3SStorage,
  getCookie,
} from '@/utils'

import {
  bcBaseUrl,
} from '@/utils/basicConfig'

// /**
//  * config User-defined configuration items
//  * @param withoutCheck Do not use the default interface status verification, directly return response
//  * @param returnOrigin Whether to return the entire Response object, false only response.data
//  * @param showError Whether to use a unified error reporting method for global errors
//  * @param canEmpty Whether the transport parameter can be null
//  * @param timeout Interface request timeout duration. The default value is 10 seconds
//  */

//  interface configDefaultProps {
//   showError: Boolean,
//   canEmpty: Boolean,
//   returnOrigin: Boolean,
//   withoutCheck: Boolean,
//   timeout: Number,
// }

// interface ConfigValProps {
//   [key:string]: any
// }

// type ConfigProps = undefined | ConfigValProps

// const configDefault: configDefaultProps = {
//   showError: true,
//   canEmpty: false,
//   returnOrigin: false,
//   withoutCheck: false,
//   timeout: 10000,
// }

interface Config{
  headers?: {
    [key: string]: string
  }
}

function request<T>(path: string, config?: T & Config, type?: string) {
  const url = RequestType.B2BRest === type ? `${B2B_BASIC_URL}${path}` : path
  const getToken = type === RequestType.BCRest ? {
    'x-xsrf-token': getCookie('XSRF-TOKEN'),
  } : {
    authToken: `${B3SStorage.get('B3B2BToken') || ''}`,
  }

  const {
    headers = {
      'content-type': 'application/json',
    },
  } = config || {}

  const init = {
    ...config,
    headers: {
      ...headers,
      ...getToken,
    },
  }
  return b3Fetch(url, init, type)
}

function graphqlRequest<T, Y>(type: string, data: T, config?: Y, customMessage = false) {
  const init = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...config,
    },
    body: JSON.stringify(data),
  }

  const graphqlB2BUrl = `${B2B_BASIC_URL}/graphql`

  const url = type === RequestType.B2BGraphql ? graphqlB2BUrl : `${bcBaseUrl}/graphql`
  return b3Fetch(url, init, type, customMessage)
}

export const B3Request = {
  graphqlB2B: function post<T>(data: T, customMessage = false): Promise<any> {
    const config = {
      Authorization: `Bearer  ${B3SStorage.get('B3B2BToken') || ''}`,
    }
    return graphqlRequest(RequestType.B2BGraphql, data, config, customMessage)
  },
  graphqlProxyBC: function post<T>(data: T): Promise<any> {
    const config = {
      Authorization: `Bearer  ${B3SStorage.get('bc_jwt_token') || ''}`,
    }
    return graphqlRequest(RequestType.B2BGraphql, data, config)
  },
  graphqlBC: function post<T>(data: T): Promise<any> {
    const config = {
      Authorization: `Bearer  ${B3SStorage.get('BcToken') || ''}`,
    }
    return graphqlRequest(RequestType.BCGraphql, data, config)
  },
  get: function get<T, Y>(url: string, type: string, data?: T, config?: Y): Promise<any> {
    if (data) {
      const params = queryParse(data)
      return request(`${url}?${params}`, {
        method: 'GET',
        ...config,
      })
    }
    return request(url, {
      method: 'GET',
    }, type)
  },
  post: function post<T>(url: string, type: string, data: T): Promise<any> {
    return request(url, {
      body: JSON.stringify(data),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    }, type)
  },
  put: function put<T>(url: string, type: string, data: T): Promise<any> {
    return request(url, {
      body: JSON.stringify(data),
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
    }, type)
  },
  delete: function deleteFn<T, Y>(url: string, type: string): Promise<any> {
    return request(url, {
      method: 'DELETE',
    }, type)
  },
  fileUpload: function fileUpload<T, Y>(url: string, formData: T, config?: Y): Promise<any> {
    return request(`${B2B_BASIC_URL}${url}`, {
      method: 'POST',
      body: formData,
      headers: {},
      ...config,
    })
  },
}
