//
//  SDKToolsStyleDictionary.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignSystemVersion } from "../../core/SDKDesignSystemVersion"
import { Supernova } from "../../core/SDKSupernova"
import { TokenType } from "../../model/enums/SDKTokenType"
import { TokenGroup } from "../../model/groups/SDKTokenGroup"
import { Token } from "../../model/tokens/SDKToken"
import _ from "lodash"
import { TokenJSONElementFigmaTokensTransformer } from "./elements-transformers/SDKToolsJSONElementFigmaTokensTransformer"
import { TokenJSONElementStyleDictionaryTransformer } from "./elements-transformers/SDKToolsJSONElementStyleDictionaryTransformer"
import { TokenJSONElementTransformer } from "./elements-transformers/SDKToolsJSONElementTransformer"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration

export type TokenJSONBuilderOptions = {

  /** Conversion method to be used for token names. Original will use actual token name */
  naming: JSONBuilderNamingOption,

  /** When enabled, brandId will be included in every token */
  includeBrandId: boolean,

  /** When enabled, comments will be included in tokens that have description */
  includeComments: boolean,
  
  /** When provided, tokens will be filtered to only show tokens belonging to this brand */
  brandId: string | null
  
  /** When enabled, type will be included in every token */
  includeType: boolean,
  
  /** When enabled, root category node will be generated. If type === null, multiple root nodes will be generated, one for each type */
  includeRootTypeNodes: boolean,
  
  /** When provided, only tokens of one category will be generated. Providing null will generate all tokens regardless of type */
  type: TokenType | null

  /** When enabled, output will be split into multiple files. Ignored for now */
  multifile: boolean
}

export type TokenJSONBuilderOptionsInternal = TokenJSONBuilderOptions & {
  consumerMode: ConsumerMode
}


export enum JSONBuilderNamingOption {
  original = "original",
  camelcase = "camelcase",
  snakecase = "snakecase",
  kebabcase = "kebabcase"
}

