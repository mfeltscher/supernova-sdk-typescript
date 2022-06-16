//
//  SDKDTJSONConverter.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Brand, ColorToken, DesignSystemVersion, MeasureToken, RadiusToken, Token, TokenType } from "../../.."
import { SupernovaError } from "../../../core/errors/SDKSupernovaError"
import { DTParsedNode } from "./SDKDTJSONLoader"
import { DTTokenMerger } from "./SDKDTTokenMerger"
import { DTTokenReferenceResolver } from "./SDKDTTokenReferenceResolver"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export type DTProcessedTokenNode = {
  token: Token,
  originalType: string,
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
  referenceResolver: DTTokenReferenceResolver

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(version: DesignSystemVersion, brand: Brand) {
    this.version = version
    this.brand = brand
    this.referenceResolver = new DTTokenReferenceResolver()
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token Conversion

  convertNodesToTokens(nodes: Array<DTParsedNode>): Array<DTProcessedTokenNode> {

    let processedNodes: Array<DTProcessedTokenNode> = []

    // Color tokens
    processedNodes = processedNodes.concat(this.convertNodesToTokensForSupportedNodeTypes(["color"], nodes))

    // Sizing tokens
    processedNodes = processedNodes.concat(this.convertNodesToTokensForSupportedNodeTypes(["sizing", "borderWidth", "spacing", "opacity"], nodes))

    // Radii tokens
    processedNodes = processedNodes.concat(this.convertNodesToTokensForSupportedNodeTypes(["borderRadius"], nodes))

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
        case TokenType.measure:
          firstSegment = "Measure"; break
        case TokenType.radius:
          firstSegment = "Radius"; break
        default: 
          throw new Error(`Unsupported type ${firstSegment} in remapping of nodes`)
      }

      let secondSegment: string | undefined = undefined
      switch (node.originalType) {
        case "borderRadius":
          secondSegment = "Border Radius"; break
        case "borderWidth":
          secondSegment = "Border Width"; break
        case "sizing":
          secondSegment = "Sizing"; break
        case "spacing":
          secondSegment = "Spacing"; break
        case "opacity":
          secondSegment = "Opacity"; break
        default:
          // Other types than listed should be ignored
          break
      }

      // Remap original type and add extra group, if needed
      if (secondSegment) {
        path = [firstSegment, secondSegment, ...path]
      } else {
        path = [firstSegment, ...path]
      }
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
      if (typeof node.value === "string" && this.referenceResolver.valueIsReference(node.value)) {
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
          // console.log(`processed token ${token.path} referencing ${token.key}`)
          processedTokens.push(token)
        } else {
          // console.log(`skipping token in resolution for now`)
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
      case TokenType.measure: return this.convertMeasureAtomicNode(node)
      case TokenType.radius: return this.convertRadiusAtomicNode(node)
      default: throw new Error("Unsupported token type " + snType)
    }
  }

  private convertColorAtomicNode(node: DTParsedNode): DTProcessedTokenNode {

    let constructedToken = ColorToken.create(this.version, this.brand, node.name, node.description, node.value, undefined)
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }

  private convertMeasureAtomicNode(node: DTParsedNode): DTProcessedTokenNode {

    let constructedToken = MeasureToken.create(this.version, this.brand, node.name, node.description, node.value, undefined)
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }

  private convertRadiusAtomicNode(node: DTParsedNode): DTProcessedTokenNode {

    let constructedToken = RadiusToken.create(this.version, this.brand, node.name, node.description, node.value, undefined)
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Referenced nodes

  private convertReferencedNode(node: DTParsedNode, resolvedTokens: Array<DTProcessedTokenNode>): DTProcessedTokenNode | undefined {

    let valueAsReference = node.value

    for (let resolvedToken of resolvedTokens) {
      let resolvedTokenAsReference = this.referenceResolver.tokenReferenceKey(resolvedToken.path, resolvedToken.token.name)
      if (resolvedTokenAsReference === valueAsReference) {
        let constructedToken: Token
        let snType = this.convertDTTypeToSupernovaType(node.type)
        switch (snType) {
          case TokenType.color: constructedToken = ColorToken.create(this.version, this.brand, node.name, node.description, undefined, resolvedToken.token as ColorToken); break;
          case TokenType.measure: constructedToken = MeasureToken.create(this.version, this.brand, node.name, node.description, undefined, resolvedToken.token as MeasureToken); break;
          case TokenType.radius: constructedToken = RadiusToken.create(this.version, this.brand, node.name, node.description, undefined, resolvedToken.token as RadiusToken); break;
          default: throw new Error("Unsupported token type " + snType)
        }
        
        return {
          token: constructedToken, 
          path: node.path,
          originalType: node.type,
          key: DTTokenMerger.buildKey(node.path, node.name)
        }
      }
    }

    return undefined
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Convenience

  private convertDTTypeToSupernovaType(type: string): TokenType {
   
    switch (type) {
      case "color": return TokenType.color
      case "borderRadius": return TokenType.radius
      case "borderWidth": return TokenType.measure  
      case "sizing": return TokenType.measure
      case "opacity": return TokenType.measure
      case "spacing": return TokenType.measure

      default: throw new Error("Unsupported token type " + type)
    }
  }
}