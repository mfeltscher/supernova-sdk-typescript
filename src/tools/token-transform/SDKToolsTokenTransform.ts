//
//  SDKToolsTokenTransform.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Token } from '../../model/tokens/SDKToken'
import { ColorToken } from '../../model/tokens/SDKColorToken'
import { BorderToken } from '../../model/tokens/SDKBorderToken'
import { GradientToken } from '../../model/tokens/SDKGradientToken'
import { ShadowToken } from '../../model/tokens/SDKShadowToken'
import { TypographyToken } from '../../model/tokens/SDKTypographyToken'
import { BlurToken } from '../../model/tokens/SDKBlurToken'
import { MeasureToken } from '../../model/tokens/SDKMeasureToken'
import { RadiusToken } from '../../model/tokens/SDKRadiusToken'
import { FontToken } from '../../model/tokens/SDKFontToken'
import { GenericToken } from '../../model/tokens/SDKGenericToken'
import { TextToken } from '../../model/tokens/SDKTextToken'
import { BlurTokenValue, BorderTokenValue, ColorTokenValue, FontTokenValue, GenericTokenValue, GradientTokenValue, MeasureTokenValue, RadiusTokenValue, ShadowTokenValue, TextTokenValue, TypographyTokenValue } from '../../model/tokens/SDKTokenValue'
import { Unit } from '../../model/enums/SDKUnit'

import tinycolor = require("tinycolor2")


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Transformer instance

/** Token data transformer. Use for direct representation of token to other representations, such as CSS, rgb etc. More transformers will be added over time */
export class TokenTransform {

  // --- Properties

  // --- Constructor
  constructor() {
    
  }

  // --- Conversion to CSS

  /** Converts a single token to CSS definition. Values are always resolved to plain values, references to other tokens are not yet supported */
  tokenToCSS(token: Token): string {

    switch (token.tokenType) {
      case 'Color':
        return this.colorTokenToCSS((token as ColorToken).value)
      case 'Border':
        return this.borderTokenToCSS((token as BorderToken).value)
      case 'Font':
        return this.fontTokenToCSS((token as FontToken).value)
      case 'Gradient':
        return this.gradientTokenToCSS((token as GradientToken).value)
      case 'Measure':
        return this.measureTokenToCSS((token as MeasureToken).value)
      case 'Radius':
        return this.radiusTokenToCSS((token as RadiusToken).value)
      case 'Shadow':
        return this.shadowTokenToCSS((token as ShadowToken).value)
      case 'Text':
        return this.textTokenToCSS((token as TextToken).value)
      case 'Blur':
        return this.blurTokenToCSS((token as BlurToken).value)
      case 'Typography':
        return this.typographyTokenToCSS((token as TypographyToken).value)
      case 'GenericToken':
        return this.genericTokenToCSS((token as GenericToken).value)
    }

    throw new Error(`Unsupported token type ${token.tokenType} for transformation to CSS`)
  }

  /** Converts token to appropriate css variable definition --(name): css_definition */
  tokenToCSSVariableDeclaration(token: Token, variableName: string): string {
    return `--${variableName}: ${this.tokenToCSS(token)}`
  }

  /** Converts color token value to css definition */
  colorTokenToCSS(value: ColorTokenValue): string {
    const color = tinycolor(value.hex)
    return color.toRgbString()
  }

  /** Converts border token value to css definition */
  borderTokenToCSS(value: BorderTokenValue): string {
    return `${this.measureTokenToCSS(value.width)} solid ${this.colorTokenToCSS(value.color)}, ${value.position.toLowerCase()}`
  }

  /** Converts shadow token value to css definition */
  shadowTokenToCSS(value: ShadowTokenValue): string {
    return `${value.type === "Inner" ? "inset " : ""}${this.measureTokenToCSS(value.x)} ${this.measureTokenToCSS(value.y)} ${this.measureTokenToCSS(value.radius)} ${this.measureTokenToCSS(value.spread)} ${this.colorTokenToCSS(value.color)}`
  }

