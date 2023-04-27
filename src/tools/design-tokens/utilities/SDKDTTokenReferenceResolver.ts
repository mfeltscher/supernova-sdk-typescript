//
//  SDKDTTokenReferenceResolver.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { AnyToken } from '../../../model/tokens/SDKTokenValue'
import { ColorToken, GenericToken, MeasureToken, RadiusToken, TextToken, TokenType, Unit } from '../../..'
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

  // Keep original index of Token, so we can ignore updating token with same path but lower priority
  // if during processing it is resolved later, than token with higher priority
  private mappedTokens: Map<string, [Token, number]> = new Map<string, [Token, number]>()
  private nodes: Map<string, DTProcessedTokenNode> = new Map<string, DTProcessedTokenNode>()

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {}

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Utilities

  replaceRefs(existingToken: AnyToken, newToken: AnyToken) {
    for (const [path, [token, index]] of this.mappedTokens) {
      if ((token as AnyToken)?.value?.referencedToken?.id === existingToken.id) {
        ;(token as AnyToken).value.referencedToken = newToken
      }
    }

    for (const [path, token] of this.nodes) {
      if ((token.token as AnyToken)?.value?.referencedToken?.id === existingToken.id) {
        ;(token.token as AnyToken).value.referencedToken = newToken
      }
    }
  }

  addAtomicToken(token: DTProcessedTokenNode, indexOfNewNode: number) {
    let nodePath = this.tokenReferenceKey(token.path, token.token.name)
    // Plugin using `last one wins` strategy.
    // We process tokens in order from $metadata.json, keeping theirs original index.
    // We should update tokens of same path that have higher priority only.
    // And any priority token could be resolved first.
    // See `test_tooling_design_tokens_order` test
    const [existingNode, indexOfExistingNode] = this.mappedTokens.get(nodePath) ?? []
    if (!!existingNode && Number.isInteger(indexOfNewNode) && indexOfExistingNode > indexOfNewNode) {
      return
    }
    if (!!existingNode) {
      // We might have built refs for this node already
      // So need to replace existing refs to existingNode with token.token
      // Another option might be to update all the data inside existingNode inplace for any token type
      this.replaceRefs(existingNode as AnyToken, token.token as AnyToken)
    }

    this.mappedTokens.set(nodePath, [token.token, indexOfNewNode])
    this.nodes.set(nodePath, token)
  }

  addAtomicTokens(tokens: Array<DTProcessedTokenNode>) {
    for (let token of tokens) {
      this.addAtomicToken(token, Number.NaN)
    }
  }

  unmappedValues(): Array<DTProcessedTokenNode> {
    return [...this.nodes.values()]
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Lookup

  tokensOfType(type: TokenType): Array<Token> {
    return [...this.mappedTokens.values()]
      .filter(([token, index]) => token.tokenType === type)
      .map(([token, index]) => token)
  }

  lookupReferencedToken(reference: string): Token | undefined {
    // Find single token reference
    return this.mappedTokens.get(reference)?.[0]
  }

  lookupAllReferencedTokens(
    reference: string
  ):
    | Array<{
        token: Token
        key: string
        location: number
      }>
    | undefined {
    let findings = this.findBracketStrings(reference)
    let result: Array<{
      token: Token
      key: string
      location: number
    }> = []
    for (let finding of findings) {
      let fullkey = `{${finding.value}}`
      if (this.mappedTokens.get(fullkey)?.[0]) {
        // Found referenced token
        result.push({
          token: this.mappedTokens.get(fullkey)?.[0],
          key: finding.value,
          location: finding.index
        })
      } else {
        // Skip as there is a reference that doesn't exist
        return undefined
      }
    }

    return result
  }

  replaceAllReferencedTokens(
    reference: string,
    replacements: Array<{
      token: Token
      key: string
      location: number
    }>
  ): string {
    // Seek from the last position so we don't have to deal with repositioning
    let sortedReps = replacements.sort((a, b) => b.location - a.location)
    let finalReference = reference
    for (let r of sortedReps) {
      if (
        r.token.tokenType !== TokenType.measure &&
        r.token.tokenType !== TokenType.generic &&
        r.token.tokenType !== TokenType.color &&
        r.token.tokenType !== TokenType.radius
      ) {
        throw new Error(
          `Invalid reference ${reference} in computed token. Only measures, colors or generic/text tokens can be used as partial reference (fe. rgba({value}, 10%), however was ${r.token.tokenType}`
        )
      }
      finalReference = this.replaceToken(finalReference, r.token, r.key, r.location)
    }

    return finalReference
  }

  replaceToken(base: string, token: Token, key: string, location: number): string {
    let fullkey = `{${key}}`
    let value = this.replacableValue(token)
    return this.replaceAt(base, fullkey, value, location)
  }

  replaceAt(s: string, what: string, replacement: string, index: number): string {
    return s.substring(0, index) + replacement + s.substring(index + what.length)
  }

  replacableValue(token: Token): string {
    switch (token.tokenType) {
      case TokenType.color:
        return (token as ColorToken).value.hex
      case TokenType.measure: {
        let measure = token as MeasureToken
        if (measure.value.unit === Unit.percent) {
          return (token as MeasureToken).value.measure.toString() + '%'
        } else {
          return (token as MeasureToken).value.measure.toString()
        }
      }
      case TokenType.radius:
        return (token as RadiusToken).value.radius.toString()
      case TokenType.generic:
        return (token as GenericToken).value.text
      case TokenType.text:
        return (token as TextToken).value.text
      default:
        throw new Error(
          'Invalid replacable value. Only measures, colors or generic/text tokens can provide value for complex tokens / inline replaces'
        )
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Conveniences

  isBalancedReference(syntax: string): boolean {
    return this.hasSameNumberOfCharacters(syntax, '{', '}')
  }

  valueHasReference(value: string | object | number): boolean {
    if (typeof value !== 'string') {
      return false
    }

    return value.includes('{') || value.includes('}')
  }

  valueIsPureReference(value: string | object): boolean {
    if (typeof value !== 'string') {
      return false
    }

    let trimmed = value.trim()

    // If there is more than one opening or closing bracket, it is not a pure reference. Must also open and close the syntax
    return (
      trimmed.startsWith('{') &&
      trimmed.endsWith('}') &&
      this.countCharacter(trimmed, '{') === 1 &&
      this.countCharacter(trimmed, '}') === 1
    )
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

  countCharacter(str: string, char: string): number {
    let count = 0
    for (const c of str) {
      if (c === char) {
        count++
      }
    }
    return count
  }

  tokenReferenceKey(path: Array<String>, name: string): string {
    // Delete initial piece of path, as this is only grouping element
    let newPath = Array.from(path)
    newPath.splice(0, 1)

    // Return path key that is the same as what Design Tokens uses for referencing
    return '{' + [...newPath, name].join('.') + '}'
  }

  findBracketStrings(str: string): { index: number; value: string }[] {
    const results = []
    let currentIndex = 0

    while (currentIndex < str.length) {
      // Find the index of the next opening bracket
      const openBracketIndex = str.indexOf('{', currentIndex)

      // If no more opening brackets are found, we can stop searching
      if (openBracketIndex === -1) {
        break
      }

      // Find the index of the closing bracket that corresponds to the opening bracket
      const closeBracketIndex = str.indexOf('}', openBracketIndex)

      // If no closing bracket is found, we can stop searching
      if (closeBracketIndex === -1) {
        break
      }

      // Extract the string between the brackets and add it to the results
      const bracketString = str.substring(openBracketIndex + 1, closeBracketIndex)
      results.push({
        index: openBracketIndex,
        value: bracketString
      })

      // Continue searching after the closing bracket
      currentIndex = closeBracketIndex + 1
    }

    return results
  }
}
