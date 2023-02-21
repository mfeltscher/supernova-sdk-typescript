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
  computeError = "compute",
  /** Thrown when data processing failed */
  processingError = "processing"
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

  static fromSDKError(message: string) {
    
    // Error was thrown outside of the network, so reason must be provided
    return new SupernovaError(message, SupernovaErrorType.computeError)
  }

  static fromProcessingError(message: string) {
    
    // Error was thrown in the processing layer - tooling etc.
    return new SupernovaError(message, SupernovaErrorType.processingError)
  }
}