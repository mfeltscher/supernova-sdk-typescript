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
import * as fs from 'fs'

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
  }

  weakValidateMapping(mapping: DTPluginToSupernovaMappingFile) {
    if (
      !mapping.hasOwnProperty('mode') ||
      typeof mapping.mode !== 'string' ||
      (mapping.mode !== 'multi-file' && mapping.mode !== 'single-file')
    ) {
      throw SupernovaError.fromProcessingError(
        'Unable to load mapping file: `mode` must be provided [single-file or multi-file]`'
      )
    }
    if (!mapping.mapping || !(mapping.mapping instanceof Array)) {
      throw SupernovaError.fromProcessingError('Unable to load mapping file: `mapping` key must be present and array.')
    }
    let mapPack = mapping.mapping
    for (let map of mapPack) {
      if (typeof map !== 'object') {
        throw SupernovaError.fromProcessingError('Unable to load mapping file: `mapping` must contain objects only')
      }
      if (!map.tokenSets && !map.tokensTheme) {
        throw SupernovaError.fromProcessingError(
          'Unable to load mapping file: `mapping` must contain either `tokensTheme` or `tokenSets`'
        )
      }
      if (map.tokenSets && map.tokensTheme) {
        throw SupernovaError.fromProcessingError(
          'Unable to load mapping file: `mapping` must not contain both `tokensTheme` or `tokenSets`'
        )
      }
      if (map.tokenSets && (!(map.tokenSets instanceof Array) || (map.tokenSets as Array<any>).length === 0)) {
        throw SupernovaError.fromProcessingError(
          'Unable to load mapping file: `mapping`.`tokenSets` must be an Array with at least one entry'
        )
      }
      if (map.tokensTheme && (typeof map.tokensTheme !== 'string' || (map.tokensTheme as string).length === 0)) {
        throw SupernovaError.fromProcessingError(
          'Unable to load mapping file: `mapping`.`tokensTheme` must be a non-empty string'
        )
      }
      if (!map.supernovaBrand || typeof map.supernovaBrand !== 'string' || map.supernovaBrand.length === 0) {
        throw SupernovaError.fromProcessingError(
          'Unable to load mapping file: `supernovaBrand` must be a non-empty string'
        )
      }
      if (map.supernovaTheme && (typeof map.supernovaTheme !== 'string' || map.supernovaTheme.length === 0)) {
        throw SupernovaError.fromProcessingError(
          'Unable to load mapping file: `supernovaTheme` may be empty but must be non-empty string if not'
        )
      }
    }

    if (mapping.settings) {
      if (typeof mapping.settings !== 'object') {
        throw SupernovaError.fromProcessingError('Unable to load mapping file: `settings` must be an object')
      }
      if (mapping.settings.hasOwnProperty('dryRun') && typeof mapping.settings.dryRun !== 'boolean') {
        throw SupernovaError.fromProcessingError('Unable to load mapping file: `dryRun` must be of boolan type')
      }
      if (mapping.settings.hasOwnProperty('verbose') && typeof mapping.settings.verbose !== 'boolean') {
        throw SupernovaError.fromProcessingError('Unable to load mapping file: `verbose` must be of boolan type')
      }
      if (mapping.settings.hasOwnProperty('preciseCopy') && typeof mapping.settings.preciseCopy !== 'boolean') {
        throw SupernovaError.fromProcessingError('Unable to load mapping file: `preciseCopy` must be of boolan type')
      }
    }
  }

  processFileToMapping(
    mapping: DTPluginToSupernovaMappingFile
  ): {
    mapping: DTPluginToSupernovaMapPack
    settings: DTPluginToSupernovaSettings
  } {
    let result = new Array<DTPluginToSupernovaMap>()
    for (let map of mapping.mapping) {
      result.push({
        type: map.tokenSets ? DTPluginToSupernovaMapType.set : DTPluginToSupernovaMapType.theme,
        pluginSets: map.tokenSets,
        pluginTheme: map.tokensTheme ?? null,
        bindToBrand: map.supernovaBrand,
        bindToTheme: map.supernovaTheme ?? null,
        nodes: null,
        processedNodes: null,
        processedGroups: null
      })
    }

    let settings: DTPluginToSupernovaSettings = {
      dryRun: mapping.settings?.dryRun ?? false,
      verbose: mapping.settings?.verbose ?? false,
      preciseCopy: mapping.settings?.verbose ?? false
    }

    return {
      mapping: result,
      settings: settings
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - File Parser

  private parseDefinition(definition: string): object {
    try {
      let object = JSON.parse(definition)
      if (typeof object !== 'object') {
        throw SupernovaError.fromProcessingError(
          'Invalid Supernova mapping definition JSON file - root level entity must be object'
        )
      }
      return object
    } catch (error) {
      throw SupernovaError.fromProcessingError(
        'Invalid Supernova mapping definition JSON file - file structure invalid'
      )
    }
  }
}
