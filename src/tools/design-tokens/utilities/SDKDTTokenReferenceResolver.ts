//
//  SDKDTTokenReferenceResolver.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Token } from '../../../model/tokens/SDKToken'
import { DTProcessedTokenNode } from './SDKDTJSONConverter'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Utility allowing resolution of token references */
export class DTTokenReferenceResolver {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  private mappedTokens: Map<string, Token> = new Map<string, Token>()
  private nodes: Array<DTProcessedTokenNode> = []

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {

  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Utilities

  addAtomicToken(token: DTProcessedTokenNode) {
    
    let nodePath = this.tokenReferenceKey(token.path, token.token.name)
    if (!this.mappedTokens.get(nodePath)) {
      this.mappedTokens.set(nodePath, token.token)
      this.nodes.push(token)
    }
  }

  addAtomicTokens(tokens: Array<DTProcessedTokenNode>) {

    for (let token of tokens) {
      this.addAtomicToken(token)
    }
  }

  unmappedValues(): Array<DTProcessedTokenNode> {
    return this.nodes
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Lookup

  lookupReferencedToken(reference: string): Token | undefined {

    return this.mappedTokens.get(reference)
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Conveniences
    
  valueIsReference(value: string | object): boolean {

    if (typeof value !== "string") {
      return false
    }
    
    if ((value.match(/{/g)||[]).length > 1) {
      console.log("Skipping because reference is unsupported garbage")
      return false
    }

    value = value.trim()
    return value.length > 3 && 
           value.startsWith("{") &&
           value.endsWith("}")   
  }

  tokenReferenceKey(path: Array<String>, name: string): string {

    // Delete initial piece of path, as this is only grouping element
    let newPath = Array.from(path)
    newPath.splice(0, 1)

    // Return path key that is the same as what Design Tokens uses for referencing
    return "{" + [...newPath, name].join(".") + "}"
  }
}