enum ConsumerMode {
  styleDictionary,
  figmaTokens
}


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** JSON builder tooling object. Allows to build full token JSON definition for different styles of outputs, like Style Dictionary or Figma Tokens plugin */
export class TokenJSONBuilder {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  private instance: Supernova
  private version: DesignSystemVersion
  private tokenTransformer: TokenJSONElementTransformer

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(instance: Supernova, version: DesignSystemVersion) {
    this.instance = instance
    this.version = version
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public interface

  /** Fetches all tokens available for selected design system version, and converts them to style dictionary representation. */
  async styleDictionaryRepresentation(options: TokenJSONBuilderOptions) {

    this.tokenTransformer = new TokenJSONElementStyleDictionaryTransformer()
    let tokens = await this.version.tokens()
    let groups = await this.version.tokenGroups()

    // Filter out tokens that contain brand id
    if (options.brandId) {
      tokens = tokens.filter(t => t.brandId === options.brandId)
    }
    return this.buildTokenStructure(tokens, groups, { ...options, ...{ consumerMode: ConsumerMode.figmaTokens }})
  }

  /** Fetches all tokens available for selected design system version, and converts them to figma tokens representation. */
  async figmaTokensRepresentation(isSingleFile: boolean) {

    if (!isSingleFile) {
      throw new Error("Multi file mode of write is not yet supported by the tooling")
    }
    this.tokenTransformer = new TokenJSONElementFigmaTokensTransformer()

    let tokens = await this.version.tokens()
    let groups = await this.version.tokenGroups()
    let brand = await this.version.brands()

    let options: TokenJSONBuilderOptionsInternal = {
      naming: JSONBuilderNamingOption.original,
      includeComments: false,
      includeBrandId: false,
      brandId: brand[0].persistentId, // Select first brand for now
      includeType: true,
      includeRootTypeNodes: false,
      type: null,
      multifile: false,
      consumerMode: ConsumerMode.figmaTokens
    }

    // Filter out tokens that contain brand id
    if (options.brandId) {
      tokens = tokens.filter(t => t.brandId === options.brandId)
    }

    return this.buildTokenStructure(tokens, groups, options)
  }


  private buildTokenStructure(tokens: Array<Token>, groups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal) {

    if (options.type) {
      // When a specific type is requested, only generate that particular one
      for (let group of groups) {
        if (group.isRoot && group.tokenType === options.type) {
            return this.generateStyleDictionaryTree(group, tokens, groups, options)
        }
      }
    } else {
      // Generate all token types
      let result = {}
      for (let group of groups) {
        if (group.isRoot) {
            let sdTree = this.generateStyleDictionaryTree(group, tokens, groups, options)
            result = _.merge(result, sdTree)
        }
      }
      return result
    }
  
    return {}
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Style dictionary manipulation

  /** Generate style dictionary tree */
  private generateStyleDictionaryTree(rootGroup: TokenGroup, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal) {
    let writeRoot = {}
    // Compute full data structure of the entire type-dependent tree
    let result = this.representTree(rootGroup, allTokens, allGroups, writeRoot, options)

    // Add top level entries which don't belong to any user-defined group
    for (let token of TokenJSONBuilder.tokensOfGroup(rootGroup, allTokens)) {
      result[this.tokenTransformer.safeTokenName(token, options.naming)] = this.tokenTransformer.representToken(token, allTokens, allGroups, options)
    }

    // Retrieve tokens with type shell or without it
    if (options.includeRootTypeNodes) {
      return {
        [`${this.tokenTransformer.typeLabel(rootGroup.tokenType)}`]: result
      }
    } else {
      return result
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Tree construction

  /** Construct tree out of one specific group, independent of tree type */
  private representTree(
    rootGroup: TokenGroup,
    allTokens: Array<Token>,
    allGroups: Array<TokenGroup>,
    writeObject: Object,
    options: TokenJSONBuilderOptionsInternal
  ): Object {
    let newObject = writeObject

    // Represent one level of groups and tokens inside tree. Creates subobjects and then also information about each token
    for (let group of rootGroup.subgroups) {
      // Write buffer
      let writeSubObject = {}

      // Check whether the group should not be skipped because we have generated it on Supernova side. If so, completely ignore the group, and move one depth further
      if (this.tokenTransformer.groupIsAbstract(group)) {
        for (let subgroup of group.subgroups) {
          // Add each entry for each subgroup, and represent its tree into it
          newObject[this.tokenTransformer.safeGroupName(subgroup, options.naming)] = this.representTree(subgroup, allTokens, allGroups, writeSubObject, options)
        }

      } else {
        // Add each entry for each subgroup, and represent its tree into it
        newObject[this.tokenTransformer.safeGroupName(group, options.naming)] = this.representTree(group, allTokens, allGroups, writeSubObject, options)
      }

      // Add each entry for each token, writing to the same write root
      for (let token of TokenJSONBuilder.tokensOfGroup(group, allTokens)) {
        newObject[this.tokenTransformer.safeTokenName(token, options.naming)] = this.tokenTransformer.representToken(token, allTokens, allGroups, options)
      }
    }
    return newObject
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Lookup

  /** Find all tokens that belong to a certain group and retrieve them as objects */
  static tokensOfGroup(containingGroup: TokenGroup, allTokens: Array<Token>): Array<Token> {
    return allTokens.filter(t => containingGroup.tokenIds.indexOf(t.id) !== -1)
  }

  /** Retrieve chain of groups up to a specified group, ordered from parent to children */
  static referenceGroupChain(containingGroup: TokenGroup): Array<TokenGroup> {
    let iteratedGroup = containingGroup
    let chain = [containingGroup]
    while (iteratedGroup.parent) {
      chain.push(iteratedGroup.parent)
      iteratedGroup = iteratedGroup.parent
    }

    return chain.reverse()
  }
}
