//
//  SDKToolsTokenSync.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Jan Six parser */
export class SupernovaToolsDesignTokensPluginConverter {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {
    
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public interface

  /** Synchronize token pack */
  parseDesignTokensDefinitionJSON(definition: string) : Array<{
    name: string,
    path: Array<string>,
    color: string
  }> {

    let parsedObject = JSON.parse(definition)
    let colorNodes = this.parseColorNode([], parsedObject["colors"])
    return colorNodes
  } 

  parseColorNode(path: Array<string>, objects: object): Array<{
    name: string,
    path: Array<string>,
    color: string
  }> {

    let result: Array<{
      name: string,
      path: Array<string>,
      color: string
    }> = [] 

    for (let [name, value] of Object.entries(objects)) {
      if (typeof value === "string") {
        let entity = {
          name: name,
          path: path,
          color: value
        }
        result.push(entity)
      } else if (typeof value === "object") {
        result = result.concat(this.parseColorNode(path.concat(name), value))
      } else {
        throw new Error("Unable to parse, unsupported structure in color node leaf")
      }
    }
    return result
  }
}
