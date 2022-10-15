//
//  SDKTokenResolver.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { TokenOrigin } from '../..'
import {
  ElementProperty,
  ElementPropertyRemoteModel,
  ElementPropertyTargetElementType
} from '../../model/elements/SDKElementProperty'
import {
  ElementPropertyValue,
  ElementPropertyValueRemoteModel
} from '../../model/elements/values/SDKElementPropertyValue'
import { TokenType } from '../../model/enums/SDKTokenType'
import { TokenGroup } from '../../model/groups/SDKTokenGroup'
import { ThemeUtilities } from '../../model/themes/SDKThemeUtilities'
import { TokenTheme, TokenThemeRemoteModel } from '../../model/themes/SDKTokenTheme'
import { TokenThemeOverrideRemoteModel } from '../../model/themes/SDKTokenThemeOverride'
import {
  ColorTokenRemoteData,
  MeasureTokenRemoteData,
  FontTokenRemoteData,
  TextTokenRemoteData,
  GenericTokenRemoteData,
  BlurTokenRemoteData,
  BorderTokenRemoteData,
  GradientTokenRemoteData,
  RadiusTokenRemoteData,
  ShadowTokenRemoteData,
  TypographyTokenRemoteData
} from '../../model/tokens/remote/SDKRemoteTokenData'
import {
  TokenRemoteModel,
  ColorTokenRemoteModel,
  BorderTokenRemoteModel,
  FontTokenRemoteModel,
  GradientTokenRemoteModel,
  MeasureTokenRemoteModel,
  RadiusTokenRemoteModel,
  ShadowTokenRemoteModel,
  TextTokenRemoteModel,
  TypographyTokenRemoteModel,
  BlurTokenRemoteModel,
  GenericTokenRemoteModel
} from '../../model/tokens/remote/SDKRemoteTokenModel'
import {
  ColorTokenRemoteValue,
  FontTokenRemoteValue,
  GradientStopRemoteValue,
  MeasureTokenRemoteValue,
  TextTokenRemoteValue
} from '../../model/tokens/remote/SDKRemoteTokenValue'
import { BlurToken } from '../../model/tokens/SDKBlurToken'
import { BorderToken } from '../../model/tokens/SDKBorderToken'
import { ColorToken } from '../../model/tokens/SDKColorToken'
import { FontToken } from '../../model/tokens/SDKFontToken'
import { GenericToken } from '../../model/tokens/SDKGenericToken'
import { GradientToken } from '../../model/tokens/SDKGradientToken'
import { MeasureToken } from '../../model/tokens/SDKMeasureToken'
import { RadiusToken } from '../../model/tokens/SDKRadiusToken'
import { ShadowToken } from '../../model/tokens/SDKShadowToken'
import { TextToken } from '../../model/tokens/SDKTextToken'
import { Token } from '../../model/tokens/SDKToken'
import {
  AnyToken,
  AnyTokenValue,
  BlurTokenValue,
  BorderTokenValue,
  ColorTokenValue,
  FontTokenValue,
  GenericTokenValue,
  GradientStopValue,
  GradientTokenValue,
  MeasureTokenValue,
  RadiusTokenValue,
  ShadowTokenValue,
  TextTokenValue,
  TokenValue,
  TypographyTokenValue
} from '../../model/tokens/SDKTokenValue'
import { TypographyToken } from '../../model/tokens/SDKTypographyToken'
import { DesignSystemVersion } from '../SDKDesignSystemVersion'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class TokenResolver {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Configuration

  hashedTokens = new Map<string, TokenRemoteModel>()
  resolvedTokens = new Map<string, Token>()

  hashedOverrides = new Map<string, TokenThemeOverrideRemoteModel>()
  hashedReconstructedOverrides = new Map<string, Token>()
  resolvedOverrides = new Map<string, Token>()

  version: DesignSystemVersion

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(version: DesignSystemVersion) {
    this.version = version
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Resolution

  resolveTokenData(
    data: Array<TokenRemoteModel>,
    tokenGroups: Array<TokenGroup>,
    properties: Array<ElementPropertyRemoteModel>,
    values: Array<ElementPropertyValueRemoteModel>
  ): Array<Token> {
    let resolvedProperties = properties
      .map(p => new ElementProperty(p))
      .filter(p => p.targetElementType === ElementPropertyTargetElementType.token)
    let resolvedValues = values.map(v => new ElementPropertyValue(v))

    for (let rawToken of data) {
      this.hashedTokens.set(rawToken.persistentId, rawToken)
    }

    /*
     * Step 1: Create pure tokens that are not references
     */
    for (let rawToken of data) {
      // Skip creation of all tokens that can have reference
      if (rawToken.data.aliasTo) {
        continue
      }
      // Construct raw colors, fonts, texts, radii and measures first
      if (this.tokenTypeIsPure(rawToken.type)) {
        let token = this.constructValueToken(rawToken, resolvedProperties, resolvedValues)
        this.resolvedTokens.set(token.id, token)
      }
    }
    /*
     * Step 2: Create pure tokens that are references. This will provide us with all possible tokens resolved for mixins later
     */
    for (let rawToken of data) {
      // This time, skip creation of all raw tokens because we already have them
      if (!rawToken.data.aliasTo) {
        continue
      }
      // Construct references for pure tokens, if any
      if (this.tokenTypeIsPure(rawToken.type) && !this.resolvedTokens.get(rawToken.persistentId)) {
        let token = this.constructReferencedToken(rawToken, resolvedProperties, resolvedValues)
        this.resolvedTokens.set(token.id, token)
      }
    }

    /*
     * Step 3: Create mixin tokens that can potentially reference pure resolved tokens
     */
    for (let rawToken of data) {
      // Skip creation of all tokens that can have reference
      if (rawToken.data.aliasTo) {
        continue
      }
      // Construct raw typography, gradient, shadow and border colors
      if (!this.tokenTypeIsPure(rawToken.type)) {
        let token = this.constructValueToken(rawToken, resolvedProperties, resolvedValues)
        this.resolvedTokens.set(token.id, token)
      }
    }

    /*
     * Step 4: Create all remaining tokens, as all pure tokens that can be references and all value tokens with possible mixins were all resolved.
     */
    for (let rawToken of data) {
      // Skip creation of all tokens that are not references
      if (!rawToken.data.aliasTo) {
        continue
      }
      if (!this.resolvedTokens.get(rawToken.persistentId)) {
        // We create the token only when it wasn't created already. In some cases, this can happen when there are multiple reference levels
        let token = this.constructReferencedToken(rawToken, resolvedProperties, resolvedValues)
        this.resolvedTokens.set(token.id, token)
      }
    }

    /*
     * Step 5: Assign parents to the tree
     */
    for (let tokenGroup of tokenGroups) {
      for (let childId of tokenGroup.childrenIds) {
        let possibleToken = this.resolvedTokens.get(childId)
        if (possibleToken) {
          // If object exists, assign parent to it. Not existing means it is a group
          possibleToken.parent = tokenGroup
        }
      }
    }

    // Retrieve all properly resolved tokens
    let tokens = Array.from(this.resolvedTokens.values())

    // Temporary: Fix shadow, gradient and blur tokens
    this.fixMultilayerShadowTokens(tokens.filter(t => t.tokenType === TokenType.shadow) as Array<ShadowToken>)
    this.fixMultilayerGradientTokens(tokens.filter(t => t.tokenType === TokenType.gradient) as Array<GradientToken>)
    this.fixMultilayerBlurTokens(tokens.filter(t => t.tokenType === TokenType.blur) as Array<BlurToken>)

    // Retrieve all properly resolved tokens
    return tokens
  }

  tokenTypeIsPure(tokenType: TokenType): boolean {
    return (
      tokenType === TokenType.color ||
      tokenType === TokenType.font ||
      tokenType === TokenType.measure ||
      tokenType === TokenType.text ||
      tokenType === TokenType.generic
    )
  }

  resolveThemeData(data: TokenThemeRemoteModel, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): TokenTheme {
    let themeId = data.id

    // Build cache for performance
    for (let token of tokens) {
      this.resolvedTokens.set(token.id, token)
    }

    for (let override of data.overrides) {
      this.hashedOverrides.set(override.tokenPersistentId, override)
    }

    /*
     * Step 1: Construct containers for tokens that have overrides - but don't assign value to them just yet
     */
    let overrideData = data.overrides
    for (let override of overrideData) {
      let token = this.resolvedTokens.get(override.tokenPersistentId)
      let origin = override.origin
      if (!token) {
        throw new Error(
          `Unable to resolve token ${override.tokenPersistentId} for theme ${data.id} as based token was not found`
        )
      }
      let replica = this.makeThemedValuelessTokenReplica(token, themeId, origin)
      this.hashedReconstructedOverrides.set(replica.id, replica)
    }

    /*
     * Step 2: Create map with all tokens, using core tokens and the theme itself so we have all tokens prepared
     */
    for (let override of overrideData) {
      // Skip creation of all tokens that can have reference
      if (override.data.aliasTo) {
        continue
      }
      console.log(override)
      // Construct raw colors, fonts, texts, radii and measures first
      if (this.tokenTypeIsPure(override.type)) {
        console.log(override.data)
        if (!override.data.value) {
          console.log('failure')
          console.log(override.data.value)
          throw new Error(
            `Override must always have alias or value, but ${override.tokenPersistentId} provided neither (1: raw)`
          )
        }
        // There is no reference to be solved, so we just assume we can create referenced without issues
        let replica = this.hashedReconstructedOverrides.get(override.tokenPersistentId)
        switch (override.type) {
          case TokenType.color:
            ;(replica as ColorToken).value = this.constructColorValue((override.data as ColorTokenRemoteData).value)
            break
          case TokenType.font:
            ;(replica as FontToken).value = this.constructFontValue((override.data as FontTokenRemoteData).value)
            break
          case TokenType.measure:
            ;(replica as MeasureToken).value = this.constructMeasureValue(
              (override.data as MeasureTokenRemoteData).value
            )
            break
          case TokenType.text:
            ;(replica as TextToken).value = this.constructTextLikeTokenValue(
              (override.data as TextTokenRemoteData).value
            )
            break
          case TokenType.generic:
            ;(replica as GenericToken).value = this.constructTextLikeTokenValue(
              (override.data as GenericTokenRemoteData).value
            )
            break
        }

        this.resolvedOverrides.set(replica.id, replica)
      }
    }

    /*
     * Step 3: Create values for theme overrides that are raw and pure tokens
     */
    for (let override of overrideData) {
      // This time, skip creation of all raw tokens because we already have them
      if (!override.data.aliasTo) {
        continue
      }
      // Construct references for pure tokens, if any
      if (this.tokenTypeIsPure(override.type) && !this.resolvedOverrides.get(override.tokenPersistentId)) {
        let resolvedOverride = this.resolvedOverrides.get(override.tokenPersistentId)
        if (!resolvedOverride) {
          // Only construct reference if it wasn't constructed already
          let replica = this.constructReferencedThemedToken(override, themeId)
          this.resolvedOverrides.set(replica.id, replica)
        }
      }
    }

    /*
     * Step 4: Create pure tokens that are references. End of this step will provide us with all possible tokens resolved for mixins later
     */
    for (let override of overrideData) {
      // Skip creation of all tokens that can have reference in this step
      if (override.data.aliasTo) {
        continue
      }
      // Construct raw typography, gradient, shadow and border colors
      if (!this.tokenTypeIsPure(override.type)) {
        let token = this.constructValueToken(rawToken, resolvedProperties, resolvedValues)
        this.resolvedTokens.set(token.id, token)
      }
    }

    /*
     * Step 5: Create mixin tokens that can potentially reference pure resolved tokens
     */

    /*
     * Step 6: Create all remaining tokens, as all pure tokens that can be references and all value tokens with possible mixins were all resolved.
     */

    let theme = new TokenTheme(data, this.version)
    theme.overriddenTokens = Array.from(this.resolvedOverrides.values())
    return theme
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token replication

  makeThemedValuelessTokenReplica(token: Token, themeId: string, origin: TokenOrigin | null): Token {
    let replica = ThemeUtilities.replicateTokenAsThemePrefabWithoutValue(token, themeId, origin, this.version)
    replica.themeId = themeId

    return replica
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Temporary: Data structure manipulation

  fixMultilayerShadowTokens(tokens: Array<ShadowToken>) {
    for (let token of tokens) {
      token.shadowLayers = this.findAssociatedTokens(token, tokens)
    }
  }

  fixMultilayerGradientTokens(tokens: Array<GradientToken>) {
    for (let token of tokens) {
      token.gradientLayers = this.findAssociatedTokens(token, tokens)
    }
  }

  fixMultilayerBlurTokens(tokens: Array<BlurToken>) {
    for (let token of tokens) {
      token.blurLayers = this.findAssociatedTokens(token, tokens)
    }
  }

  findAssociatedTokens<T extends Token>(token: T, tokens: Array<T>): Array<T> {
    if (!token.origin?.id || !token.parent) {
      return [token]
    }

    // Find all tokens with same origin
    let tokenId = this.actualOriginTokenId(token.origin.id)
    let matchingTokens = tokens.filter(t => this.actualOriginTokenId(t.origin?.id) === tokenId)

    // Sort by the parent, and set virtual tokens
    let sortedTokens = new Array<T>()
    let index = 0
    for (let id of token.parent.tokenIds) {
      for (let matchingToken of matchingTokens) {
        if (matchingToken.id === id) {
          sortedTokens.push(matchingToken)
          if (index === 0) {
            ;(matchingToken as any).isVirtual = false
          } else {
            ;(matchingToken as any).isVirtual = true
          }
          index++
        }
      }
    }

    return sortedTokens
  }

  actualOriginTokenId(id: string | null): string {
    if (id && id.length > 0) {
      return id.split(',')[0]
    }
    return null
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Referencing

  constructReferencedToken(
    rawData: TokenRemoteModel,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): Token {
    let referenceId = rawData.data.aliasTo
    let referencedToken: Token
    if (this.resolvedTokens.get(referenceId)) {
      // If the referenced token already exists, we use it to create this token
      referencedToken = this.resolvedTokens.get(referenceId)
    } else if (this.hashedTokens.get(referenceId)) {
      // Otherwise, we request token with the model data of the other token coming from the base set of tokens
      referencedToken = this.constructReferencedToken(this.hashedTokens.get(referenceId), properties, values)
    } else {
      // This situation can't happen because we are either resolving base tokens and using constructed references,
      // or resolving theme and this function should not be used at all
      throw new Error(
        "Data integrity problem detected, can't start creating reference for themed tokens when resolving base values"
      )
    }

    let token = this.constructResolvedToken(rawData, referencedToken, properties, values)
    this.resolvedTokens.set(token.id, token)
    return token
  }

  constructReferencedThemedToken(rawData: TokenThemeOverrideRemoteModel, themeId: string): Token {
    let referenceId = rawData.data.aliasTo
    let referencedToken: Token
    if (this.resolvedOverrides.get(referenceId)) {
      // If the reference token exists from the current theme that is being resolved (note, that might not be always), prioritize reference first
      referencedToken = this.resolvedOverrides.get(referenceId)
    } else if (this.hashedOverrides.get(referenceId)) {
      // If the reference doesn't exists, there are two possible options:
      // The first one is that we are creating reference token within current theme, if provided. In this case, we construct
      // token from the override that we also construct
      referencedToken = this.constructReferencedThemedToken(this.hashedOverrides.get(referenceId), themeId)
    } else if (this.resolvedTokens.get(referenceId)) {
      // If the referenced token already exists, we use it to create this token
      referencedToken = this.resolvedTokens.get(referenceId)
    } else {
      // This situation can't happen because we are either resolving theme and using constructed references,
      // or resolving base tokens and this function should not be used at all
      throw new Error(
        "Data integrity problem detected, can't start creating reference for base tokens when resolving themes"
      )
    }

    let token = this.constructResolvedThemedToken(rawData, referencedToken, themeId)
    this.resolvedOverrides.set(token.id, token)
    return token
  }

  constructResolvedThemedToken(rawData: TokenThemeOverrideRemoteModel, referencedToken: Token, themeId: string): Token {
    if (!rawData.data.aliasTo) {
      throw Error(`Incorrectly creating reference themed token ${rawData.tokenPersistentId} from pure value token`)
    }

    let baseToken = this.resolvedTokens.get(rawData.tokenPersistentId)
    let replica = ThemeUtilities.replicateTokenAsThemePrefabWithoutValue(
      baseToken,
      themeId,
      rawData.origin,
      this.version
    )

    // Each token has some value, let's use it
    let value = (referencedToken as AnyToken).value
    ;(replica as AnyToken).value = value

    return replica
  }

  constructResolvedToken(
    rawData: TokenRemoteModel,
    referencedToken: Token,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): Token {
    if (!rawData.data.aliasTo) {
      throw Error('Incorrectly creating reference token from value token')
    }

    let type = rawData.type
    // We make a copy of values for each constructed token
    switch (type) {
      case TokenType.color: {
        let ref = referencedToken as ColorToken
        return new ColorToken(this.version, rawData, { ...ref.value }, ref, properties, values)
      }
      case TokenType.border: {
        let ref = referencedToken as BorderToken
        return new BorderToken(this.version, rawData, { ...ref.value }, ref, properties, values)
      }
      case TokenType.font: {
        let ref = referencedToken as FontToken
        return new FontToken(this.version, rawData, { ...ref.value }, ref, properties, values)
      }
      case TokenType.gradient: {
        let ref = referencedToken as GradientToken
        return new GradientToken(this.version, rawData, { ...ref.value }, ref, properties, values)
      }
      case TokenType.measure: {
        let ref = referencedToken as MeasureToken
        return new MeasureToken(this.version, rawData, { ...ref.value }, ref, properties, values)
      }
      case TokenType.radius: {
        let ref = referencedToken as RadiusToken
        return new RadiusToken(this.version, rawData, { ...ref.value }, ref, properties, values)
      }
      case TokenType.shadow: {
        let ref = referencedToken as ShadowToken
        return new ShadowToken(this.version, rawData, { ...ref.value }, ref, properties, values)
      }
      case TokenType.text: {
        let ref = referencedToken as TextToken
        return new TextToken(this.version, rawData, { ...ref.value }, ref, properties, values)
      }
      case TokenType.typography: {
        let ref = referencedToken as TypographyToken
        return new TypographyToken(this.version, rawData, { ...ref.value }, ref, properties, values)
      }
      case TokenType.blur: {
        let ref = referencedToken as BlurToken
        return new BlurToken(this.version, rawData, { ...ref.value }, ref, properties, values)
      }
      case TokenType.generic: {
        let ref = referencedToken as GenericToken
        return new GenericToken(this.version, rawData, { ...ref.value }, ref, properties, values)
      }
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token construction

  constructValueToken(
    rawData: TokenRemoteModel,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): Token {
    if (rawData.data.aliasTo) {
      throw Error('Incorrectly creating value token from referenced token')
    }

    let type = rawData.type
    switch (type) {
      case TokenType.color:
        return this.constructColorToken(rawData as ColorTokenRemoteModel, properties, values)
      case TokenType.border:
        return this.constructBorderToken(rawData as BorderTokenRemoteModel, properties, values)
      case TokenType.font:
        return this.constructFontToken(rawData as FontTokenRemoteModel, properties, values)
      case TokenType.gradient:
        return this.constructGradientToken(rawData as GradientTokenRemoteModel, properties, values)
      case TokenType.measure:
        return this.constructMeasureToken(rawData as MeasureTokenRemoteModel, properties, values)
      case TokenType.radius:
        return this.constructRadiusToken(rawData as RadiusTokenRemoteModel, properties, values)
      case TokenType.shadow:
        return this.constructShadowToken(rawData as ShadowTokenRemoteModel, properties, values)
      case TokenType.text:
        return this.constructTextToken(rawData as TextTokenRemoteModel, properties, values)
      case TokenType.typography:
        return this.constructTypographyToken(rawData as TypographyTokenRemoteModel, properties, values)
      case TokenType.blur:
        return this.constructBlurToken(rawData as BlurTokenRemoteModel, properties, values)
      case TokenType.generic:
        return this.constructGenericToken(rawData as GenericTokenRemoteModel, properties, values)
    }
  }

  constructThemedValueToken(override: TokenThemeOverrideRemoteModel, themeId: string): Token {
    if (override.data.aliasTo) {
      throw Error('Incorrectly creating themed value token from referenced token')
    }

    let baseToken = this.resolvedTokens.get(override.tokenPersistentId)
    let replica = ThemeUtilities.replicateTokenAsThemePrefabWithoutValue(
      baseToken,
      themeId,
      override.origin,
      this.version
    )

    let type = override.type
    let value: AnyTokenValue

    switch (type) {
      case TokenType.color:
        ;(replica as ColorToken).value = this.constructColorValue((override.data as ColorTokenRemoteData).value)
        break
      case TokenType.font:
        ;(replica as FontToken).value = this.constructFontValue((override.data as FontTokenRemoteData).value)
        break
      case TokenType.measure:
        ;(replica as MeasureToken).value = this.constructMeasureValue((override.data as MeasureTokenRemoteData).value)
        break
      case TokenType.text:
        ;(replica as TextToken).value = this.constructTextLikeTokenValue((override.data as TextTokenRemoteData).value)
        break
      case TokenType.generic:
        ;(replica as GenericToken).value = this.constructTextLikeTokenValue(
          (override.data as GenericTokenRemoteData).value
        )
        break
      case TokenType.blur:
        ;(replica as BlurToken).value = this.constructBlurTokenValue((override.data as BlurTokenRemoteData).value)
        break
      case TokenType.border:
        ;(replica as BorderToken).value = this.constructBorderTokenValue((override.data as BorderTokenRemoteData).value)
        break
      case TokenType.gradient:
        ;(replica as GradientToken).value = this.constructGradientTokenValue(
          (override.data as GradientTokenRemoteData).value
        )
        break
      case TokenType.radius:
        ;(replica as RadiusToken).value = this.constructRadiusTokenValue((override.data as RadiusTokenRemoteData).value)
        break
      case TokenType.shadow:
        ;(replica as ShadowToken).value = this.constructShadowTokenValue((override.data as ShadowTokenRemoteData).value)
        break
      case TokenType.typography:
        ;(replica as TypographyToken).value = this.constructTypographyTokenValue(
          (override.data as TypographyTokenRemoteData).value
        )
        break
    }
  }

  constructColorToken(
    rawData: ColorTokenRemoteModel,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): ColorToken {
    let value = this.constructColorValue(rawData.data.value)
    return new ColorToken(this.version, rawData, value, null, properties, values)
  }

  constructColorValue(rawValue: ColorTokenRemoteValue): ColorTokenValue {
    let hex = rawValue.substr(1) // RRGGBBAA
    let r = parseInt(hex.slice(0, 2), 16)
    let g = parseInt(hex.slice(2, 4), 16)
    let b = parseInt(hex.slice(4, 6), 16)
    let a = parseInt(hex.slice(6, 8), 16)
    return {
      hex: hex,
      r: r,
      g: g,
      b: b,
      a: a,
      referencedToken: null
    }
  }

  constructTextToken(
    rawData: TextTokenRemoteModel,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): TextToken {
    let value = this.constructTextLikeTokenValue(rawData.data.value)
    return new TextToken(this.version, rawData, value, null, properties, values)
  }

  constructGenericToken(
    rawData: GenericTokenRemoteModel,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): TextToken {
    let value = this.constructTextLikeTokenValue(rawData.data.value)
    return new GenericToken(this.version, rawData, value, null, properties, values)
  }

  constructTextLikeTokenValue(rawData: TextTokenRemoteValue): TextTokenValue | GenericTokenValue {
    let value = {
      text: rawData,
      referencedToken: null
    }
    return value
  }

  constructMeasureToken(
    rawData: MeasureTokenRemoteModel,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): MeasureToken {
    let value = this.constructMeasureValue(rawData.data.value)
    return new MeasureToken(this.version, rawData, value, null, properties, values)
  }

  constructMeasureValue(rawData: MeasureTokenRemoteValue): MeasureTokenValue {
    return {
      unit: rawData.unit,
      measure: rawData.measure,
      referencedToken: null
    }
  }

  constructFontToken(
    rawData: FontTokenRemoteModel,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): FontToken {
    let value = this.constructFontValue(rawData.data.value)
    return new FontToken(this.version, rawData, value, null, properties, values)
  }

  constructFontValue(rawData: FontTokenRemoteValue): FontTokenValue {
    return {
      family: rawData.family,
      subfamily: rawData.subfamily,
      referencedToken: null
    }
  }

  constructGradientToken(
    rawData: GradientTokenRemoteModel,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): GradientToken {
    let value: GradientTokenValue = {
      to: rawData.data.value.to,
      from: rawData.data.value.from,
      type: rawData.data.value.type,
      aspectRatio: rawData.data.value.aspectRatio,
      stops: this.constructGradientStops(rawData.data.value.stops),
      referencedToken: null
    }
    return new GradientToken(this.version, rawData, value, null, properties, values)
  }

  constructGradientStops(rawData: Array<GradientStopRemoteValue>): Array<GradientStopValue> {
    return rawData.map(stop => {
      return {
        position: stop.position,
        color: this.resolveReferencedColorTokenValue(stop.color),
        referencedToken: null
      }
    })
  }

  constructRadiusToken(
    rawData: RadiusTokenRemoteModel,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): RadiusToken {
    let value: RadiusTokenValue = {
      radius: this.resolveReferencedMeasureTokenValue(rawData.data.value.radius),
      topLeft: rawData.data.value.topLeft ? this.resolveReferencedMeasureTokenValue(rawData.data.value.topLeft) : null,
      topRight: rawData.data.value.topRight
        ? this.resolveReferencedMeasureTokenValue(rawData.data.value.topRight)
        : null,
      bottomLeft: rawData.data.value.bottomLeft
        ? this.resolveReferencedMeasureTokenValue(rawData.data.value.bottomLeft)
        : null,
      bottomRight: rawData.data.value.bottomRight
        ? this.resolveReferencedMeasureTokenValue(rawData.data.value.bottomRight)
        : null,
      referencedToken: null
    }
    return new RadiusToken(this.version, rawData, value, null, properties, values)
  }

  constructShadowToken(
    rawData: ShadowTokenRemoteModel,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): ShadowToken {
    let value: ShadowTokenValue = {
      color: this.resolveReferencedColorTokenValue(rawData.data.value.color),
      x: this.resolveReferencedMeasureTokenValue(rawData.data.value.x),
      y: this.resolveReferencedMeasureTokenValue(rawData.data.value.y),
      radius: this.resolveReferencedMeasureTokenValue(rawData.data.value.radius),
      spread: this.resolveReferencedMeasureTokenValue(rawData.data.value.spread),
      opacity: rawData.data.value.opacity,
      type: rawData.data.value.type,
      referencedToken: null
    }
    return new ShadowToken(this.version, rawData, value, null, properties, values)
  }

  constructBorderToken(
    rawData: BorderTokenRemoteModel,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): BorderToken {
    let value: BorderTokenValue = {
      color: this.resolveReferencedColorTokenValue(rawData.data.value.color),
      width: this.resolveReferencedMeasureTokenValue(rawData.data.value.width),
      position: rawData.data.value.position,
      referencedToken: null
    }
    return new BorderToken(this.version, rawData, value, null, properties, values)
  }

  constructTypographyToken(
    rawData: TypographyTokenRemoteModel,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): TypographyToken {
    let value: TypographyTokenValue = {
      font: this.resolveReferencedFontTokenValue(rawData.data.value.font),
      fontSize: this.resolveReferencedMeasureTokenValue(rawData.data.value.fontSize),
      textDecoration: rawData.data.value.textDecoration,
      textCase: rawData.data.value.textCase,
      letterSpacing: this.resolveReferencedMeasureTokenValue(rawData.data.value.letterSpacing),
      lineHeight: rawData.data.value.lineHeight
        ? this.resolveReferencedMeasureTokenValue(rawData.data.value.lineHeight)
        : null,
      paragraphIndent: this.resolveReferencedMeasureTokenValue(rawData.data.value.paragraphIndent),
      paragraphSpacing: this.resolveReferencedMeasureTokenValue(rawData.data.value.paragraphSpacing),
      referencedToken: null
    }
    return new TypographyToken(this.version, rawData, value, null, properties, values)
  }

  constructBlurToken(
    rawData: BlurTokenRemoteModel,
    properties: Array<ElementProperty>,
    values: Array<ElementPropertyValue>
  ): BlurToken {
    let value: BlurTokenValue = {
      type: rawData.data.value.type,
      radius: this.resolveReferencedMeasureTokenValue(rawData.data.value.radius),
      referencedToken: null
    }
    return new BlurToken(this.version, rawData, value, null, properties, values)
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token value resolution

  /** Resolve token color value - meaning we are not creating new tokens, and require raw tokens to be already present */
  resolveReferencedColorTokenValue(token: ColorTokenRemoteData): ColorTokenValue {
    if (token.aliasTo) {
      const resolved = this.resolvedTokens.get(token.aliasTo) as ColorToken
      return {
        ...resolved.value,
        referencedToken: resolved
      }
    } else {
      return this.constructColorValue(token.value)
    }
  }

  /** Resolve token measure value - meaning we are not creating new tokens, and require raw tokens to be already present */
  resolveReferencedMeasureTokenValue(token: MeasureTokenRemoteData): MeasureTokenValue {
    if (token.aliasTo) {
      const resolved = this.resolvedTokens.get(token.aliasTo) as MeasureToken
      return {
        ...resolved.value,
        referencedToken: resolved
      }
    } else {
      return this.constructMeasureValue(token.value)
    }
  }

  /** Resolve token font value - meaning we are not creating new tokens, and require raw tokens to be already present */
  resolveReferencedFontTokenValue(token: FontTokenRemoteData): FontTokenValue {
    if (token.aliasTo) {
      const resolved = this.resolvedTokens.get(token.aliasTo) as FontToken
      return {
        ...resolved.value,
        referencedToken: resolved
      }
    } else {
      return this.constructFontValue(token.value)
    }
  }
}
