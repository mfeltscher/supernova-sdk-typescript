//
//  SDKConfiguration.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class Configuration {


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Static helpers and configuration


  /** Retrieve API URL for default target */
  static apiUrlForDefaultEnvironment(): string {
    return 'https://api.supernova.io'
  }

  /** Retrieve API version for the specific environment accesse */
  static apiVersionForDefaultEnvironment(): string {
    return "0.2"
  }
}