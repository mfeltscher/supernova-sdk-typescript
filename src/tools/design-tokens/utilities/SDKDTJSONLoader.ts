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

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Design Tokens Plugin Manipulation Tool */
export class DTJSONLoader {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {}

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Loader

  /** Load token definitions from multiple sources */
  async loadDSObjectsFromDefinition(definition: string): Promise<Array<DTParsedNode>> {
    let data = this.parseDefinition(definition)
    return this.processDefinitionTree(data)
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


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Node Parser

  private processDefinitionTree(definition: object): Array<DTParsedNode> {
    let nodes = this.parseNode([], definition)
    return nodes
  }

  private parseNode(path: Array<string>, objects: object): Array<DTParsedNode> {
    let result: Array<DTParsedNode> = []

    for (let [name, value] of Object.entries(objects)) {
      if (typeof value === 'object') {
        if (value.hasOwnProperty('value') && value.hasOwnProperty('type')) {
          // Treat as value
          let entity = {
            rootKey: path[0], 
            name: name,
            path: path,
            type: value['type'],
            value: value['value'],
            description: value['description'] ?? null
          }
          result.push(entity)
        } else {
          // Treat as leaf
          result = result.concat(this.parseNode(path.concat(name), value))
        }
      } else {
        throw new Error('Unable to parse, unsupported structure in color node leaf')
      }
    }
    return result
  }
}
