//
//  SDKDataBridge.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DataCore } from './SDKDataCore'
import remoteFetch from 'node-fetch';
const fetch = remoteFetch;

type DataBridgeRequestHookResult = { skipDefaultAuth?: boolean }
export type DataBridgeRequestHook = (
  request: any
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

  private async buildRequestConfig(url: string, method: "GET" | "POST" | "PUT" | "DELETE", data?: any) {
    const config = {
      url,
      method,
      timeout: 120000,
      headers: {
        "Content-Type": 'application/json'
      },
      body: undefined
    }
    if (data) {
      config.body = data
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
        fetch(requestURL, {
          method: 'GET',
          headers: config.headers
        }).then(async response => {
          if (!response.ok) {
            let errorResponse = await response.json()
            if (errorResponse) {
              throw new Error(JSON.stringify(errorResponse))
            } else {
              throw new Error(response)
            }
          }
          return response.json()
        }).then((jsonResponse) => {
          resolve(jsonResponse)
        }).catch(error => {
          reject(error)
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
      try {
        fetch(requestURL, {
          mode: 'cors',
          method: method,
          headers: config.headers,
          body: JSON.stringify(config.body)
        }).then(async response => {
          if (!response.ok) {
            let errorResponse = await response.json()
            if (errorResponse) {
              throw new Error(JSON.stringify(errorResponse))
            } else {
              throw new Error(response)
            }
          }
          return response.json()
        }).then((jsonResponse) => {
          resolve(jsonResponse)
        }).catch(error => {
          reject(error)
        })
      } catch (error) {
        reject(error)
      }
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
