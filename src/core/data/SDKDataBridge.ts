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
import { SupernovaError } from '../errors/SDKSupernovaError'
import { DataCore } from './SDKDataCore'

type DataBridgeRequestHookResult = { skipDefaultAuth?: boolean };
export type DataBridgeRequestHook = (request: AxiosRequestConfig) => void | DataBridgeRequestHookResult | Promise<void | DataBridgeRequestHookResult>

export interface DataBridgeConfiguration {
  apiUrl: string
  apiVersion: string
  accessToken: string
  target: string | null
  cache: boolean
  requestHook: DataBridgeRequestHook | null
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
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(conf: DataBridgeConfiguration) {
    this.cache = conf.cache
    this.authToken = conf.accessToken
    this.apiUrl = conf.apiUrl
    this.apiVersion = conf.apiVersion
    this.target = conf.target
    this.requestHook = conf.requestHook
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
      const hookResult = await this.requestHook(config);
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
    const config = await this.buildRequestConfig(requestURL, 'GET')

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

  private async postDataForAuthenticatedEndpoint(requestURL: string, data: any, put: boolean = false): Promise<any> {
    const config = await this.buildRequestConfig(requestURL, put ? 'PUT' : 'POST', data)

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
