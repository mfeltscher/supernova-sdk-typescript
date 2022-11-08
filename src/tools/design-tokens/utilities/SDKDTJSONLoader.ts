//
//  SDKDTJSONLoader.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { TokenGroup } from '../../..'
import { SupernovaError } from '../../../core/errors/SDKSupernovaError'
import { DTProcessedTokenNode } from './SDKDTJSONConverter'
import * as fs from 'fs'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

export type DTParsedNode = {
  rootKey: string
  name: string
  path: Array<string>
  type: string
  value: any
  description: string | null
}

export type DTParsedTokenSet = {
  name: string
  id: string
  contains: Array<DTParsedNode>
}

export type DTParsedTheme = {
  name: string
  id: string
  selectedTokenSets: Array<DTParsedThemeSetPriorityPair>
}

export type DTParsedThemeSetPriorityPair = {
  set: DTParsedTokenSet
  priority: DTParsedThemeSetPriority
}

export enum DTParsedThemeSetPriority {
  source = 'source',
  enabled = 'enabled',
  disabled = 'disabled'
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Design Tokens Plugin Manipulation Tool */
export class DTJSONLoader {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  themeBuffer: Array<DTParsedTheme>

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {
    this.themeBuffer = new Array<DTParsedTheme>()
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Loader

  /** Load token definitions from path */
  async loadDSObjectsFromTokenFile(pathToFile: string): Promise<object> {
    try {
      let definition = fs.readFileSync(pathToFile, 'utf8')
      let parsedDefinition = this.parseDefinition(definition)
      return parsedDefinition
    } catch (error) {
      throw SupernovaError.fromProcessingError('Unable to load JSON definition file: ' + error)
    }
  }

  async loadDSObjectsFromTokenFileDirectory(pathToDirectory: string): Promise<object> {
    try {
      let fullStructuredObject = {}

      // Read all files in the path
      let paths = fs
        .readdirSync(pathToDirectory, { withFileTypes: true })
        .filter(item => !item.isDirectory())
        .map(item => item.name)
      for (let path of paths) {
        // Load every JSON there is, and add it to the resulting structured object
        let fullPath = pathToDirectory + '/' + path
        if (fullPath.endsWith('json') && path !== 'supernova.settings.json' && !path.includes('$')) {
          let result = await this.loadDSObjectsFromTokenFile(fullPath)
          if (typeof result === 'object') {
            fullStructuredObject[path.substring(0, path.length - 5)] = result
          }
        }
      }

      // Try to load themes, if any
      let themePath = pathToDirectory + '/' + "$themes.json"
      if (fs.existsSync(themePath)) {
        let themes = await this.loadDSObjectsFromTokenFile(themePath)
        fullStructuredObject["$themes"] = themes
      }

      // Try to load metadata, if any
      let metadataPath = pathToDirectory + '/' + "$metadata.json"
      if (fs.existsSync(metadataPath)) {
        let metadata = await this.loadDSObjectsFromTokenFile(themePath)
        fullStructuredObject["$metadata"] = metadata
      }
      
      return fullStructuredObject
    } catch (error) {
      throw SupernovaError.fromProcessingError('Unable to load JSON definition file: ' + error)
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - File Parser

  private parseDefinition(definition: string): object {
    try {
      let object = JSON.parse(definition)
      if (typeof object !== 'object') {
        throw SupernovaError.fromProcessingError(
          'Invalid token definition JSON file - root level entity must be object'
        )
      }
      return object
    } catch (error) {
      throw SupernovaError.fromProcessingError('Invalid token definition JSON file - file structure invalid')
    }
  }
}
