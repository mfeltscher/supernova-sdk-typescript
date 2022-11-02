//
//  SDKRemoteTokenValue.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//
//  This file defines all token value containers for the actual  model - this model will be exactly available to users
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { BlurType } from '../enums/SDKBlurType'
import { BorderPosition } from '../enums/SDKBorderPosition'
import { GradientType } from '../enums/SDKGradientType'
import { ShadowType } from '../enums/SDKShadowType'
import { TextCase } from '../enums/SDKTextCase'
import { TextDecoration } from '../enums/SDKTextDecoration'
import { TokenType } from '../enums/SDKTokenType'
import { Unit } from '../enums/SDKUnit'
import { TokenOrigin } from '../support/SDKTokenOrigin'
import { BlurToken } from './SDKBlurToken'
import { BorderToken } from './SDKBorderToken'
import { ColorToken } from './SDKColorToken'
import { FontToken } from './SDKFontToken'
import { GenericToken } from './SDKGenericToken'
import { GradientToken } from './SDKGradientToken'
import { MeasureToken } from './SDKMeasureToken'
import { RadiusToken } from './SDKRadiusToken'
import { ShadowToken } from './SDKShadowToken'
import { TextToken } from './SDKTextToken'
import { TypographyToken } from './SDKTypographyToken'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Remote Valu Definitions

export type TokenValue = {
  id: string
  name: string
  description: string
  tokenType: TokenType
  origin: TokenOrigin | null
}

export type ColorTokenValue = {
  hex: string
  r: number
  g: number
  b: number
  a: number
  referencedToken: ColorToken | null
}

export type TypographyTokenValue = {
  font: FontTokenValue
  fontSize: MeasureTokenValue
  textDecoration: TextDecoration
  textCase: TextCase
  letterSpacing: MeasureTokenValue
  lineHeight: MeasureTokenValue | null
  paragraphIndent: MeasureTokenValue
  paragraphSpacing: MeasureTokenValue
  referencedToken: TypographyToken | null
}

export type RadiusTokenValue = {
  radius: MeasureTokenValue
  topLeft: MeasureTokenValue | null
  topRight: MeasureTokenValue | null
  bottomLeft: MeasureTokenValue | null
  bottomRight: MeasureTokenValue | null
  referencedToken: RadiusToken | null
}

export type ShadowTokenValue = {
  color: ColorTokenValue
  x: MeasureTokenValue
  y: MeasureTokenValue
  radius: MeasureTokenValue
  spread: MeasureTokenValue
  opacity: number
  type: ShadowType
  referencedToken: ShadowToken | null
}

export type MeasureTokenValue = {
  unit: Unit
  measure: number
  referencedToken: MeasureToken | null
}

export type FontTokenValue = {
  family: string
  subfamily: string
  referencedToken: FontToken | null
}

export type BorderTokenValue = {
  color: ColorTokenValue
  width: MeasureTokenValue
  position: BorderPosition
  referencedToken: BorderToken | null
}

export type GradientTokenValue = {
  to: {
    x: number
    y: number
  }
  from: {
    x: number
    y: number
  }
  type: GradientType
  aspectRatio: number
  stops: Array<GradientStopValue>
  referencedToken: GradientToken | null
}

export type GradientStopValue = {
  position: number
  color: ColorTokenValue
}

export type TextTokenValue = {
  text: string
  referencedToken: TextToken
}

export type GenericTokenValue = {
  text: string
  referencedToken: GenericToken
}

export type BlurTokenValue = {
  type: BlurType
  radius: MeasureTokenValue
  referencedToken: BlurToken | null
}

export type AnyTokenValue =
  | ColorTokenValue
  | TextTokenValue
  | GenericTokenValue
  | TypographyTokenValue
  | RadiusTokenValue
  | ShadowTokenValue
  | MeasureTokenValue
  | FontTokenValue
  | BorderTokenValue
  | GradientTokenValue
  | BlurTokenValue


  export type AnyToken =
  | ColorToken
  | TextToken
  | GenericToken
  | TypographyToken
  | RadiusToken
  | ShadowToken
  | MeasureToken
  | FontToken
  | BorderToken
  | GradientToken
  | BlurToken