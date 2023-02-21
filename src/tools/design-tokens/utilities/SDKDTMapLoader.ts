//
//  SDKDTMapLoader.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { TokenGroup } from '../../..'
import { DTProcessedTokenNode } from './SDKDTJSONConverter'
import { DTParsedNode } from './SDKDTJSONLoader'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export type DTPluginToSupernovaMapPack = Array<DTPluginToSupernovaMap>
export enum DTPluginToSupernovaMapType {
  theme = 'theme',
  set = 'set'
}

export type DTPluginToSupernovaMap = {
  type: DTPluginToSupernovaMapType
  pluginSets: Array<string> | null
  pluginTheme: string | null
  bindToBrand: string
  bindToTheme: string | null // If not provided, will be default

  nodes: Array<DTParsedNode> | null // This will be added when map is resolved
  processedNodes: Array<DTProcessedTokenNode> | null // This will be added when nodes are processed
  processedGroups: Array<TokenGroup> | null // This will be added when groups are created
}

export type DTPluginToSupernovaMappingFile = {
  mode: 'single-file' | 'multi-file'
  mapping: [
    {
      tokensTheme?: string
      tokenSets?: Array<string>
      supernovaBrand: string
      supernovaTheme?: string
    }
  ]
  settings?: {
    verbose?: boolean
    dryRun?: boolean
    preciseCopy?: boolean
  }
}

export type DTPluginToSupernovaSettings = {
  verbose: boolean
  dryRun: boolean
  preciseCopy: boolean
}
