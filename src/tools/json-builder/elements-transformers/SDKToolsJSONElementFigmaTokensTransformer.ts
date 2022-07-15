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
import { JSONBuilderNamingOption, TokenJSONBuilderOptionsInternal } from "../SDKToolsJSONBuilder"
import { TokenJSONElementTransformer } from "./SDKToolsJSONElementTransformer"
import _ from "lodash"
import { TokenType } from "../../../model/enums/SDKTokenType"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Token transformer that allow generic transform of tokens to different destinations, like Style Dictionary or Figma Tokens representation */
export class TokenJSONElementFigmaTokensTransformer extends TokenJSONElementTransformer {

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

      // Create into shorthand
      if (result.endsWith("ff")) {
        result = result.substr(result, result.length - 2)
      }
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
      result = `${value.measure}px`
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

  /** Retrieve token wrapper containing its metadata and value information (used as container for each defined token) */
  tokenWrapper(token: Token, value: any, options: TokenJSONBuilderOptionsInternal): Object {

    let data = {
      value: value
    }

    if (options.includeType) {
      data["type"] = this.typeLabelConsideringAbstractGroups(token)
    }
    if (options.includeBrandId) {
      data["brandId"] = token.brandId
    }
    if (options.includeComments) {
      data["description"] = token.description.length > 0 ? token.description : undefined
    }

    return data
  }

  /** Retrieve human-readable token type in unified fashion, used both as token type and as token master group */
  typeLabelConsideringAbstractGroups(token: Token) {
    
    let groupChain = this.referenceGroupChain(token.parent)

    switch (token.tokenType) {
      case 'Color':
        return 'color'
      case 'Measure': {
        if (groupChain.length >= 2) {
          switch (groupChain[1].name) { // Checking by abstract, autogenerated group
            case "Sizing": return "sizing";
            case "Font Size": return "fontSize";
            case "Border Radius": return "borderRadius";
            case "Border Width": return "borderWidth";
            case "Paragraph Spacing": return "paragraphSpacing";
            case "Line Height": return "lineHeight";
            case "Letter Spacing": return "letterSpacing";
            case "Spacing": return "spacing";
            case "Opacity": return "opacity";
          }
        }
        return 'sizing';
      }

      // TODO: Continue from here
      case 'Border':
        return 'border'
      case 'Font':
        return 'font'
      case 'Gradient':
        return 'gradient'
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
  

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Object wrappers

  /** Retrieve wrapper to certain token (referenced by name) pointing to token value */
  referenceWrapper(reference: string, options: TokenJSONBuilderOptionsInternal) {
    return `{${reference}}`
  }

  /** Retrieve safe group name made out of normal group name
   * This replace spaces with dashes, also change anything non-alphanumeric char to it as well.
   * For example, ST&RK Industries will be changed to st-rk-industries
   */
  safeGroupName(group: TokenGroup, naming: JSONBuilderNamingOption) {
    return group.name
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

    // Drop first segment if needed - from pre-created mapping groups that are not available by default in Supernova which we are creating
    let dropFirstSegment: boolean = false
    switch (token.tokenType) {
      case TokenType.measure:
        if (["Border Radius", "Border Width", "Sizing", "Font Size", "Paragraph Spacing", "Line Height", "Letter Spacing", "Spacing", "Opacity"].includes(groupParts[0])) {
          dropFirstSegment = true; 
        }
        break;
      default: break;
    }

    if (dropFirstSegment) {
      groupParts.splice(0, 1)
    }

    return [...groupParts, tokenPart].join('.')
  }


  groupIsAbstract(group: TokenGroup): boolean {

    // Abstract groups can only be right after the root, otherwise they are never abstract
    if (!group.parent || !group.parent.isRoot) {
      return false
    }

    switch (group.tokenType) {
      case TokenType.measure:
        if (["Border Radius", "Border Width", "Sizing", "Font Size", "Paragraph Spacing", "Line Height", "Letter Spacing", "Spacing", "Opacity"].includes(group.name)) {
          return true
        }
        // TODO: Detect other types
      default: break;
    } 

    return false
  }
}
