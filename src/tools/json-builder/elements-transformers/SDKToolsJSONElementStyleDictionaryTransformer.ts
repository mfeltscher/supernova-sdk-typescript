//
//  SDKToolsJSONElementStyleDictionary.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { TokenGroup } from "../../../model/groups/SDKTokenGroup"
import { Token } from "../../../model/tokens/SDKToken"
import { BorderTokenValue, ColorTokenValue, FontTokenValue, GradientTokenValue, MeasureTokenValue, RadiusTokenValue, ShadowTokenValue, TextTokenValue, TypographyTokenValue } from "../../../model/tokens/SDKTokenValue"
import _ from "lodash"
import { TokenJSONBuilderOptionsInternal } from "../SDKToolsJSONBuilder"
import { TokenJSONElementTransformer } from "./SDKToolsJSONElementTransformer"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Token transformer that allow generic transform of tokens to different destinations, like Style Dictionary or Figma Tokens representation */
export class TokenJSONElementStyleDictionaryTransformer extends TokenJSONElementTransformer {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token Value Representation

  /** Represent color token value either as reference or as plain representation */
  representColorTokenValue(value: ColorTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options), options)
    } else {
      // Raw value
      result = `#${value.hex}`
    }
    return result
  }

  /** Represent radius token value either as reference or as plain representation */
  representRadiusTokenValue(value: RadiusTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options), options)
    } else {
      // Raw value
      result = {
        radius: {
          type: 'measure',
          value: this.representMeasureTokenValue(value.radius, allTokens, allGroups, options)
        },
        topLeft: value.topLeft
          ? {
              type: 'measure',
              value: this.representMeasureTokenValue(value.topLeft, allTokens, allGroups, options)
            }
          : undefined,
        topRight: value.topRight
          ? {
              type: 'measure',
              value: this.representMeasureTokenValue(value.topRight, allTokens, allGroups, options)
            }
          : undefined,
        bottomLeft: value.bottomLeft
          ? {
              type: 'measure',
              value: this.representMeasureTokenValue(value.bottomLeft, allTokens, allGroups, options)
            }
          : undefined,
        bottomRight: value.bottomRight
          ? {
              type: 'measure',
              value: this.representMeasureTokenValue(value.bottomRight, allTokens, allGroups, options)
            }
          : undefined
      }
    }
    return result
  }

  /** Represent measure token value either as reference or as plain representation */
  representMeasureTokenValue(value: MeasureTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options), options)
    } else {
      // Raw value
      result = {
        measure: {
          type: 'size',
          value: value.measure
        },
        unit: {
          type: 'string',
          value: value.unit.toLowerCase()
        }
      }
    }
    return result
  }

  /** Represent font token value either as reference or as plain representation */
  representFontTokenValue(value: FontTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options), options)
    } else {
      // Raw value
      result = {
        family: {
          type: 'string',
          value: value.family
        },
        subfamily: {
          type: 'string',
          value: value.subfamily
        }
      }
    }
    return result
  }

  /** Represent text token value either as reference or as plain representation */
  representTextTokenValue(value: TextTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options), options)
    } else {
      // Raw value
      result = value.text
    }
    return result
  }

  /** Represent typography token value either as reference or as plain representation */
  representTypographyTokenValue(
    value: TypographyTokenValue,
    allTokens: Array<Token>,
    allGroups: Array<TokenGroup>, 
    options: TokenJSONBuilderOptionsInternal
  ): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options), options)
    } else {
      // Raw value
      result = {
        font: {
          type: 'font',
          value: this.representFontTokenValue(value.font, allTokens, allGroups, options)
        },
        fontSize: {
          type: 'measure',
          value: this.representMeasureTokenValue(value.fontSize, allTokens, allGroups, options)
        },
        textDecoration: value.textDecoration,
        textCase: value.textCase,
        letterSpacing: {
          type: 'measure',
          value: this.representMeasureTokenValue(value.letterSpacing, allTokens, allGroups, options)
        },
        paragraphIndent: {
          type: 'measure',
          value: this.representMeasureTokenValue(value.paragraphIndent, allTokens, allGroups, options)
        },
        paragraphSpacing: {
          type: 'measure',
          value: this.representMeasureTokenValue(value.paragraphSpacing, allTokens, allGroups, options)
        },
        lineHeight: value.lineHeight
          ? {
              type: 'measure',
              value: this.representMeasureTokenValue(value.lineHeight, allTokens, allGroups, options)
            }
          : undefined
      }
    }

    return result
  }

  /** Represent border token value either as reference or as plain representation */
  representBorderTokenValue(value: BorderTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options), options)
    } else {
      // Raw value
      result = {
        color: {
          type: 'color',
          value: this.representColorTokenValue(value.color, allTokens, allGroups, options)
        },
        width: {
          type: 'measure',
          value: this.representMeasureTokenValue(value.width, allTokens, allGroups, options)
        },
        position: {
          type: 'string',
          value: value.position
        }
      }
    }

    return result
  }

  /** Represent shadow token value either as reference or as plain representation */
  representShadowTokenValue(value: ShadowTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options), options)
    } else {
      // Raw value
      result = {
        color: {
          type: 'color',
          value: this.representColorTokenValue(value.color, allTokens, allGroups, options)
        },
        x: {
          type: 'measure',
          value: this.representMeasureTokenValue(value.x, allTokens, allGroups, options)
        },
        y: {
          type: 'measure',
          value: this.representMeasureTokenValue(value.y, allTokens, allGroups, options)
        },
        radius: {
          type: 'measure',
          value: this.representMeasureTokenValue(value.radius, allTokens, allGroups, options)
        },
        spread: {
          type: 'measure',
          value: this.representMeasureTokenValue(value.spread, allTokens, allGroups, options)
        },
        opacity: {
          type: 'size',
          value: value.opacity
        }
      }
    }

    return result
  }

  /** Represent gradient token value either as reference or as plain representation */
  representGradientTokenValue(value: GradientTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: TokenJSONBuilderOptionsInternal): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options), options)
    } else {
      // Raw value
      result = {
        to: {
          type: 'point',
          value: {
            x: {
              type: 'size',
              value: value.to.x
            },
            y: {
              type: 'size',
              value: value.to.y
            }
          }
        },
        from: {
          type: 'point',
          value: {
            x: {
              type: 'size',
              value: value.from.x
            },
            y: {
              type: 'size',
              value: value.from.y
            }
          }
        },
        type: {
          type: 'string',
          value: value.type
        },
        aspectRatio: {
          type: 'size',
          value: value.aspectRatio
        },
        stops: {}
      }

      // Inject gradient stops
      let count = 0
      for (let stop of value.stops) {
        let stopObject = {
          type: 'gradientStop',
          position: {
            type: 'size',
            value: stop.position
          },
          color: {
            type: 'color',
            value: this.representColorTokenValue(stop.color, allTokens, allGroups, options)
          }
        }
        result.stops[`${count}`] = stopObject
        count++
      }
    }

    return result
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Object wrappers

  /** Retrieve wrapper to certain token (referenced by name) pointing to token value */
  referenceWrapper(reference: string, options: TokenJSONBuilderOptionsInternal) {
    return `{${reference}.value}`
  }
}