  /** Converts typography token value to css definition */
  typographyTokenToCSS(value: TypographyTokenValue): string {

    let fontName = `${value.font.family} ${value.font.subfamily}`
    let fontValue = this.measureTokenToCSS(value.fontSize)
    let textDecoration: string = ""
    let textCase: string = ""
    if (value.textDecoration !== "None") {
      textDecoration = `, ${value.textDecoration.toLowerCase()}`
    }
    if (value.textCase !== "Original") {
      textCase = `, ${value.textCase.toLowerCase()}`
    }
    return `${fontName} ${fontValue}${textDecoration}${textCase}`
  }

  /** Converts border token value to css definition */
  blurTokenToCSS(value: BlurTokenValue): string {
    return `blur(${this.measureTokenToCSS(value.radius)})`
  }

  /** Converts border token value to css definition */
  measureTokenToCSS(value: MeasureTokenValue): string {
    return `${value.measure}${this.unitToCSS(value.unit)}`
  }

  private unitToCSS(value: Unit): string {

    switch (value) {
      case Unit.ems: return "em"
      case Unit.percent: return "%"
      case Unit.pixels: return "px"
      case Unit.points: return "pt"
    }
  }
  
  /** Converts border token value to css definition */
  radiusTokenToCSS(value: RadiusTokenValue): string {

    // TODO: Export 4-corner radius once supported, for now, only singular radius
    return this.measureTokenToCSS(value.radius)
  }
  
  /** Converts gradient token value to css definition */
  gradientTokenToCSS(value: GradientTokenValue): string {
    let gradientType = ""
    switch (value.type) {
      case "Linear":
        gradientType = "linear-gradient(0deg, "
        break
      case "Radial":
        gradientType = "radial-gradient(circle, "
        break
      case "Angular":
        gradientType = "conic-gradient("
        break
    }
  
    // Describe gradient as (type) (stop1, stop2 ...)
    // Example: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%);
    let stops = value.stops
      .map((stop) => {
        return `${this.colorTokenToCSS(stop.color)} ${stop.position * 100}%`
      })
      .join(", ")
  
    return `${gradientType}${stops})`
  }
  
  /** Converts font token value to css definition */
  fontTokenToCSS(value: FontTokenValue): string {
    return `${value.family ?? ""} ${value.subfamily ?? ""}`
  }
  
  /** Converts generic token value to css definition */
  genericTokenToCSS(value: GenericTokenValue): string {
    return "\"" + value.text + "\""
  }
  
  /** Converts generic token value to css definition */
  textTokenToCSS(value: TextTokenValue): string {
    return "\"" + value.text + "\""
  }


  // --- Special treatment for CSS

  /** Converts a single color token to #hheexx or #hheexxaa */
  colorTokenToHEXorHEXA(colorToken: ColorToken): string {
  
    const color = tinycolor(colorToken.value.hex)
    return colorToken.value.a === 1 ? color.toHexString() : color.toHex8String()
  }

  /** Converts a single color token to rgba(x,x,x,x)  */
  colorTokenToRGBA(colorToken: ColorToken): string {

      const color = tinycolor(colorToken.value.hex)
      return color.toRgbString()
  }

  /** Converts a single color token to rgba(x,x,x,x) with relative values */
  colorTokenToPercenageRGBA(colorToken: ColorToken): string {

      const color = tinycolor(colorToken.value.hex)
      return color.toPercentageRgbString()
  }

  /** Converts a single color token to hsla(x,x,x,x) */
  colorTokenToHSLA(colorToken: ColorToken): string {

      const color = tinycolor(colorToken.value.hex)
      return color.toHslString()
  }

  /** Converts a single color token to hsva(x,x,x,x) */
  colorTokenToHSVA(colorToken: ColorToken): string {

      const color = tinycolor(colorToken.value.hex)
      return color.toHsvString()
  }
}
