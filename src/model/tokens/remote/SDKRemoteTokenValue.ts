//
//  SDKRemoteTokenValue.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//
//  This file defines all token value containers for different types of tokens
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { BlurType } from "../../enums/SDKBlurType"
import { BorderPosition } from "../../enums/SDKBorderPosition"
import { GradientType } from "../../enums/SDKGradientType"
import { ShadowType } from "../../enums/SDKShadowType"
import { TextCase } from "../../enums/SDKTextCase"
import { TextDecoration } from "../../enums/SDKTextDecoration"
import { Unit } from "../../enums/SDKUnit"
import { ColorTokenRemoteData, FontTokenRemoteData, MeasureTokenRemoteData } from "./SDKRemoteTokenData"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Remote Valu Definitions

export type ColorTokenRemoteValue = string

export type TextTokenRemoteValue = string

export type TypographyTokenRemoteValue = {
  font: FontTokenRemoteData
  fontSize: MeasureTokenRemoteData
  textDecoration: TextDecoration
  textCase: TextCase
  letterSpacing: MeasureTokenRemoteData
  lineHeight: MeasureTokenRemoteData | null
  paragraphSpacing: MeasureTokenRemoteData,
  paragraphIndent: MeasureTokenRemoteData
}

export type RadiusTokenRemoteValue = {
  radius: MeasureTokenRemoteData
  topLeft: MeasureTokenRemoteData | null
  topRight: MeasureTokenRemoteData | null
  bottomLeft: MeasureTokenRemoteData | null
  bottomRight: MeasureTokenRemoteData | null
}

export type ShadowTokenRemoteValue = {
  isEnabled: boolean
  color: ColorTokenRemoteData
  x: MeasureTokenRemoteData
  y: MeasureTokenRemoteData
  radius: MeasureTokenRemoteData
  spread: MeasureTokenRemoteData
  opacity: number
  type: ShadowType
}

export type MeasureTokenRemoteValue = {
  unit: Unit
  measure: number
}

export type FontTokenRemoteValue = {
  family: string
  subfamily: string
}

export type BorderTokenRemoteValue = {
  isEnabled: boolean
  color: ColorTokenRemoteData
  width: MeasureTokenRemoteData
  position: BorderPosition
}

export type GradientTokenRemoteValue = {
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
  stops: Array<GradientStopRemoteValue>
}

export type GradientStopRemoteValue = {
  position: number
  color: ColorTokenRemoteData
}

export type BlurTokenRemoteValue = {
  type: BlurType
  radius: MeasureTokenRemoteData
}
