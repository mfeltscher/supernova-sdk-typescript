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

  constructor() {}

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
    // Find single token reference
    return this.mappedTokens.get(reference)
  }

  lookupAllReferencedTokens(reference: string): Token | undefined {

    let findings = this.findBracketStrings(reference)
    for (let finding of findings) {
      console.log(finding)
    }

    return undefined
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Conveniences

  isBalancedReference(syntax: string): boolean {
    return this.hasSameNumberOfCharacters(syntax, "{", "}")
  }

  valueHasReference(value: string | object): boolean {
    if (typeof value !== 'string') {
      console.log('value not reference')
      return false
    }

    console.log('value reference' + (value.includes('{') || value.includes('}')))
    return value.includes('{') || value.includes('}')
  }

  valueIsPureReference(value: string | object): boolean {
    if (typeof value !== 'string') {
      console.log('value not reference')
      return false
    }

    let trimmed = value.trim()
    return value.startsWith('{') && value.endsWith('}')
  }

  hasSameNumberOfCharacters(str: string, char1: string, char2: string): boolean {
    let count1 = 0
    let count2 = 0

    for (const c of str) {
      if (c === char1) {
        count1++
      } else if (c === char2) {
        count2++
      }
    }

    return count1 === count2
  }

  tokenReferenceKey(path: Array<String>, name: string): string {
    // Delete initial piece of path, as this is only grouping element
    let newPath = Array.from(path)
    newPath.splice(0, 1)

    // Return path key that is the same as what Design Tokens uses for referencing
    return '{' + [...newPath, name].join('.') + '}'
  }


  findBracketStrings(str: string): { index: number, value: string }[] {
    const results = [];
    let currentIndex = 0;
  
    while (currentIndex < str.length) {
      // Find the index of the next opening bracket
      const openBracketIndex = str.indexOf("{", currentIndex);
  
      // If no more opening brackets are found, we can stop searching
      if (openBracketIndex === -1) {
        break;
      }
  
      // Find the index of the closing bracket that corresponds to the opening bracket
      const closeBracketIndex = str.indexOf("}", openBracketIndex);
  
      // If no closing bracket is found, we can stop searching
      if (closeBracketIndex === -1) {
        break;
      }
  
      // Extract the string between the brackets and add it to the results
      const bracketString = str.substring(openBracketIndex + 1, closeBracketIndex);
      results.push({
        index: openBracketIndex,
        value: bracketString
      });
  
      // Continue searching after the closing bracket
      currentIndex = closeBracketIndex + 1;
    }
  
    return results;
  }
}
