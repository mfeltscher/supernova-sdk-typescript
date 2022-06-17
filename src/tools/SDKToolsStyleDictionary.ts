//
//  SDKToolsStyleDictionary.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignSystemVersion } from "../core/SDKDesignSystemVersion"
import { Supernova } from "../core/SDKSupernova"
import { TokenType } from "../model/enums/SDKTokenType"
import { TokenGroup } from "../model/groups/SDKTokenGroup"
import { BorderToken } from "../model/tokens/SDKBorderToken"
import { ColorToken } from "../model/tokens/SDKColorToken"
import { FontToken } from "../model/tokens/SDKFontToken"
import { GradientToken } from "../model/tokens/SDKGradientToken"
import { MeasureToken } from "../model/tokens/SDKMeasureToken"
import { RadiusToken } from "../model/tokens/SDKRadiusToken"
import { ShadowToken } from "../model/tokens/SDKShadowToken"
import { TextToken } from "../model/tokens/SDKTextToken"
import { Token } from "../model/tokens/SDKToken"
import { BorderTokenValue, ColorTokenValue, FontTokenValue, GradientTokenValue, MeasureTokenValue, RadiusTokenValue, ShadowTokenValue, TextTokenValue, TypographyTokenValue } from "../model/tokens/SDKTokenValue"
import { TypographyToken } from "../model/tokens/SDKTypographyToken"
import _ from "lodash"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration

export type SupernovaToolStyleDictionaryOptions = {

  /** Conversion method to be used for token names. Original will use actual token name */
  naming: SupernovaToolStyleDictionaryKeyNaming,

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
}

