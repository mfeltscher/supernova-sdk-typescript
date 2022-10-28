//
//  SDKTokenComparator.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import {
  BlurToken,
  BorderToken,
  ColorToken,
  FontToken,
  GenericToken,
  GradientToken,
  MeasureToken,
  RadiusToken,
  ShadowToken,
  TextToken,
  Token,
  TypographyToken
} from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { ElementProperty } from '../elements/SDKElementProperty'
import { ElementPropertyValue } from '../elements/values/SDKElementPropertyValue'
import { TokenType } from '../enums/SDKTokenType'
import { TokenGroup } from '../groups/SDKTokenGroup'
import { TokenOrigin } from '../support/SDKTokenOrigin'
import { TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import {
  AnyTokenValue,
  BlurTokenValue,
  BorderTokenValue,
  ColorTokenValue,
  FontTokenValue,
  GenericTokenValue,
  GradientTokenValue,
  MeasureTokenValue,
  RadiusTokenValue,
  ShadowTokenValue,
  TextTokenValue,
  TokenValue,
  TypographyTokenValue,
  GradientStopValue
} from './SDKTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class TokenComparator {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Comparators

  static isEqualTokenValue(a: Token, b: Token): boolean {
    if (a.tokenType !== b.tokenType) {
      return false
    }

    switch (a.tokenType) {
      case TokenType.blur:
        return TokenComparator.isEqualBlurTokenValue((a as BlurToken).value, (b as BlurToken).value)
      case TokenType.border:
        return TokenComparator.isEqualBorderTokenValue((a as BorderToken).value, (b as BorderToken).value)
      case TokenType.color:
        return TokenComparator.isEqualColorTokenValue((a as ColorToken).value, (b as ColorToken).value)
      case TokenType.font:
        return TokenComparator.isEqualFontTokenValue((a as FontToken).value, (b as FontToken).value)
      case TokenType.generic:
        return TokenComparator.isEqualGenericTokenValue((a as GenericToken).value, (b as GenericToken).value)
      case TokenType.gradient:
        return TokenComparator.isEqualGradientTokenValue((a as GradientToken).value, (b as GradientToken).value)
      case TokenType.measure:
        return TokenComparator.isEqualMeasureTokenValue((a as MeasureToken).value, (b as MeasureToken).value)
      case TokenType.radius:
        return TokenComparator.isEqualRadiusTokenValue((a as RadiusToken).value, (b as RadiusToken).value)
      case TokenType.shadow:
        return TokenComparator.isEqualShadowTokenValue((a as ShadowToken).value, (b as ShadowToken).value)
      case TokenType.text:
        return TokenComparator.isEqualTextTokenValue((a as TextToken).value, (b as TextToken).value)
      case TokenType.typography:
        return TokenComparator.isEqualTypographyTokenValue((a as TypographyToken).value, (b as TypographyToken).value)
      default:
        throw new Error('Unsupported token type for compasion')
    }
  }

  static referencesSameToken(a: AnyTokenValue, b: AnyTokenValue): boolean {
    return a.referencedToken && b.referencedToken && a.referencedToken.id === b.referencedToken.id
  }

  static isUndefinedValue(a: AnyTokenValue, b: AnyTokenValue): boolean {
    return !a && !b
  }

  static isEqualBlurTokenValue(a: BlurTokenValue, b: BlurTokenValue): boolean {
    if (this.isUndefinedValue(a, b) || this.referencesSameToken(a, b)) {
      return true
    }
    return a.type === b.type && this.isEqualMeasureTokenValue(a.radius, b.radius)
  }

  static isEqualBorderTokenValue(a: BorderTokenValue, b: BorderTokenValue): boolean {
    if (this.isUndefinedValue(a, b) || this.referencesSameToken(a, b)) {
      return true
    }
    return (
      this.isEqualColorTokenValue(a.color, b.color) &&
      this.isEqualMeasureTokenValue(a.width, b.width) &&
      a.position === b.position
    )
  }

  static isEqualColorTokenValue(a: ColorTokenValue, b: ColorTokenValue): boolean {
    if (this.isUndefinedValue(a, b) || this.referencesSameToken(a, b)) {
      return true
    }
    return a.hex === b.hex
  }

  static isEqualFontTokenValue(a: FontTokenValue, b: FontTokenValue): boolean {
    if (this.isUndefinedValue(a, b) || this.referencesSameToken(a, b)) {
      return true
    }
    return a.family === b.family && a.subfamily == b.subfamily
  }

  static isEqualGenericTokenValue(a: GenericTokenValue, b: GenericTokenValue): boolean {
    if (this.isUndefinedValue(a, b) || this.referencesSameToken(a, b)) {
      return true
    }
    return a.text === b.text
  }

  static isEqualGradientTokenValue(a: GradientTokenValue, b: GradientTokenValue): boolean {
    if (this.isUndefinedValue(a, b) || this.referencesSameToken(a, b)) {
      return true
    }
    return (
      a.aspectRatio === b.aspectRatio &&
      a.from.x === b.from.x &&
      a.from.y === b.from.y &&
      a.to.x === b.to.x &&
      a.to.y === b.to.y &&
      a.type === b.type &&
      this.isEqualGradientStops(a.stops, b.stops)
    )
  }

  static isEqualGradientStops(a: Array<GradientStopValue>, b: Array<GradientStopValue>): boolean {
    if (a.length !== b.length) {
      return false
    }
    for (let i = 0; i < a.length; i++) {
      let as = a[i]
      let bs = b[i]
      if (!this.isEqualColorTokenValue(as.color, bs.color) || as.position !== bs.position) {
        return false
      }
    }
    return true
  }

  static isEqualMeasureTokenValue(a: MeasureTokenValue, b: MeasureTokenValue): boolean {
    if (this.isUndefinedValue(a, b) || this.referencesSameToken(a, b)) {
      return true
    }
    return a.measure === b.measure && a.unit === b.unit
  }

  static isEqualRadiusTokenValue(a: RadiusTokenValue, b: RadiusTokenValue): boolean {
    if (this.isUndefinedValue(a, b) || this.referencesSameToken(a, b)) {
      return true
    }
    return (
      this.isEqualMeasureTokenValue(a.radius, b.radius) &&
      this.isEqualMeasureTokenValue(a.bottomLeft, b.bottomLeft) &&
      this.isEqualMeasureTokenValue(a.bottomRight, b.bottomRight) &&
      this.isEqualMeasureTokenValue(a.topLeft, b.topLeft) &&
      this.isEqualMeasureTokenValue(a.topRight, b.topRight)
    )
  }

  static isEqualShadowTokenValue(a: ShadowTokenValue, b: ShadowTokenValue): boolean {
    if (this.isUndefinedValue(a, b) || this.referencesSameToken(a, b)) {
      return true
    }
    return (
      this.isEqualColorTokenValue(a.color, b.color) &&
      this.isEqualMeasureTokenValue(a.radius, b.radius) &&
      this.isEqualMeasureTokenValue(a.spread, b.spread) &&
      this.isEqualMeasureTokenValue(a.x, b.x) &&
      this.isEqualMeasureTokenValue(a.y, b.y) &&
      a.type === b.type &&
      a.opacity === b.opacity
    )
  }

  static isEqualTextTokenValue(a: TextTokenValue, b: TextTokenValue): boolean {
    if (this.isUndefinedValue(a, b) || this.referencesSameToken(a, b)) {
      return true
    }
    return a.text === b.text
  }

  static isEqualTypographyTokenValue(a: TypographyTokenValue, b: TypographyTokenValue): boolean {
    if (this.isUndefinedValue(a, b) || this.referencesSameToken(a, b)) {
      return true
    }
    return (
      this.isEqualFontTokenValue(a.font, b.font) &&
      this.isEqualMeasureTokenValue(a.fontSize, b.fontSize) &&
      this.isEqualMeasureTokenValue(a.letterSpacing, b.letterSpacing) &&
      this.isEqualMeasureTokenValue(a.lineHeight, b.lineHeight) &&
      this.isEqualMeasureTokenValue(a.paragraphIndent, b.paragraphIndent) &&
      this.isEqualMeasureTokenValue(a.paragraphSpacing, b.paragraphSpacing) &&
      a.textCase === b.textCase &&
      a.textDecoration === b.textDecoration
    )
  }
}
