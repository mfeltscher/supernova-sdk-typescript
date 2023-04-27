//
//  SDKDTJSONConverter.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { BorderToken, GradientToken } from '../../..'
import { Brand } from '../../../core/SDKBrand'
import { DesignSystemVersion } from '../../../core/SDKDesignSystemVersion'
import { TokenType } from '../../../model/enums/SDKTokenType'
import { ColorToken } from '../../../model/tokens/SDKColorToken'
import { GenericToken } from '../../../model/tokens/SDKGenericToken'
import { MeasureToken } from '../../../model/tokens/SDKMeasureToken'
import { RadiusToken } from '../../../model/tokens/SDKRadiusToken'
import { ShadowToken } from '../../../model/tokens/SDKShadowToken'
import { Token } from '../../../model/tokens/SDKToken'
import { TypographyToken } from '../../../model/tokens/SDKTypographyToken'
import { DTParsedNode } from './SDKDTJSONLoader'
import { DTPluginToSupernovaMapPack } from './SDKDTMapLoader'
import { DTTokenMerger } from './SDKDTTokenMerger'
import { DTTokenReferenceResolver } from './SDKDTTokenReferenceResolver'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export type DTProcessedTokenNode = {
  token: Token
  originalType: string
  path: Array<string>
  key: string
}