export enum SupernovaToolStyleDictionaryKeyNaming {
  original = "original",
  camelcase = "camelcase",
  snakecase = "snakecase",
  kebabcase = "kebabcase"
}


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Style dictionary tooling object */
export class SupernovaToolsStyleDictionary {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  private instance: Supernova
  private version: DesignSystemVersion

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(instance: Supernova, version: DesignSystemVersion) {
    this.instance = instance
    this.version = version
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public interface

  /** Fetches all tokens available for selected design system version, and converts them to style dictionary representation. */
  async tokensToSD(options: SupernovaToolStyleDictionaryOptions) {

    let tokens = await this.version.tokens()
    let groups = await this.version.tokenGroups()

    // Filter out tokens that contain brand id
    if (options.brandId) {
      tokens = tokens.filter(t => t.brandId === options.brandId)
    }

    return this.buildTokenStructure(tokens, groups, options)
  }


  buildTokenStructure(tokens: Array<Token>, groups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions) {

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
  private generateStyleDictionaryTree(rootGroup: TokenGroup, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions) {
    let writeRoot = {}
    // Compute full data structure of the entire type-dependent tree
    let result = this.representTree(rootGroup, allTokens, allGroups, writeRoot, options)

    // Add top level entries which don't belong to any user-defined group
    for (let token of this.tokensOfGroup(rootGroup, allTokens)) {
      result[this.safeTokenName(token, options.naming)] = this.representToken(token, allTokens, allGroups, options)
    }

    // Retrieve tokens with type shell or without it
    if (options.includeRootTypeNodes) {
      return {
        [`${this.typeLabel(rootGroup.tokenType)}`]: result
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
    options: SupernovaToolStyleDictionaryOptions
  ): Object {
    let newObject = writeObject

    // Represent one level of groups and tokens inside tree. Creates subobjects and then also information about each token
    for (let group of rootGroup.subgroups) {
      // Write buffer
      let writeSubObject = {}

      // Add each entry for each subgroup, and represent its tree into it
      newObject[this.safeGroupName(group, options.naming)] = this.representTree(group, allTokens, allGroups, writeSubObject, options)

      // Add each entry for each token, writing to the same write root
      for (let token of this.tokensOfGroup(group, allTokens)) {
        writeSubObject[this.safeTokenName(token, options.naming)] = this.representToken(token, allTokens, allGroups, options)
      }
    }
    return newObject
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token Representation

  /** Represent a singular token as SD object */
  private representToken(token: Token, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): Object {
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
  private representColorToken(token: ColorToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): Object {
    let value = this.representColorTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full border token, including wrapping meta-information such as user description */
  private representBorderToken(token: BorderToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): Object {
    let value = this.representBorderTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full font token, including wrapping meta-information such as user description */
  private representFontToken(token: FontToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): Object {
    let value = this.representFontTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full gradient token, including wrapping meta-information such as user description */
  private representGradientToken(token: GradientToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): Object {
    let value = this.representGradientTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full measure token, including wrapping meta-information such as user description */
  private representMeasureToken(token: MeasureToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): Object {
    let value = this.representMeasureTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full radius token, including wrapping meta-information such as user description */
  private representRadiusToken(token: RadiusToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): Object {
    let value = this.representRadiusTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full shadow token, including wrapping meta-information such as user description */
  private representShadowToken(token: ShadowToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): Object {
    let value = this.representShadowTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full text token, including wrapping meta-information such as user description */
  private representTextToken(token: TextToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): Object {
    let value = this.representTextTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  /** Represent full typography token, including wrapping meta-information such as user description */
  private representTypographyToken(token: TypographyToken, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): Object {
    let value = this.representTypographyTokenValue(token.value, allTokens, allGroups, options)
    return this.tokenWrapper(token, value, options)
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token Value Representation

  /** Represent color token value either as reference or as plain representation */
  private representColorTokenValue(value: ColorTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options.naming))
    } else {
      // Raw value
      result = `#${value.hex}`
    }
    return result
  }

  /** Represent radius token value either as reference or as plain representation */
  private representRadiusTokenValue(value: RadiusTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options.naming))
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
  private representMeasureTokenValue(value: MeasureTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options.naming))
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
  private representFontTokenValue(value: FontTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options.naming))
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
  private representTextTokenValue(value: TextTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options.naming))
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
    options: SupernovaToolStyleDictionaryOptions
  ): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options.naming))
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
  private representBorderTokenValue(value: BorderTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options.naming))
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
  private representShadowTokenValue(value: ShadowTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options.naming))
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
  private representGradientTokenValue(value: GradientTokenValue, allTokens: Array<Token>, allGroups: Array<TokenGroup>, options: SupernovaToolStyleDictionaryOptions): any {
    let result: any
    if (value.referencedToken) {
      // Forms reference
      result = this.referenceWrapper(this.referenceName(value.referencedToken, allGroups, options.naming))
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
  private referenceWrapper(reference: string) {
    return `{${reference}.value}`
  }

  /** Retrieve token wrapper containing its metadata and value information (used as container for each defined token) */
  private tokenWrapper(token: Token, value: any, options: SupernovaToolStyleDictionaryOptions): Object {

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
  private referenceName(token: Token, allGroups: Array<TokenGroup>, naming: SupernovaToolStyleDictionaryKeyNaming) {
    // Find the group to which token belongs. This is really suboptimal and should be solved by the SDK to just provide the group reference
    let occurances = allGroups.filter(g => g.tokenIds.indexOf(token.id) !== -1)
    if (occurances.length === 0) {
      throw Error('JS: Unable to find token in any of the groups')
    }
    let containingGroup = occurances[0]
    let tokenPart = this.safeTokenName(token, naming)
    let groupParts = this.referenceGroupChain(containingGroup).map(g => this.safeGroupName(g, naming))
    return [...groupParts, tokenPart].join('.')
  }

  /** Retrieve safe token name made out of normal token name
   * This replace spaces with dashes, also change anything non-alphanumeric char to it as well.
   * For example, ST&RK Industries will be changed to st-rk-industries
   */
  private safeTokenName(token: Token, naming: SupernovaToolStyleDictionaryKeyNaming) {
    // TODO: Naming
    let name = token.name
    return this.processedName(name, naming)
  }

  /** Retrieve safe group name made out of normal group name
   * This replace spaces with dashes, also change anything non-alphanumeric char to it as well.
   * For example, ST&RK Industries will be changed to st-rk-industries
   */
  private safeGroupName(group: TokenGroup, naming: SupernovaToolStyleDictionaryKeyNaming) {
    // TODO: Naming
    return group.name.replace(/\W+/g, '-').toLowerCase()
  }

  private processedName(name: string, naming: SupernovaToolStyleDictionaryKeyNaming) {

    switch (naming) {
      case SupernovaToolStyleDictionaryKeyNaming.camelcase:
        return name.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
      case SupernovaToolStyleDictionaryKeyNaming.kebabcase:
        return name.replace(/\W+/g, '-').toLowerCase()
      case SupernovaToolStyleDictionaryKeyNaming.original:
        return name
      case SupernovaToolStyleDictionaryKeyNaming.snakecase:
        return name.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map(x => x.toLowerCase()).join('_');
    }
  }

  /** Retrieve human-readable token type in unified fashion, used both as token type and as token master group */
  private typeLabel(type: TokenType) {
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

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Lookup

  /** Find all tokens that belong to a certain group and retrieve them as objects */
  private tokensOfGroup(containingGroup: TokenGroup, allTokens: Array<Token>): Array<Token> {
    return allTokens.filter(t => containingGroup.tokenIds.indexOf(t.id) !== -1)
  }

  /** Retrieve chain of groups up to a specified group, ordered from parent to children */
  private referenceGroupChain(containingGroup: TokenGroup): Array<TokenGroup> {
    let iteratedGroup = containingGroup
    let chain = [containingGroup]
    while (iteratedGroup.parent) {
      chain.push(iteratedGroup.parent)
      iteratedGroup = iteratedGroup.parent
    }

    return chain.reverse()
  }
}
