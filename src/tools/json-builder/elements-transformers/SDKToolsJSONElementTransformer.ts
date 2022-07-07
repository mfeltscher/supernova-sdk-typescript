//
//  SDKToolsJSONElementTransformer.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { TokenType } from "../../../model/enums/SDKTokenType"
import { TokenGroup } from "../../../model/groups/SDKTokenGroup"
import { BorderToken } from "../../../model/tokens/SDKBorderToken"
import { ColorToken } from "../../../model/tokens/SDKColorToken"
import { FontToken } from "../../../model/tokens/SDKFontToken"
import { GradientToken } from "../../../model/tokens/SDKGradientToken"
import { MeasureToken } from "../../../model/tokens/SDKMeasureToken"
import { RadiusToken } from "../../../model/tokens/SDKRadiusToken"
import { ShadowToken } from "../../../model/tokens/SDKShadowToken"
import { TextToken } from "../../../model/tokens/SDKTextToken"
import { Token } from "../../../model/tokens/SDKToken"
import { BorderTokenValue, ColorTokenValue, FontTokenValue, GradientTokenValue, MeasureTokenValue, RadiusTokenValue, ShadowTokenValue, TextTokenValue, TypographyTokenValue } from "../../../model/tokens/SDKTokenValue"
import { TypographyToken } from "../../../model/tokens/SDKTypographyToken"
import _ from "lodash"
import { JSONBuilderNamingOption, TokenJSONBuilderOptionsInternal } from "../SDKToolsJSONBuilder"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Token transformer that allow generic transform of tokens to different destinations, like Style Dictionary or Figma Tokens representation */
export class TokenJSONElementTransformer {
  
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token Representation
  
  /** Represent a singular token as SD object */
  representToken(token: Token, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): Object {
    switch (token.tokenType) {
      case 'Color':
        return this.representColorToken(token as ColorToken, allTokens, allGroups, options)
      case 'Border':
        return this.representBorderToken(token as BorderToken, allTokens, allGroups, options)
      case 'Font':
        return this.representFontToken(token as FontToken, allTokens, allGroups, options)
      case 'Gradient':
        return this.representGradientToken(token as GradientToken, allTokens, allGroups, options)
      case 'Measure':
        return this.representMeasureToken(token as MeasureToken, allTokens, allGroups, options)
      case 'Radius':
        return this.representRadiusToken(token as RadiusToken, allTokens, allGroups, options)
      case 'Shadow':
        return this.representShadowToken(token as ShadowToken, allTokens, allGroups, options)
      case 'Text':
        return this.representTextToken(token as TextToken, allTokens, allGroups, options)
      case 'Typography':
        return this.representTypographyToken(token as TypographyToken, allTokens, allGroups, options)
    }
  }

