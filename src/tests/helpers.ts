//
//  Helpers.ts
//  Supernova SDK Tests
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Supernova } from '../core/SDKSupernova'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Convenience constructors

const networkDebug = false
const debugRequestObserver = networkDebug
  ? (info: { requestUrl: string; requestMethod: string }) => {
      let message = `-- Network: Invoked ${info.requestUrl} (${info.requestMethod}ms)`
      console.log(message)
    }
  : null
let debugResponseObserver = networkDebug
  ? (info: { requestUrl: string; response: any; executionTime: number; error?: Error }) => {
    let message
    if (info.error) {
        message = `-- Network: Failure at ${info.requestUrl} (${info.executionTime}ms) \nRequest headers: ${JSON.stringify(info.response.config.headers)} \nError: ${info.error}`
    } else {
        message = `-- Network: Success at ${info.requestUrl} (${info.executionTime}ms) \nRequest headers: ${JSON.stringify(info.response.config.headers)} \nResponse headers: ${JSON.stringify(info.response.headers)} \nStatus: ${info.response.status} \nData: ${JSON.stringify(info.response?.data)?.length}b`
    }
    console.log(message)
    }
  : null

export const testInstance: Supernova = new Supernova(
  process.env.TEST_API_KEY,
  process.env.TEST_API_URL,
  null,
  debugRequestObserver,
  debugResponseObserver
)

// Don't cache resolution results for instance
testInstance.setResolutionCacheEnabled(false)
