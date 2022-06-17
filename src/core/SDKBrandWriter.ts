//
//  BrandWriter.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Brand, Supernova } from ".."
import { TokenGroup } from "../model/groups/SDKTokenGroup"
import { Token } from "../model/tokens/SDKToken"
import { DataCore } from "./data/SDKDataCore"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export type TokenWriteResponse = {
    result: "success" | "error",
    errors: Array<string>,
    tokens: Array<Token>
    tokenGroups: Array<TokenGroup>
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
            tokens: [],
            tokenGroups: []
        }
    }
  }