
//
//  SDKToolsDesignTokensPlugin.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignSystemVersion } from "../../core/SDKDesignSystemVersion"
import { Supernova } from "../../core/SDKSupernova"
import { TokenType } from "../../model/enums/SDKTokenType"
import { TokenGroup } from "../../model/groups/SDKTokenGroup"
import { Token } from "../../model/tokens/SDKToken"
import _ from "lodash"
import { Brand } from "../.."
import { TokenWriteResponse } from "../../core/SDKBrandWriter"
import { DTJSONLoader } from "./utilities/SDKDTJSONLoader"
import { DTJSONConverter } from "./utilities/SDKDTJSONConverter"
import { DTJSONGroupBuilder } from "./utilities/SDKDTJSONGroupBuilder"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Design Tokens Plugin Manipulation Tool */
export class SupernovaToolsDesignTokensPlugin {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  private instance: Supernova
  private version: DesignSystemVersion
  private brand: Brand


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(instance: Supernova, version: DesignSystemVersion, brand: Brand) {
    this.instance = instance
    this.version = version
    this.brand = brand
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Loader

  /** Load token definitions from multiple sources */
  /*
  async loadTokensFromDefinitions(definitions: Array<string>): Promise<{
      tokens: Array<Token>
      groups: Array<TokenGroup>
  }> {

    for (let definition of definitions) {
        let result = this.loadTokensFromDefinition(definition)
    }
    throw new Error("Not implemented")
  }
  */

  /** Load token definitions from */
  async loadTokensFromDefinition(definition: string): Promise<{
    tokens: Array<Token>
    groups: Array<TokenGroup>
  }> {
    let loader = new DTJSONLoader()
    let converter = new DTJSONConverter(this.version, this.brand)
    let groupBuilder = new DTJSONGroupBuilder(this.version, this.brand)

    let nodes = await loader.loadDSObjectsFromDefinition(definition)
    let processedNodes = await converter.convertNodesToTokens(nodes)
    let processedGroups = await groupBuilder.constructAllDefinableGroupsTrees(processedNodes)
    console.log(processedGroups)
    
    return {
        tokens: [],
        groups: []
    }
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Merging

  /** Loads remote source connected to this tool, then merges tokens and groups with it, creating union. Can optionally write to the source as well */
  async mergeWithRemoteSource(tokens: Array<Token>, tokenGroups: Array<TokenGroup>, write: boolean): Promise<{
      tokens: Array<Token>
      groups: Array<TokenGroup>
  }> {

    throw new Error("Not implemented")
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  private async writeToRemoteSource(tokens: Array<Token>, tokenGroups: Array<TokenGroup>): Promise<boolean> {

    let writer = this.brand.writer()
    await writer.writeTokens(tokens, tokenGroups)
    return true
  }
}
