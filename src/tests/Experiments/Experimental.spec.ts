//
//  Experimental.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import test from 'ava'
import { uuid } from 'uuidv4'
import { Brand, ColorToken, DesignSystemVersion, SupernovaToolsStyleDictionary, Token, TokenGroup } from '../..'
import { TokenType } from '../../exports'
import { SupernovaToolsDesignTokensPlugin } from '../../tools/design-tokens/SDKToolsDesignTokensPlugin'
import { SupernovaToolsDesignTokensPluginConverter } from '../../tools/design-tokens/utilities/SDKDTJSONConverter'
import { SupernovaToolStyleDictionaryKeyNaming, SupernovaToolStyleDictionaryOptions } from '../../tools/SDKToolsStyleDictionary'
import { testInstance } from '../helpers'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_experimental_tokens_to_style_dictionary', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Options
    let options: SupernovaToolStyleDictionaryOptions = {
        naming: SupernovaToolStyleDictionaryKeyNaming.original,
        includeComments: true,
        includeBrandId: true,
        brandId: null,
        includeType: true,
        includeRootTypeNodes: false,
        type: TokenType.color,
    }

    // Build color representation
    let sdTool = new SupernovaToolsStyleDictionary(testInstance, version)
    let sdRepresentation = await sdTool.tokensToSD(options)

    // Test structure
    t.true(true)
})


test('test_experimental_token_write', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch specific brand
    let brands = await version.brands()
    let brand = brands[0]

    // Create DT tool, load tokens from definition, merge them with upstream source 
    let tool = new SupernovaToolsDesignTokensPlugin(testInstance, version, brand)
    let incomingTokenPack = await tool.loadTokensFromDefinition(provideTokens())
    let mergedTokenPack = await tool.mergeWithRemoteSource(incomingTokenPack.tokens, incomingTokenPack.groups, false)

    t.true(true)
})


function provideTokens(): string {
    
    let definition = `
    {
        "colors": {
            "Black": "#212121",
            "White": "#ffffff",
            "Primary": {
                "100": "#e9f4ff",
                "200": "#d2e9ff",
                "300": "#8fc8ff",
                "400": "#4ba6ff",
                "500": "#1e90ff",
                "600": "#1565b3",
                "700": "#0c3a66",
                "800": "#061d33",
                "900": "#030e19"
            },
            "Secondary": {
              "100": "#e7efff",
              "200": "#cfdffe",
              "300": "#a0bffd",
              "400": "#709ffd",
              "500": "#115ffb",
              "600": "#0a3997",
              "700": "#072664",
              "800": "#031332",
              "900": "#020919"
            }
        }
    }`

    return definition
}
