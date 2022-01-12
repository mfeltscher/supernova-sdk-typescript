//
//  SDKSupernovaError.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

/** Supernova SDK-specific error type */
enum SupernovaErrorType {
  /** Thrown when request was performed but server responded with error */
  responseError = "response",
  /** Thrown when request failed to perform, for example when network is unreachable */
  requestError = "request",
  /** Thrown when request was performed successfully, but SDK data validation or processing failed */
  computeError = "compute"
}


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

/** Supernova SDK-specific error. Contains useful information for debugging problems, depending where the problem originated from */
export class SupernovaError extends Error {

  /** Type of the error thrown */
  type: SupernovaErrorType

  /** Status within 2xx - 5xx range */
  status: number | null

  /** Machine-processable label error unique to each error message thrown by Supernova data server */
  label: string | null

  constructor(message: string, type: SupernovaErrorType) {
    super(message)
    this.status = null
    this.label = null
    this.type = type
  }

  static fromAxiosResponseError(response: any) {

    let error = new SupernovaError(response.data.message, SupernovaErrorType.responseError)
    error.status = response.data.code
    error.label = response.data.label
    
    // SN server responded with error so we can provide details
    return error
  }

  static fromAxiosRequestError(response: any) {

    // Request was made but there was no response, so we will notify user that server was unreachable
    let error = new SupernovaError("Data Store Unreachable. This is likely client-side problem (no internet access, blocked by proxy or similar)", SupernovaErrorType.requestError)
    error.label = "DATA_STORE_UNREACHABLE"
    return error
  }

  static fromSDKError(message: string) {
    
    // Error was thrown outside of the network, so reason must be provided
    return new SupernovaError(message, SupernovaErrorType.computeError)
  }
}