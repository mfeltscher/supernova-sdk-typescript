//
//  SDKTokenResolver.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { TokenGroup } from "../.."
import { TokenType } from "../../model/enums/SDKTokenType"
import { ColorTokenRemoteData, MeasureTokenRemoteData, FontTokenRemoteData } from "../../model/tokens/remote/SDKRemoteTokenData"
import { TokenRemoteModel, ColorTokenRemoteModel, BorderTokenRemoteModel, FontTokenRemoteModel, GradientTokenRemoteModel, MeasureTokenRemoteModel, RadiusTokenRemoteModel, ShadowTokenRemoteModel, TextTokenRemoteModel, TypographyTokenRemoteModel, BlurTokenRemoteModel, GenericTokenRemoteModel } from "../../model/tokens/remote/SDKRemoteTokenModel"
import { ColorTokenRemoteValue, FontTokenRemoteValue, GradientStopRemoteValue, MeasureTokenRemoteValue } from "../../model/tokens/remote/SDKRemoteTokenValue"
import { BlurToken } from "../../model/tokens/SDKBlurToken"
import { BorderToken } from "../../model/tokens/SDKBorderToken"
import { ColorToken } from "../../model/tokens/SDKColorToken"
import { FontToken } from "../../model/tokens/SDKFontToken"
import { GenericToken } from "../../model/tokens/SDKGenericToken"
import { GradientToken } from "../../model/tokens/SDKGradientToken"
import { MeasureToken } from "../../model/tokens/SDKMeasureToken"
import { RadiusToken } from "../../model/tokens/SDKRadiusToken"
import { ShadowToken } from "../../model/tokens/SDKShadowToken"
import { TextToken } from "../../model/tokens/SDKTextToken"
import { Token } from "../../model/tokens/SDKToken"
import { BlurTokenValue, BorderTokenValue, ColorTokenValue, FontTokenValue, GenericTokenValue, GradientStopValue, GradientTokenValue, MeasureTokenValue, RadiusTokenValue, ShadowTokenValue, TextTokenValue, TypographyTokenValue } from "../../model/tokens/SDKTokenValue"
import { TypographyToken } from "../../model/tokens/SDKTypographyToken"
import { DesignSystemVersion } from "../SDKDesignSystemVersion"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class TokenResolver {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Configuration

  hashedTokens = new Map<string, TokenRemoteModel>()
  resolvedTokens = new Map<string, Token>()
  version: DesignSystemVersion

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(version: DesignSystemVersion) {
    this.version = version
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Resolution

  resolveTokenData(data: Array<TokenRemoteModel>, tokenGroups: Array<TokenGroup>): Array<Token> {
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
        let token = this.constructValueToken(rawToken)
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
        let token = this.constructReferencedToken(rawToken)
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
        let token = this.constructValueToken(rawToken)
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
        let token = this.constructReferencedToken(rawToken)
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
    return Array.from(this.resolvedTokens.values())
  }

  tokenTypeIsPure(tokenType: TokenType): boolean {
    return (
      tokenType === TokenType.color ||
      tokenType === TokenType.font ||
      tokenType === TokenType.measure ||
      tokenType === TokenType.text ||
      tokenType === TokenType.generic ||
      tokenType === TokenType.radius
    )
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Referencing

  constructReferencedToken(rawData: TokenRemoteModel): Token {
    let referenceId = rawData.data.aliasTo
    let referencedToken: Token
    if (this.resolvedTokens.get(referenceId)) {
      // If the referenced token already exists, we use it to create this token
      referencedToken = this.resolvedTokens.get(referenceId)
    } else {
      // Otherwise, we request token with the model data of the other token
      referencedToken = this.constructReferencedToken(this.hashedTokens.get(referenceId))
    }

    let token = this.constructResolvedToken(rawData, referencedToken)
    this.resolvedTokens.set(token.id, token)
    return token
  }

  constructResolvedToken(rawData: TokenRemoteModel, referencedToken: Token): Token {
    if (!rawData.data.aliasTo) {
      throw Error('Incorrectly creating reference token from value token')
    }

    let type = rawData.type
    // We make a copy of values for each constructed token
    switch (type) {
      case TokenType.color: {
        let ref = referencedToken as ColorToken
        return new ColorToken(this.version, rawData, { ...ref.value }, ref)
      }
      case TokenType.border: {
        let ref = referencedToken as BorderToken
        return new BorderToken(this.version, rawData, { ...ref.value }, ref)
      }
      case TokenType.font: {
        let ref = referencedToken as FontToken
        return new FontToken(this.version, rawData, { ...ref.value }, ref)
      }
      case TokenType.gradient: {
        let ref = referencedToken as GradientToken
        return new GradientToken(this.version, rawData, { ...ref.value }, ref)
      }
      case TokenType.measure: {
        let ref = referencedToken as MeasureToken
        return new MeasureToken(this.version, rawData, { ...ref.value }, ref)
      }
      case TokenType.radius: {
        let ref = referencedToken as RadiusToken
        return new RadiusToken(this.version, rawData, { ...ref.value }, ref)
      }
      case TokenType.shadow: {
        let ref = referencedToken as ShadowToken
        return new ShadowToken(this.version, rawData, { ...ref.value }, ref)
      }
      case TokenType.text: {
        let ref = referencedToken as TextToken
        return new TextToken(this.version, rawData, { ...ref.value }, ref)
      }
      case TokenType.typography: {
        let ref = referencedToken as TypographyToken
        return new TypographyToken(this.version, rawData, { ...ref.value }, ref)
      }
      case TokenType.blur: {
        let ref = referencedToken as BlurToken
        return new BlurToken(this.version, rawData, { ...ref.value }, ref)
      }
      case TokenType.generic: {
        let ref = referencedToken as GenericToken
        return new GenericToken(this.version, rawData, { ...ref.value }, ref)
      }
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token construction

  constructValueToken(rawData: TokenRemoteModel): Token {
    if (rawData.data.aliasTo) {
      throw Error('Incorrectly creating value token from referenced token')
    }

    let type = rawData.type
    switch (type) {
      case TokenType.color:
        return this.constructColorToken(rawData as ColorTokenRemoteModel)
      case TokenType.border:
        return this.constructBorderToken(rawData as BorderTokenRemoteModel)
      case TokenType.font:
        return this.constructFontToken(rawData as FontTokenRemoteModel)
      case TokenType.gradient:
        return this.constructGradientToken(rawData as GradientTokenRemoteModel)
      case TokenType.measure:
        return this.constructMeasureToken(rawData as MeasureTokenRemoteModel)
      case TokenType.radius:
        return this.constructRadiusToken(rawData as RadiusTokenRemoteModel)
      case TokenType.shadow:
        return this.constructShadowToken(rawData as ShadowTokenRemoteModel)
      case TokenType.text:
        return this.constructTextToken(rawData as TextTokenRemoteModel)
      case TokenType.typography:
        return this.constructTypographyToken(rawData as TypographyTokenRemoteModel)
      case TokenType.blur: 
        return this.constructBlurToken(rawData as BlurTokenRemoteModel)
      case TokenType.generic:
        return this.constructGenericToken(rawData as GenericTokenRemoteModel)
    }
  }

  constructColorToken(rawData: ColorTokenRemoteModel): ColorToken {
    let value = this.constructColorValue(rawData.data.value)
    return new ColorToken(this.version, rawData, value, null)
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

  constructTextToken(rawData: TextTokenRemoteModel): TextToken {
    let value: TextTokenValue = {
      text: rawData.data.value,
      referencedToken: null
    }
    return new TextToken(this.version, rawData, value, null)
  }

  constructGenericToken(rawData: GenericTokenRemoteModel): TextToken {
    let value: GenericTokenValue = {
      text: rawData.data.value,
      referencedToken: null
    }
    return new GenericToken(this.version, rawData, value, null)
  }

  constructMeasureToken(rawData: MeasureTokenRemoteModel): MeasureToken {
    let value = this.constructMeasureValue(rawData.data.value)
    return new MeasureToken(this.version, rawData, value, null)
  }

  constructMeasureValue(rawData: MeasureTokenRemoteValue): MeasureTokenValue {
    return {
      unit: rawData.unit,
      measure: rawData.measure,
      referencedToken: null
    }
  }

  constructFontToken(rawData: FontTokenRemoteModel): FontToken {
    let value = this.constructFontValue(rawData.data.value)
    return new FontToken(this.version, rawData, value, null)
  }

  constructFontValue(rawData: FontTokenRemoteValue): FontTokenValue {
    return {
      family: rawData.family,
      subfamily: rawData.subfamily,
      referencedToken: null
    }
  }

  constructGradientToken(rawData: GradientTokenRemoteModel): GradientToken {
    let value: GradientTokenValue = {
      to: rawData.data.value.to,
      from: rawData.data.value.from,
      type: rawData.data.value.type,
      aspectRatio: rawData.data.value.aspectRatio,
      stops: this.constructGradientStops(rawData.data.value.stops),
      referencedToken: null
    }
    return new GradientToken(this.version, rawData, value, null)
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

  constructRadiusToken(rawData: RadiusTokenRemoteModel): RadiusToken {
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
    return new RadiusToken(this.version, rawData, value, null)
  }

  constructShadowToken(rawData: ShadowTokenRemoteModel): ShadowToken {
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
    return new ShadowToken(this.version, rawData, value, null)
  }

  constructBorderToken(rawData: BorderTokenRemoteModel): BorderToken {
    let value: BorderTokenValue = {
      color: this.resolveReferencedColorTokenValue(rawData.data.value.color),
      width: this.resolveReferencedMeasureTokenValue(rawData.data.value.width),
      position: rawData.data.value.position,
      referencedToken: null
    }
    return new BorderToken(this.version, rawData, value, null)
  }

  constructTypographyToken(rawData: TypographyTokenRemoteModel): TypographyToken {
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
    return new TypographyToken(this.version, rawData, value, null)
  }

  constructBlurToken(rawData: BlurTokenRemoteModel): BlurToken {
    let value: BlurTokenValue = {
      type: rawData.data.value.type,
      radius: this.resolveReferencedMeasureTokenValue(rawData.data.value.radius),
      referencedToken: null
    }
    return new BlurToken(this.version, rawData, value, null)
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
