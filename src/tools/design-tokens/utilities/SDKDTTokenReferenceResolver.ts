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

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Utility allowing resolution of token references */
export class DTTokenReferenceResolver {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  private atomicTokens: Array<Token> = []

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {

  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Utilities

  addAtomicToken(token: Token) {

    let hasToken = this.atomicTokens.filter(t => t.id === token.id).length > 0
    if (!hasToken) {
      this.atomicTokens.push(token)
    }
  }

  addAtomicTokens(tokens: Array<Token>) {

    for (let token of tokens) {
      this.addAtomicToken(token)
    }
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Utilities
    
  valueIsReference(value: string): boolean {

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
