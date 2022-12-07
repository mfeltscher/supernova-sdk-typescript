//
//  SDKDataBridge.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import axios, { AxiosRequestConfig, Method } from 'axios'
import { request } from 'http'
import { SupernovaError } from '../errors/SDKSupernovaError'
import { DataCore } from './SDKDataCore'

type DataBridgeRequestHookResult = { skipDefaultAuth?: boolean }
export type DataBridgeRequestHook = (
  request: AxiosRequestConfig
) => void | DataBridgeRequestHookResult | Promise<void | DataBridgeRequestHookResult>

export type DebugResponseObserver = (info: {
  requestUrl: string
  response: any
  executionTime: number
  error?: Error
}) => void

export type DebugRequestObserver = (info: { requestUrl: string; requestMethod: string }) => void

export interface DataBridgeConfiguration {
  apiUrl: string
  apiVersion: string
  accessToken: string
  target: string | null
  cache: boolean
  requestHook: DataBridgeRequestHook | null
  debugRequestObserver?: DebugRequestObserver | null
  debugResponseObserver?: DebugResponseObserver | null
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

let axiosInterceptorSet = false

export class DataBridge {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Configuration

  authToken: string
  cache: boolean
  dataCore: DataCore
  apiUrl: string
  apiVersion: string
  target: string | null

  requestHook: DataBridgeRequestHook | null
  debugRequestObserver: DebugRequestObserver | null
  debugResponseObserver: DebugResponseObserver | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(conf: DataBridgeConfiguration) {
    this.cache = conf.cache
    this.authToken = conf.accessToken
    this.apiUrl = conf.apiUrl
    this.apiVersion = conf.apiVersion
    this.target = conf.target
    this.requestHook = conf.requestHook
    this.debugRequestObserver = conf.debugRequestObserver ?? null
    this.debugResponseObserver = conf.debugResponseObserver ?? null

    // Add performance interceptors once
    if (!axiosInterceptorSet) {
      axios.interceptors.request.use(r => {
        let c: any = r
        c.meta = c.meta || {}
        c.meta.requestStartedAt = new Date().getTime()
        return r
      })

      const responseObserver = this.debugResponseObserver

      axios.interceptors.response.use(
        successResponse => {
          if (responseObserver) {
            let timing = new Date().getTime() - (successResponse.config as any).meta.requestStartedAt
            let url = successResponse.config.url
            responseObserver({
              requestUrl: url,
              response: successResponse,
              executionTime: timing,
              error: null
            })
          }
          return successResponse
        },
        // Handle 4xx & 5xx responses
        errorResponse => {
          if (responseObserver) {
            let timing = new Date().getTime() - (errorResponse.config as any).meta.requestStartedAt
            let url = errorResponse.config.url
            responseObserver({
              requestUrl: url,
              response: errorResponse,
              executionTime: timing,
              error: errorResponse
            })
          }
          throw errorResponse
        }
      )

      axiosInterceptorSet = true
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Authenticated data fetching

  async getDSMGenericDataFromEndpoint(endpoint: string): Promise<any> {
    let url = `${this.dsGenericRequestURL()}/${endpoint}`
    return this.getDataForAuthenticatedEndpoint(url)
  }

  async getDSMDataFromEndpoint(designSystemId: string, designSystemVersionId: string, endpoint: string): Promise<any> {
    let url = `${this.dsDataRequestURL(designSystemId, designSystemVersionId)}/${endpoint}`
    return this.getDataForAuthenticatedEndpoint(url)
  }

  private async buildRequestConfig(url: string, method: Method, data?: any) {
    const config: AxiosRequestConfig = {
      url,
      method,
      timeout: 120000,
      headers: {}
    }
    if (data) {
      config.data = data
    }

    let skipAuth = false
    if (this.requestHook) {
      const hookResult = await this.requestHook(config)
      if (hookResult && hookResult.skipDefaultAuth) {
        skipAuth = true
      }
    }
    if (!skipAuth) {
      const token = this.authToken
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  }

  private async getDataForAuthenticatedEndpoint(requestURL: string): Promise<any> {

    const method = 'GET'
    const config = await this.buildRequestConfig(requestURL, method)
    if (this.debugRequestObserver) {
      this.debugRequestObserver({
        requestUrl: requestURL,
        requestMethod: method
      })
    }
    // Make authorized ds request
    return new Promise((resolve, reject) => {
      // Fetch the data
      try {
        axios
          .request(config)
          .then(result => {

            // Filter the data from the API, if needed (if we only need a certain part of the retrieved tree)
            let data = result.data.result

            // Map the data
            resolve(data)
          })
          .catch(error => {
            // Throw different error based on the type of recieved response
            if (error.response) {
              reject(SupernovaError.fromAxiosResponseError(error.response))
            } else if (error.request) {
              reject(SupernovaError.fromAxiosRequestError(error.request))
            } else {
              reject(SupernovaError.fromSDKError(error.message))
            }
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  async postDSMDataToEndpoint(
    designSystemId: string,
    designSystemVersionId: string,
    endpoint: string,
    data: any,
    put: boolean = false
  ): Promise<any> {
    let url = `${this.dsDataRequestURL(designSystemId, designSystemVersionId)}/${endpoint}`
    return this.postDataForAuthenticatedEndpoint(url, data, put)
  }

  async postDSMDataToGenericEndpoint(endpoint: string, data: any, put: boolean = false): Promise<any> {
    let url = `${this.dsGenericRequestURL()}/${endpoint}`
    return this.postDataForAuthenticatedEndpoint(url, data, put)
  }

  private async postDataForAuthenticatedEndpoint(requestURL: string, data: any, put: boolean = false): Promise<any> {
    const method = put ? 'PUT' : 'POST'
    const config = await this.buildRequestConfig(requestURL, method, data)
    if (this.debugRequestObserver) {
      this.debugRequestObserver({
        requestUrl: requestURL,
        requestMethod: method
      })
    }

    // Make authorized ds request
    return new Promise((resolve, reject) => {
      // Fetch the data
      axios
        .request(config)
        .then(result => {
          // Filter the data from the API, if needed (if we only need a certain part of the retrieved tree)
          let data = result.data.result

          // Map the data
          resolve(data)
        })
        .catch(error => {
          // Throw different error based on the type of recieved response
          if (error.response) {
            reject(SupernovaError.fromAxiosResponseError(error.response))
          } else if (error.request) {
            reject(SupernovaError.fromAxiosRequestError(error.request))
          } else {
            reject(SupernovaError.fromSDKError(error.message))
          }
        })
    })
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - URL construction

  dsGenericRequestURL(): string {
    return `${this.apiUrl}`
  }

  dsWorkspaceRequestURL(wsId: string): string {
    return `${this.apiUrl}/workspaces/${wsId}`
  }

  dsDataRequestURL(dsId: string, dsVersionId: string): string {
    return `${this.apiUrl}/design-systems/${dsId}/versions/${dsVersionId}`
  }

  dsMetadataRequestURL(dsId: string): string {
    return `${this.apiUrl}/design-systems/${dsId}`
  }

  dsVersionRequestURL(dsId: string): string {
    return `${this.apiUrl}/design-systems/${dsId}/versions`
  }
}