  /** Represent full color token, including wrapping meta-information such as user description */
  representColorToken(token: ColorToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): Object {
    let value = this.representColorTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full border token, including wrapping meta-information such as user description */
  representBorderToken(token: BorderToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): Object {
    let value = this.representBorderTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full font token, including wrapping meta-information such as user description */
  representFontToken(token: FontToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): Object {
    let value = this.representFontTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full gradient token, including wrapping meta-information such as user description */
  representGradientToken(token: GradientToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): Object {
    let value = this.representGradientTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full measure token, including wrapping meta-information such as user description */
  representMeasureToken(token: MeasureToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): Object {
    let value = this.representMeasureTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full radius token, including wrapping meta-information such as user description */
  representRadiusToken(token: RadiusToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): Object {
    let value = this.representRadiusTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full shadow token, including wrapping meta-information such as user description */
  representShadowToken(token: ShadowToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): Object {
    let value = this.representShadowTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full text token, including wrapping meta-information such as user description */
  representTextToken(token: TextToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): Object {
    let value = this.representTextTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full typography token, including wrapping meta-information such as user description */
  representTypographyToken(token: TypographyToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): Object {
    let value = this.representTypographyTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token Value Representation

  /** Represent color token value either as reference or as plain representation */
  representColorTokenValue(value: ColorTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    throw new Error("Not implemented")
  }

  /** Represent radius token value either as reference or as plain representation */
  representRadiusTokenValue(value: RadiusTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    throw new Error("Not implemented")
  }

  /** Represent measure token value either as reference or as plain representation */
  representMeasureTokenValue(value: MeasureTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    throw new Error("Not implemented")
  }

  /** Represent font token value either as reference or as plain representation */
  representFontTokenValue(value: FontTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    throw new Error("Not implemented")
  }

  /** Represent text token value either as reference or as plain representation */
  representTextTokenValue(value: TextTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    throw new Error("Not implemented")
  }

  /** Represent typography token value either as reference or as plain representation */
  representTypographyTokenValue(value: TypographyTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    throw new Error("Not implemented")
  }

  /** Represent border token value either as reference or as plain representation */
  representBorderTokenValue(value: BorderTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    throw new Error("Not implemented")
  }

  /** Represent shadow token value either as reference or as plain representation */
  representShadowTokenValue(value: ShadowTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    throw new Error("Not implemented")
  }

  /** Represent gradient token value either as reference or as plain representation */
  representGradientTokenValue(value: GradientTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    throw new Error("Not implemented")
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Object wrappers

  /** Retrieve wrapper to certain token (referenced by name) pointing to token value */
  referenceWrapper(reference: string, options: TokenJSONBuilderOptionsInternal) {
    throw new Error("Not implemented")
  }

  /** Retrieve token wrapper containing its metadata and value information (used as container for each defined token) */
  tokenWrapper(token: Token, value: any, options: TokenJSONBuilderOptionsInternal): Object {

    let data = {
      value: value
    }

    if (options.includeType) {
      data["type"] = this.typeLabel(token.tokenType)
    }
    if (options.includeBrandId) {
      data["brandId"] = token.brandId
    }
    if (options.includeComments) {
      data["comment"] = token.description.length > 0 ? token.description : undefined
    }

    return data
  }
  

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Naming

  /** Create full reference name representing token. Such name can, for example, look like: [g1].[g2].[g3].[g4].[token-name] */
  referenceName(token: Token, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal) {
    // Find the group to which token belongs. This is really suboptimal and should be solved by the SDK to just provide the group reference
    let occurances = allGroups.filter(g => g.tokenIds.indexOf(token.id) !== -1)
    if (occurances.length === 0) {
      throw Error('JS: Unable to find token in any of the groups')
    }
    let containingGroup = occurances[0]
    let tokenPart = this.safeTokenName(token, options.naming)
    let groupParts = this.referenceGroupChain(containingGroup).map(g => this.safeGroupName(g, options.naming))
    if (!options.includeRootTypeNodes) {
      groupParts.splice(0, 1)
    }
    return [...groupParts, tokenPart].join('.')
  }

  /** Retrieve safe token name made out of normal token name
   * This replace spaces with dashes, also change anything non-alphanumeric char to it as well.
   * For example, ST&RK Industries will be changed to st-rk-industries
   */
  safeTokenName(token: Token, naming: JSONBuilderNamingOption) {
    // TODO: Naming
    let name = token.name
    return this.processedName(name, naming)
  }

  /** Retrieve safe group name made out of normal group name
   * This replace spaces with dashes, also change anything non-alphanumeric char to it as well.
   * For example, ST&RK Industries will be changed to st-rk-industries
   */
  safeGroupName(group: TokenGroup, naming: JSONBuilderNamingOption) {
    // TODO: Naming
    return group.name.replace(/\W+/g, '-').toLowerCase()
  }

  processedName(name: string, naming: JSONBuilderNamingOption) {

    switch (naming) {
      case JSONBuilderNamingOption.camelcase:
        return name.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
      case JSONBuilderNamingOption.kebabcase:
        return name.replace(/\W+/g, '-').toLowerCase()
      case JSONBuilderNamingOption.original:
        return name
      case JSONBuilderNamingOption.snakecase:
        return name.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map(x => x.toLowerCase()).join('_');
    }
  }

  /** Retrieve human-readable token type in unified fashion, used both as token type and as token master group */
  typeLabel(type: TokenType) {
    switch (type) {
      case 'Border':
        return 'border'
      case 'Color':
        return 'color'
      case 'Font':
        return 'font'
      case 'Gradient':
        return 'gradient'
      case 'Measure':
        return 'measure'
      case 'Radius':
        return 'radius'
      case 'Shadow':
        return 'shadow'
      case 'Text':
        return 'text'
      case 'Typography':
        return 'typography'
    }
  }

  /** Retrieve chain of groups up to a specified group, ordered from parent to children */
  referenceGroupChain(containingGroup: TokenGroup): Array<TokenGroup> {
    let iteratedGroup = containingGroup
    let chain = [containingGroup]
    while (iteratedGroup.parent) {
      chain.push(iteratedGroup.parent)
      iteratedGroup = iteratedGroup.parent
    }

    return chain.reverse()
  }
}
