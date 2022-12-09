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

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Design Tokens Plugin Manipulation Tool */
export class DTJSONParser {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  themeBuffer: Array<DTParsedTheme>

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {
    this.themeBuffer = new Array<DTParsedTheme>()
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Data Parser

  async processPluginDataRepresentation(definition: object): Promise<{
    nodes: Array<DTParsedNode>
    themes: Array<DTParsedTheme>
    sets: Array<DTParsedTokenSet>  
  }> {
    let sets = this.processSets(definition)
    let nodes = this.parseNode([], definition, sets)
    let themes = this.processThemes(definition, sets)

    let setArray = Array.from(sets.values())

    console.log(`----- Loaded token data:`)
    console.log(`Nodes: ${nodes.length}`)
    console.log(
      `Sets: ${setArray.length}, ${setArray.map(s => `\n | ${s.name}: ${s.contains.length} nodes`)}`
    )
    console.log(
      `Themes: ${themes.length}, ${themes.map(
        t =>
          `\n | ${t.name}: ${
            t.selectedTokenSets.filter(s => s.priority !== DTParsedThemeSetPriority.disabled).length
          } sets`
      )}`
    )

    return {
      nodes: nodes,
      sets: Array.from(sets.values()),
      themes: themes
    }
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Theme Parser

  private processThemes(definition: object, tokenSets: Map<string, DTParsedTokenSet>): Array<DTParsedTheme> {

    let themes: Array<DTParsedTheme> = new Array<DTParsedTheme>()
    let order: Array<string> = []

    // Find metadata
    let metadata = definition["$metadata"]
    if (metadata) {
      let setOrder = metadata["tokenSetOrder"]
      if (setOrder) {
        order = setOrder
      }
    }

    let themeDefinitions = definition["$themes"]// Parse each theme separately
    if (themeDefinitions) {
      for (let themeObject of themeDefinitions) {
        let name = themeObject["name"]
        let id = themeObject["id"]
        let selectedTokenSets = themeObject["selectedTokenSets"]
        if (!name || !id || !selectedTokenSets) {
          // Skip execution of this theme as it doesn't have correct information provided
          throw new Error("Incorrect theme data structure, missing one of required attributes [name, id, selectedTokenSets]")
        }

        // Process token sets
        let pairedSets = new Array<any>()
        for (let [tokenSetName, unknownPriority] of Object.entries(selectedTokenSets)) {
          let setName = tokenSetName
          let setPriority = unknownPriority
          let fetchedSet = tokenSets.get(setName)
          let pair: DTParsedThemeSetPriorityPair = {
            priority: setPriority as DTParsedThemeSetPriority,
            set: fetchedSet
          }
          pairedSets.push(pair)
        }

        let theme: DTParsedTheme = {
          selectedTokenSets: pairedSets,
          name: name,
          id: id
        }
        themes.push(theme)
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