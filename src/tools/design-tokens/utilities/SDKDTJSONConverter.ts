//
//  SDKDTJSONConverter.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Brand, ColorToken, DesignSystemVersion, GenericToken, MeasureToken, RadiusToken, ShadowToken, Token, TokenType, TypographyToken } from "../../.."
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

    // Color tokens
    this.convertNodesToTokensForSupportedNodeTypes(["color"], nodes)

    // Sizing tokens
    this.convertNodesToTokensForSupportedNodeTypes(["sizing", "borderWidth", "spacing", "opacity", "fontSizes", "paragraphSpacing", "lineHeights", "letterSpacing"], nodes)

    // Radii tokens
    this.convertNodesToTokensForSupportedNodeTypes(["borderRadius"], nodes)

    // Other tokens
    this.convertNodesToTokensForSupportedNodeTypes(["other"], nodes)
  
    // Shadow tokens
    this.convertNodesToTokensForSupportedNodeTypes(["boxShadow"], nodes)

    // Typography tokens
    this.convertNodesToTokensForSupportedNodeTypes(["typography"], nodes)

    // Fix nodes so they are aligned with the way Supernova expects root groups to be named
    let processedNodes = this.referenceResolver.unmappedValues()
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
        case TokenType.shadow:
          firstSegment = "Shadow"; break
        case TokenType.typography:
          firstSegment = "Typography"; break
        case TokenType.generic:
          firstSegment = "Generic"; break
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
        case "fontSizes":
          secondSegment = "Font Size"; break
        case "paragraphSpacing":
          secondSegment = "Paragraph Spacing"; break
        case "lineHeights":
          secondSegment = "Line Height"; break
        case "letterSpacing":
          secondSegment = "Letter Spacing"; break
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

  private convertNodesToTokensForSupportedNodeTypes(types: Array<string>, nodes: Array<DTParsedNode>) {

    // Filter out only nodes that we want to be resolving - we can't be resolving everything at once
    nodes = nodes.filter(n => types.includes(n.type))
    let unprocessedTokens = new Array<DTParsedNode>()

    // Convert atomic tokens, ie. tokens without references
    for (let node of nodes) {
      if (!this.referenceResolver.valueIsReference(node.value)) {
        let token = this.convertAtomicNode(node)
        this.referenceResolver.addAtomicToken(token)
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
        let token = this.convertReferencedNode(node)
        if (token) {
          this.referenceResolver.addAtomicToken(token)
        } else {
          unprocessedDepthTokens.push(node)
        }
      }
      if (unprocessedDepthTokens.length === 0) {
        break
      }
      unprocessedTokens = unprocessedDepthTokens
    }
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Atomic nodes

  private convertAtomicNode(node: DTParsedNode): DTProcessedTokenNode {

    let snType = this.convertDTTypeToSupernovaType(node.type)
    switch (snType) {
      case TokenType.color: return this.convertColorAtomicNode(node)
      case TokenType.measure: return this.convertMeasureAtomicNode(node)
      case TokenType.radius: return this.convertRadiusAtomicNode(node)
      case TokenType.shadow: return this.convertShadowAtomicNode(node)
      case TokenType.typography: return this.convertTypographyAtomicNode(node)
      case TokenType.generic: return this.convertGenericAtomicNode(node)
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

  private convertShadowAtomicNode(node: DTParsedNode): DTProcessedTokenNode {

    let constructedToken = ShadowToken.create(this.version, this.brand, node.name, node.description, node.value, undefined, this.referenceResolver)
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }

  private convertTypographyAtomicNode(node: DTParsedNode): DTProcessedTokenNode {

    let constructedToken = TypographyToken.create(this.version, this.brand, node.name, node.description, node.value, undefined, this.referenceResolver)
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }

  private convertGenericAtomicNode(node: DTParsedNode): DTProcessedTokenNode {

    let constructedToken = GenericToken.create(this.version, this.brand, node.name, node.description, node.value, undefined)
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Referenced nodes

  private convertReferencedNode(node: DTParsedNode): DTProcessedTokenNode | undefined {

    let valueAsReference = node.value
    let resolvedToken = this.referenceResolver.lookupReferencedToken(valueAsReference)
    
    if (resolvedToken) {
      let constructedToken: Token
      let snType = this.convertDTTypeToSupernovaType(node.type)
      switch (snType) {
        case TokenType.color: constructedToken = ColorToken.create(this.version, this.brand, node.name, node.description, undefined, resolvedToken as ColorToken); break;
        case TokenType.measure: constructedToken = MeasureToken.create(this.version, this.brand, node.name, node.description, undefined, resolvedToken as MeasureToken); break;
        case TokenType.radius: constructedToken = RadiusToken.create(this.version, this.brand, node.name, node.description, undefined, resolvedToken as RadiusToken); break;
        case TokenType.shadow: constructedToken = ShadowToken.create(this.version, this.brand, node.name, node.description, undefined, resolvedToken as ShadowToken, this.referenceResolver); break;
        case TokenType.typography: constructedToken = TypographyToken.create(this.version, this.brand, node.name, node.description, undefined, resolvedToken as TypographyToken, this.referenceResolver); break;
        case TokenType.generic: constructedToken = GenericToken.create(this.version, this.brand, node.name, node.description, undefined, resolvedToken as GenericToken); break;
        default: throw new Error("Unsupported token type " + snType)
      }
      
      return {
        token: constructedToken, 
        path: node.path,
        originalType: node.type,
        key: DTTokenMerger.buildKey(node.path, node.name)
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
      case "boxShadow": return TokenType.shadow
      case "typography": return TokenType.typography
      case "borderWidth": 
      case "sizing":
      case "opacity":
      case "spacing":
      case "fontSizes":
      case "paragraphSpacing":
      case "letterSpacing":
      case "lineHeights":
        return TokenType.measure  
      case "other":
        return TokenType.generic
      default: throw new Error("Unsupported token type " + type)
    }
  }
}