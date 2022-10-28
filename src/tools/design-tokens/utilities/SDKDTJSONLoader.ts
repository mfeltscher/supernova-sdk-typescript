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
import { DTProcessedTokenSet } from './SDKDTTokenSetResolver'
// import fs from "fs"

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
  name: string,
  id: string,
  contains: Array<DTParsedNode>
}

export type DTParsedTheme = {
  name: string,
  id: string,
  selectedTokenSets: Array<DTParsedThemeSetPriorityPair>
}

export type DTParsedThemeSetPriorityPair = {
  set: DTParsedTokenSet,
  priority: DTParsedThemeSetPriority
}

export enum DTParsedThemeSetPriority {
  source = "source",
  enabled = "enabled",
  disabled = "disabled"
}

export type DTPluginToSupernovaMap = {
  type: DTPluginToSupernovaMapType,
  pluginSet: string | null,
  pluginTheme: string | null,
  bindToBrand: string,
  bindToTheme: string | null // If not provided, will be default

  nodes: Array<DTParsedNode> | null // This will be added when map is resolved
  processedNodes: Array<DTProcessedTokenNode> | null // This will be added when nodes are processed
  processedGroups: Array<TokenGroup> | null // This will be added when groups are created
}

export type DTPluginToSupernovaMapPack = Array<DTPluginToSupernovaMap>

export enum DTPluginToSupernovaMapType {
  theme = "theme",
  set = "set"
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

  /** Load token definitions from string */
  loadDSObjectsFromDefinition(definition: string): {
    nodes: Array<DTParsedNode>
    themes: Array<DTParsedTheme>
    sets: Array<DTParsedTokenSet>  
  } {
    let data = this.parseDefinition(definition)
    return this.processDefinitionTree(data)
  }

  /** Load token definitions from object */
  loadDSObjectsFromObject(object: object): {
    nodes: Array<DTParsedNode>
    themes: Array<DTParsedTheme>
    sets: Array<DTParsedTokenSet>  
  } {
    return this.processDefinitionTree(object)
  }

  /** Load token definitions from path */
  /*
  async loadDSObjectsFromPath(path: string): Promise<Array<DTParsedNode>> {

    try {
      let definition = fs.readFileSync(path, "utf8") 
      return this.loadDSObjectsFromDefinition(definition)
    } catch (error) {
      throw SupernovaError.fromProcessingError(
        'Unable to load JSON definition file: ' + error
      )
    }
  }*/

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


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Theme Parser

  private processThemes(definition: object, tokenSets: Map<string, DTParsedTokenSet>): Array<DTParsedTheme> {

    let themes: Array<DTParsedTheme> = new Array<DTParsedTheme>()

    // Seek theme definition object
    for (let [highLevelKey, value] of Object.entries(definition)) {
      if (highLevelKey === "$themes") {
        // Parse each theme separately
        for (let [iterator, themeObject] of Object.entries(value)) {
          let name = themeObject["name"]?.value
          let id = themeObject["id"]?.value
          let sets = themeObject["selectedTokenSets"]
          if (!name || !id || !sets) {
            // Skip execution of this theme as it doesn't have correct information provided
            throw new Error("Incorrect theme data structure, missing one of required attributes [name, id, selectedTokenSets]")
          }

          // Process token sets
          let pairedSets = new Array<DTParsedThemeSetPriorityPair>()
          for (let [tokenSetName, tokenValuePair] of Object.entries(sets)) {
            let tokenSetPriority = tokenValuePair["value"]
            if (!tokenSetPriority) {
              throw new Error("Incorrect theme data structure, token set priority required to be provided")
            }

            // Get token set from existing ones. Not finding one is critical error
            let tokenSet = tokenSets.get(tokenSetName)
            if (!tokenSet) {
              throw new Error("Can't find token set referenced by the theme engine")
            }

            pairedSets.push({
              set: tokenSet,
              priority: tokenSetPriority
            })
          }

          let theme: DTParsedTheme = {
            selectedTokenSets: pairedSets,
            name: name,
            id: id
          }
          themes.push(theme)
        }

        // Found it, skip the rest
        break
      }
    }

    return themes
  }


  private processSets(definition: object): Map<string, DTParsedTokenSet> {

    let sets = new Map<string, DTParsedTokenSet>()

    // Parse top level objects as sets, unless they contain $
    // Value is ignored, as that is parsed separately
    for (let [setName, value] of Object.entries(definition)) {
      if (!setName.startsWith("$")) {
        let set: DTParsedTokenSet = {
          contains: [],
          name: setName,
          id: setName 
        }
        sets.set(setName, set)
      }
    }

    return sets
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Node Parser

  private processDefinitionTree(definition: object): {
    nodes: Array<DTParsedNode>
    themes: Array<DTParsedTheme>
    sets: Array<DTParsedTokenSet>  
  } {
    let sets = this.processSets(definition)
    let nodes = this.parseNode([], definition, sets)
    let themes = this.processThemes(definition, sets)
    return {
      nodes: nodes,
      sets: Array.from(sets.values()),
      themes: themes
    }
  }

  private parseNode(path: Array<string>, objects: object, sets: Map<string, DTParsedTokenSet>): Array<DTParsedNode> {
    let result: Array<DTParsedNode> = []
    for (let [name, value] of Object.entries(objects)) {
      if (typeof value === 'object') {
        if (name.startsWith("$")) {
          // Skipping keys internal to design token plugin because we are currently not using them
        } else if (value.hasOwnProperty('value') && value.hasOwnProperty('type')) {
          // Treat as value
          let entity = {
            rootKey: path[0], 
            name: name,
            path: path,
            type: value['type'],
            value: value['value'],
            description: value['description'] ?? null
          }
          let set = sets.get(entity.rootKey)
          if (!set) {
            throw new Error('Node references unknown set')
          }
          set.contains.push(entity)
          result.push(entity)
        } else {
          // Treat as leaf
          result = result.concat(this.parseNode(path.concat(name), value, sets))
        }
      } else {
        throw new Error('Unable to parse, unsupported structure in token node leaf')
      }
    }
    
    return result
  }
}