type DTRootNodeDefinition = {
  name: string
  type: TokenType
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Utility to DS Tokens plugin JSON to Supernova entities */
export class DTJSONConverter {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  version: DesignSystemVersion
  mapping: DTPluginToSupernovaMapPack
  referenceResolver: DTTokenReferenceResolver

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(version: DesignSystemVersion, mapping: DTPluginToSupernovaMapPack) {
    this.version = version
    this.mapping = mapping
    this.referenceResolver = new DTTokenReferenceResolver()
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token Conversion

  convertNodesToTokens(nodes: Array<DTParsedNode>, brand: Brand): Array<DTProcessedTokenNode> {
    // Compute measures first. Measures can be used to do all types of calculation, so they must be available at the beginning for all other types of tokens
    this.convertNodesToTokensForSupportedNodeTypes(
      [
        'sizing',
        'borderWidth',
        'spacing',
        'opacity',
        'fontSizes',
        'paragraphSpacing',
        'lineHeights',
        'letterSpacing',
        'other',
        'dimension'
      ],
      nodes,
      brand
    )

    // Other tokens
    // this.convertNodesToTokensForSupportedNodeTypes(['other'], nodes, brand)

    // Color tokens
    this.convertNodesToTokensForSupportedNodeTypes(['color'], nodes, brand)

    // Radii tokens
    this.convertNodesToTokensForSupportedNodeTypes(['borderRadius'], nodes, brand)

    // Shadow tokens
    this.convertNodesToTokensForSupportedNodeTypes(['boxShadow'], nodes, brand)

    // Gradient tokens
    this.convertNodesToTokensForSupportedNodeTypes(['gradient'], nodes, brand)

    // Typography tokens
    this.convertNodesToTokensForSupportedNodeTypes(['typography'], nodes, brand)

    // Border tokens
    this.convertNodesToTokensForSupportedNodeTypes(['border'], nodes, brand)

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
          firstSegment = 'Color'
          break
        case TokenType.gradient:
          firstSegment = 'Gradient'
          break
        case TokenType.measure:
          firstSegment = 'Measure'
          break
        case TokenType.radius:
          firstSegment = 'Radius'
          break
        case TokenType.shadow:
          firstSegment = 'Shadow'
          break
        case TokenType.typography:
          firstSegment = 'Typography'
          break
        case TokenType.generic:
          firstSegment = 'Generic'
          break
        case TokenType.border:
          firstSegment = 'Border'
          break
        default:
          throw new Error(`Unsupported type ${firstSegment} in remapping of nodes`)
      }

      let secondSegment: string | undefined = undefined
      switch (node.originalType) {
        case 'borderRadius':
          secondSegment = 'Border Radius'
          break
        case 'borderWidth':
          secondSegment = 'Border Width'
          break
        case 'sizing':
          secondSegment = 'Sizing'
          break
        case 'fontSizes':
          secondSegment = 'Font Size'
          break
        case 'paragraphSpacing':
          secondSegment = 'Paragraph Spacing'
          break
        case 'lineHeights':
          secondSegment = 'Line Height'
          break
        case 'letterSpacing':
          secondSegment = 'Letter Spacing'
          break
        case 'spacing':
          secondSegment = 'Spacing'
          break
        case 'opacity':
          secondSegment = 'Opacity'
          break
        case 'dimension':
          secondSegment = 'Dimension'
          break
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

  private convertNodesToTokensForSupportedNodeTypes(types: Array<string>, nodes: Array<DTParsedNode>, brand: Brand) {
    // Filter out only nodes that we want to be resolving - we can't be resolving everything at once
    nodes = nodes.filter(n => types.includes(n.type))
    let unprocessedTokens = new Array<[DTParsedNode, number]>()
    let originalNodeIndex = -1
    // Convert atomic tokens, ie. tokens without references
    for (let node of nodes) {
      originalNodeIndex++
      if (!this.referenceResolver.valueHasReference(node.value)) {
        let token = this.convertAtomicNode(node, brand)
        this.referenceResolver.addAtomicToken(token, originalNodeIndex)
      } else {
        unprocessedTokens.push([node, originalNodeIndex])
      }
    }

    // Now we have all atomic tokens processed, we can start creating references
    // References will be emptying pool until they are all resolved (this can take multiple
    // passes, resolving one depth level with each pass)
    let depth = 0
    let maximumDepth = 100

    while (unprocessedTokens.length !== 0) {
      let unprocessedDepthTokens = new Array<[DTParsedNode, number]>()
      for (let [node, index] of unprocessedTokens) {
        // NOTE: Self-reference now works with original-index logic in addAtomicNode
        // Keep it commented meanwhile to ensure it works on bigger data set
        // let nodeKey = `{${node.path.slice(1).join('.')}.${node.name}}`
        // // We might want to skip more complex self reference (in formula)
        // if (node.value === nodeKey) {
        //   console.log(`Skip self reference ${node.value}`)
        //   continue
        // }

        let token = this.convertReferencedNode(node, brand)
        if (token) {
          this.referenceResolver.addAtomicToken(token, index)
        } else {
          unprocessedDepthTokens.push([node, index])
        }
      }
      if (unprocessedDepthTokens.length === 0) {
        break
      }
      unprocessedTokens = unprocessedDepthTokens
      depth += 1
      if (depth > maximumDepth) {
        console.log(unprocessedTokens)
        throw new Error(
          `Engine was not able to solve references for the following tokens in a reasonable time: \n\n${unprocessedTokens
            .map(([t, i]) => DTTokenMerger.buildKey(t.path, t.name))
            .join(
              '\n'
            )}\n\nThis can be caused by few things:\n\n- Not including all token sets you wanted to reference in the mapping file\n- Reference pointing to the token that doesn't exist\nCircular reference where two tokens reference each other\nUsing (other) token for defining strings, instead of numbers (current limitation)\n\nIf you are sure this is not the case, please report the bug on our Discord (https://community.supernova.io) and we'll help you solve it :)`
        )
      }
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Atomic nodes

  private convertAtomicNode(node: DTParsedNode, brand: Brand): DTProcessedTokenNode {
    let snType = this.convertDTTypeToSupernovaType(node.type)
    switch (snType) {
      case TokenType.measure:
        return this.convertMeasureAtomicNode(node, brand)
      case TokenType.color:
        return this.convertColorAtomicNode(node, brand)
      case TokenType.radius:
        return this.convertRadiusAtomicNode(node, brand)
      case TokenType.shadow:
        return this.convertShadowAtomicNode(node, brand)
      case TokenType.border:
        return this.convertBorderAtomicNode(node, brand)
      case TokenType.gradient:
        return this.convertGradientAtomicNode(node, brand)
      case TokenType.typography:
        return this.convertTypographyAtomicNode(node, brand)
      case TokenType.generic:
        return this.convertGenericAtomicNode(node, brand)
      default:
        throw new Error('Unsupported token type ' + snType)
    }
  }

  private convertColorAtomicNode(node: DTParsedNode, brand: Brand): DTProcessedTokenNode {
    let constructedToken = ColorToken.create(
      this.version,
      brand,
      node.name,
      node.description,
      node.value,
      undefined,
      [],
      []
    )
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }

  private convertMeasureAtomicNode(node: DTParsedNode, brand: Brand): DTProcessedTokenNode {
    let constructedToken = MeasureToken.create(
      this.version,
      brand,
      node.name,
      node.description,
      node.value,
      undefined,
      [],
      []
    )
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }

  private convertRadiusAtomicNode(node: DTParsedNode, brand: Brand): DTProcessedTokenNode {
    let constructedToken = RadiusToken.create(
      this.version,
      brand,
      node.name,
      node.description,
      node.value,
      undefined,
      [],
      []
    )
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }

  private convertShadowAtomicNode(node: DTParsedNode, brand: Brand): DTProcessedTokenNode {
    let constructedToken = ShadowToken.create(
      this.version,
      brand,
      node.name,
      node.description,
      node.value,
      undefined,
      this.referenceResolver,
      [],
      []
    )
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }

  private convertBorderAtomicNode(node: DTParsedNode, brand: Brand): DTProcessedTokenNode {
    let constructedToken = BorderToken.create(
      this.version,
      brand,
      node.name,
      node.description,
      node.value,
      undefined,
      this.referenceResolver,
      [],
      []
    )
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }

  private convertGradientAtomicNode(node: DTParsedNode, brand: Brand): DTProcessedTokenNode {
    let constructedToken = GradientToken.create(
      this.version,
      brand,
      node.name,
      node.description,
      node.value,
      undefined,
      this.referenceResolver,
      [],
      []
    )
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }

  private convertTypographyAtomicNode(node: DTParsedNode, brand: Brand): DTProcessedTokenNode {
    let constructedToken = TypographyToken.create(
      this.version,
      brand,
      node.name,
      node.description,
      node.value,
      undefined,
      this.referenceResolver,
      [],
      []
    )
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }

  private convertGenericAtomicNode(node: DTParsedNode, brand: Brand): DTProcessedTokenNode {
    let constructedToken = GenericToken.create(
      this.version,
      brand,
      node.name,
      node.description,
      node.value,
      undefined,
      [],
      []
    )
    return {
      token: constructedToken,
      originalType: node.type,
      path: node.path,
      key: DTTokenMerger.buildKey(node.path, node.name)
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Referenced nodes

  private convertReferencedNode(node: DTParsedNode, brand: Brand): DTProcessedTokenNode | undefined {
    if (!this.referenceResolver.isBalancedReference(node.value)) {
      throw new Error(`Invalid reference syntax in token value: ${node.value}`)
    }

    if (this.referenceResolver.valueIsPureReference(node.value)) {
      // Option 1: Pure reference, in which case we can create the token directly based on the reference
      return this.convertPureReferencedNode(node, brand)
    } else {
      // Option 2: The value is more complex string. We first need to resolve the references, reduce the issue, then try to build the token again
      return this.convertComplexReferenceNode(node, brand)
    }
  }

  private convertPureReferencedNode(node: DTParsedNode, brand: Brand): DTProcessedTokenNode | undefined {
    let valueAsReference = node.value
    let resolvedToken = this.referenceResolver.lookupReferencedToken(valueAsReference)

    if (resolvedToken) {
      let constructedToken: Token
      let snType = this.convertDTTypeToSupernovaType(node.type)
      switch (snType) {
        case TokenType.color:
          constructedToken = ColorToken.create(
            this.version,
            brand,
            node.name,
            node.description,
            undefined,
            resolvedToken as ColorToken,
            [],
            []
          )
          break
        case TokenType.measure:
          constructedToken = MeasureToken.create(
            this.version,
            brand,
            node.name,
            node.description,
            undefined,
            resolvedToken as MeasureToken,
            [],
            []
          )
          break
        case TokenType.radius:
          constructedToken = RadiusToken.create(
            this.version,
            brand,
            node.name,
            node.description,
            undefined,
            resolvedToken as RadiusToken,
            [],
            []
          )
          break
        case TokenType.shadow:
          constructedToken = ShadowToken.create(
            this.version,
            brand,
            node.name,
            node.description,
            undefined,
            resolvedToken as ShadowToken,
            this.referenceResolver,
            [],
            []
          )
          break
        case TokenType.border:
          constructedToken = BorderToken.create(
            this.version,
            brand,
            node.name,
            node.description,
            undefined,
            resolvedToken as BorderToken,
            this.referenceResolver,
            [],
            []
          )
          break
        case TokenType.gradient:
          constructedToken = GradientToken.create(
            this.version,
            brand,
            node.name,
            node.description,
            undefined,
            resolvedToken as GradientToken,
            this.referenceResolver,
            [],
            []
          )
          break
        case TokenType.typography:
          constructedToken = TypographyToken.create(
            this.version,
            brand,
            node.name,
            node.description,
            undefined,
            resolvedToken as TypographyToken,
            this.referenceResolver,
            [],
            []
          )
          break
        case TokenType.generic:
          constructedToken = GenericToken.create(
            this.version,
            brand,
            node.name,
            node.description,
            undefined,
            resolvedToken as GenericToken,
            [],
            []
          )
          break
        default:
          throw new Error('Unsupported token type ' + snType)
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

  private convertComplexReferenceNode(node: DTParsedNode, brand: Brand): DTProcessedTokenNode | undefined {
    let valueAsReference = node.value
    let references = this.referenceResolver.lookupAllReferencedTokens(valueAsReference)
    if (!references) {
      return undefined
    } else {
      let resolvedValue = this.referenceResolver.replaceAllReferencedTokens(valueAsReference, references)
      // Create temporary node with replaced value that will have no more references
      let resolvedNode = {
        rootKey: node.rootKey,
        name: node.name,
        path: node.path,
        type: node.type,
        value: resolvedValue,
        description: node.description
      }
      let processedNode = this.convertAtomicNode(resolvedNode, brand)
      return processedNode
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Convenience

  private convertDTTypeToSupernovaType(type: string): TokenType {
    switch (type) {
      case 'color':
        return TokenType.color
      case 'borderRadius':
        return TokenType.radius
      case 'boxShadow':
        return TokenType.shadow
      case 'gradient':
        return TokenType.gradient
      case 'typography':
        return TokenType.typography
      case 'border':
        return TokenType.border
      case 'borderWidth':
      case 'sizing':
      case 'opacity':
      case 'spacing':
      case 'fontSizes':
      case 'paragraphSpacing':
      case 'letterSpacing':
      case 'lineHeights':
      case 'other':
      case 'dimension':
        return TokenType.measure
      default:
        throw new Error('Unsupported token type ' + type)
    }
  }
}
