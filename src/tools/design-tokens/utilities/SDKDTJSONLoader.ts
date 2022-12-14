//
//  SDKDTJSONLoader.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { SupernovaError } from '../../../core/errors/SDKSupernovaError'
import * as fs from 'fs'
import * as path from 'path'

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
      if (!(fs.existsSync(pathToFile) && fs.lstatSync(pathToFile).isFile())) {
        throw SupernovaError.fromProcessingError(
          `Provided token file directory ${pathToFile} is not a file or doesn't exist`
        )
      }

      let definition = fs.readFileSync(pathToFile, 'utf8')
      let parsedDefinition = this.parseDefinition(definition)
      return parsedDefinition
    } catch (error) {
      throw SupernovaError.fromProcessingError('Unable to load JSON definition file: ' + error)
    }
  }

  async loadDSObjectsFromTokenFileDirectory(pathToDirectory: string, settingsPath: string): Promise<object> {
    try {
      let fullStructuredObject = {}

      if (!(fs.existsSync(pathToDirectory) && fs.lstatSync(pathToDirectory).isDirectory())) {
        throw SupernovaError.fromProcessingError(
          `Provided data directory ${pathToDirectory} is not a directory or doesn't exist`
        )
      }

      let jsonPaths = this.getAllJSONFiles(pathToDirectory)
      for (let path of jsonPaths) {
        if (path.endsWith('json') && path !== settingsPath && !path.includes('$')) {
          let result = await this.loadDSObjectsFromTokenFile(path)
          if (typeof result === 'object') {
            // let name = this.getFileNameWithoutExtension(path)
            let name = this.getSetKey(path, pathToDirectory)
            fullStructuredObject[name] = result
          }
        }
      }

      // Try to load themes, if any
      let themePath = pathToDirectory + '/' + '$themes.json'
      if (fs.existsSync(themePath)) {
        let themes = await this.loadDSObjectsFromTokenFile(themePath)
        fullStructuredObject['$themes'] = themes
      }

      // Try to load metadata, if any
      let metadataPath = pathToDirectory + '/' + '$metadata.json'
      if (fs.existsSync(metadataPath)) {
        let metadata = await this.loadDSObjectsFromTokenFile(themePath)
        fullStructuredObject['$metadata'] = metadata
      }

      return fullStructuredObject
    } catch (error) {
      throw SupernovaError.fromProcessingError('Unable to load JSON definition file: ' + error)
    }
  }

  getAllJSONFiles(dir: string): string[] {
    const files = fs.readdirSync(dir)
    const jsonFiles = []

    for (const file of files) {
      const filePath = `${dir}/${file}`
      const fileStat = fs.statSync(filePath)

      if (fileStat.isDirectory()) {
        jsonFiles.push(...this.getAllJSONFiles(filePath))
      } else if (fileStat.isFile() && filePath.endsWith('.json')) {
        jsonFiles.push(filePath)
      }
    }

    return jsonFiles
  }

  getFileNameWithoutExtension(filePath: string): string {
    const fileStat = fs.statSync(filePath)

    if (!fileStat.isFile()) {
      throw new Error(`${filePath} is not a file`)
    }

    return path.basename(filePath, path.extname(filePath))
  }

  getSetKey(jsonFilePath: string, loadedDirectory: string): string {

    return jsonFilePath.substring(loadedDirectory.length + 1, jsonFilePath.length - 5)
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
