//
//  VersionWriter.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2023 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignSystemVersion } from '..'
import { DataCore } from './data/SDKDataCore'
import { Supernova } from './SDKSupernova'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class VersionWriter {
  // --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  /** Internal: Associated version */
  version: DesignSystemVersion

  /** Internal: Engine */
  engine: Supernova

  /** Internal: Data core */
  dataCore: DataCore

  // --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(engine: Supernova, version: DesignSystemVersion) {
    this.engine = engine
    this.dataCore = version.dataCore
    this.version = version
  }

  // --- --- --- --- --- --- --- --- --- ---
  // MARK: - Methods

  /** Write data for Token Studio */
  async writeTokenStudioData(data: object): Promise<boolean> {
    await this.dataCore.writeTokenStudioJSONData(this.version.designSystem.id, this.version, data)
    return true
  }
}
