//
//  BrandWriter.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { TokenGroup } from "../model/groups/SDKTokenGroup"
import { TokenTheme } from "../model/themes/SDKTokenTheme"
import { Token } from "../model/tokens/SDKToken"
import { DataCore } from "./data/SDKDataCore"
import { Brand } from "./SDKBrand"
import { Supernova } from "./SDKSupernova"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export type TokenWriteResponse = {
    result: "success" | "error",
    errors: Array<string>,
    tokens: Array<Token>
    tokenGroups: Array<TokenGroup>
}

export type TokenThemeWriteResponse = {
    result: "success" | "error",
    errors: Array<string>,
    theme: TokenTheme
}


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class BrandWriter {

    // --- --- --- --- --- --- --- --- --- --- 
    // MARK: - Properties
  
    /** Internal: Associated brand */
    brand: Brand

    /** Internal: Engine */
    engine: Supernova

    /** Internal: Data core */
    dataCore: DataCore

    // --- --- --- --- --- --- --- --- --- --- 
    // MARK: - Constructor
  
    constructor(engine: Supernova, brand: Brand) {
      this.engine = engine
      this.dataCore = brand.dataCore
      this.brand = brand
    }


    // --- --- --- --- --- --- --- --- --- --- 
    // MARK: - Methods

    /** Fetches all tokens available in this design system version belonging to this specific brand */
    async writeTokens(tokens: Array<Token>, groups: Array<TokenGroup>, deleteTokens: Array<Token>): Promise<TokenWriteResponse> {

        // Convert tokens and groups to their remote counterparts
        let remoteTokens = tokens.map(t => t.toWriteObject())
        let remoteGroups = groups.map(g => g.toWriteObject())
        
        await this.dataCore.writeTokenData(this.brand.designSystemVersion.designSystem.id, this.brand.designSystemVersion, remoteTokens, remoteGroups, deleteTokens)
        return {
            result: "success",
            errors: [],
            tokens: tokens,
            tokenGroups: groups
        }
    }    
    
    async writeTheme(theme: TokenTheme): Promise<TokenThemeWriteResponse> {

        // Convert tokens and groups to their remote counterparts
        let remoteTheme = theme.toWriteObject()
        await this.dataCore.writeTokenThemeData(this.brand.designSystemVersion.designSystem.id, this.brand.designSystemVersion, remoteTheme)
        
        return {
            result: "success",
            errors: [],
            theme: theme
        }
    }
  }

  