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
import { SupernovaError } from '../../../core/errors/SDKSupernovaError'
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

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Utility to load token maps */
export class DTMapLoader {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {}

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Mapping Conversion

  /*
  loadFromPath(
    pathToFile: string
  ): {
    mapping: DTPluginToSupernovaMapPack
    settings: DTPluginToSupernovaSettings
  } {
    try {
      if (!(fs.existsSync(pathToFile) && fs.lstatSync(pathToFile).isFile())) {
        throw SupernovaError.fromProcessingError(
          `Provided configuration file directory ${pathToFile} is not a file or doesn't exist`
        )
      }

      let definition = fs.readFileSync(pathToFile, 'utf8')
      let parsedDefinition = this.parseDefinition(definition) as DTPluginToSupernovaMappingFile
      this.weakValidateMapping(parsedDefinition)
      return this.processFileToMapping(parsedDefinition)
    } catch (error) {
      throw SupernovaError.fromProcessingError('Unable to load JSON definition file: ' + error)
    }
  }*/

}
