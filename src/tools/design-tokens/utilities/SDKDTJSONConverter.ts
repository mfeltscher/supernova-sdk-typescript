//
//  SDKDTJSONConverter.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Brand, ColorToken, DesignSystemVersion, Token, TokenGroup, TokenType } from "../../.."
import { SupernovaError } from "../../../core/errors/SDKSupernovaError"
import { DTParsedNode } from "./SDKDTJSONLoader"
import { DTTokenMerger } from "./SDKDTTokenMerger"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export type DTProcessedTokenNode = {
  token: Token,
  path: Array<string>,
  key: string
}

type DTRootNodeDefinition = {
  name: string,
  type: TokenType,
}


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Utility to DS Tokens plugin JSON to Supernova entities */
export class DTJSONConverter {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  version: DesignSystemVersion
  brand: Brand

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(version: DesignSystemVersion, brand: Brand) {
    this.version = version
    this.brand = brand
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token Conversion

  convertNodesToTokens(nodes: Array<DTParsedNode>): Array<DTProcessedTokenNode> {

    let processedNodes: Array<DTProcessedTokenNode> = []

    // Color tokens
    processedNodes = processedNodes.concat(this.convertNodesToTokensForSupportedNodeTypes(["color"], nodes))

    // Fix nodes so they are aligned with the way Supernova expects root groups to be named
    this.remapRootNodeKeys(processedNodes)

    // Retrieve all tokens
    return processedNodes
  }

  private remapRootNodeKeys(nodes: Array<DTProcessedTokenNode>): Array<DTProcessedTokenNode> {

    for (let node of nodes) {
      let path = Array.from(node.path)
      let firstSegment = path.splice(0, 1)[0]
      
      // Remap remote to proper destination
      switch (node.token.tokenType) {
        case TokenType.color:
          firstSegment = "Color"; break
        default: 
          throw new Error(`Unsupported type ${firstSegment} in remapping of nodes`)
      }
      path = [firstSegment, ...path]
      node.path = path

      // Rebuild key
      node.key = DTTokenMerger.buildKey(node.path, node.token.name)
    }

    return nodes
  }

  private convertNodesToTokensForSupportedNodeTypes(types: Array<string>, nodes: Array<DTParsedNode>): Array<DTProcessedTokenNode> {

    // Filter out only nodes that we want to be resolving - we can't be resolving everything at once
    nodes = nodes.filter(n => types.includes(n.type))
    let unprocessedTokens = new Array<DTParsedNode>()
    let processedTokens = new Array<DTProcessedTokenNode>()

    // Convert atomic tokens, ie. tokens without references
    for (let node of nodes) {
      if (typeof node.value === "string" && !this.valueIsReference(node.value)) {
        let token = this.convertAtomicNode(node)
        processedTokens.push(token)
      } else {
        unprocessedTokens.push(node)
      }
    }

    // Now we have all atomic tokens processed, we can start creating references
    // References will be emptying pool until they are all resolved (this can take multiple
    // passes, resolving one depth level with each pass)
    while (unprocessedTokens.length !== 0) {
      let unprocessedDepthTokens = new Array<DTParsedNode>()
      for (let node of unprocessedTokens) {
        let token = this.convertReferencedNode(node, processedTokens)
        if (token) {
          processedTokens.push(token)
        } else {
          unprocessedDepthTokens.push(node)
        }
      }
      if (unprocessedDepthTokens.length === 0) {
        break
      }
      unprocessedTokens = unprocessedDepthTokens
    }

    return processedTokens
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Atomic nodes

  private convertAtomicNode(node: DTParsedNode): DTProcessedTokenNode {

    let snType = this.convertDTTypeToSupernovaType(node.type)
    switch (snType) {
      case TokenType.color: return this.convertColorAtomicNode(node)
      default: throw new Error("Unsupported token type " + snType)
    }
  }

  private convertColorAtomicNode(node: DTParsedNode): DTProcessedTokenNode {

    let constructedToken = ColorToken.create(this.version, this.brand, node.name, node.description, node.value, undefined)
    return {
      token: constructedToken,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Referenced nodes

  private convertReferencedNode(node: DTParsedNode, resolvedTokens: Array<DTProcessedTokenNode>): DTProcessedTokenNode | undefined {

    let valueAsReference = node.value

    for (let resolvedToken of resolvedTokens) {
      let resolvedTokenAsReference = this.tokenReferenceKey(resolvedToken.path, resolvedToken.token.name)
      if (resolvedTokenAsReference === valueAsReference) {
        let constructedToken = ColorToken.create(this.version, this.brand, node.name, node.description, undefined, resolvedToken.token as ColorToken)
        return {
          token: constructedToken, 
          path: node.path,
          key: DTTokenMerger.buildKey(node.path, node.name)
        }
      }
    }

    return undefined
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Convenience

  private valueIsReference(value: string): boolean {

    value = value.trim()
    return value.length > 3 && 
           value.startsWith("{") &&
           value.endsWith("}")
  }

  private convertDTTypeToSupernovaType(type: string): TokenType {
   
    switch (type) {
      case "color": return TokenType.color
      default: throw new Error("Unsupported token type " + type)
    }
  }

  private tokenReferenceKey(path: Array<String>, name: string): string {

    // Delete initial piece of path, as this is only grouping element
    let newPath = Array.from(path)
    newPath.splice(0, 1)

    // Return path key that is the same as what Design Tokens uses for referencing
    // console.log("{" + [...newPath, name].join(".") + "}")
    return "{" + [...newPath, name].join(".") + "}"
  }
}