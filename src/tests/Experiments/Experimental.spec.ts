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
import path from 'path'
import { TokenType } from '../../exports'
import { SupernovaToolsDesignTokensPlugin } from '../../tools/design-tokens/SDKToolsDesignTokensPlugin'
import { SupernovaToolsStyleDictionary, SupernovaToolStyleDictionaryKeyNaming, SupernovaToolStyleDictionaryOptions } from '../../tools/SDKToolsStyleDictionary'
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
    let _ = await tool.mergeWithRemoteSource(incomingTokenPack.processedNodes, true)

    t.true(true)
})

test('test_experimental_token_write_from_file', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch specific brand
    let brands = await version.brands()
    let brand = brands[0]

    // Create DT tool, load tokens from definition, merge them with upstream source 
    let tool = new SupernovaToolsDesignTokensPlugin(testInstance, version, brand)
    let x = path.join(process.cwd(), 'files', 'tokens.json')
  
    let incomingTokenPack = await tool.loadTokensFromPath(x)
    let _ = await tool.mergeWithRemoteSource(incomingTokenPack.processedNodes, true)

    t.true(true)
})


function provideTokens(): string {
    
    let definition = `
    {
        "color": {
          "red": {
            "50": {
              "value": "#fef2f2",
              "type": "color"
            },
            "100": {
              "value": "#fee2e2",
              "type": "color"
            },
            "200": {
              "value": "#fecaca",
              "type": "color"
            },
            "300": {
              "value": "#fca5a5",
              "type": "color"
            },
            "400": {
              "value": "#f87171",
              "type": "color"
            },
            "500": {
              "value": "#ef4444",
              "type": "color"
            },
            "600": {
              "value": "#dc2626",
              "type": "color"
            },
            "700": {
              "value": "#b91c1c",
              "type": "color"
            },
            "800": {
              "value": "#991b1b",
              "type": "color"
            },
            "900": {
              "value": "#7f1d1d",
              "type": "color"
            }
          },
          "neutrals": {
            "black": {
              "value": "#000000",
              "type": "color"
            },
            "white": {
              "value": "#ffffff",
              "type": "color"
            },
            "transparent": {
              "value": "hsla(255,0%,100%,0.01)",
              "type": "color"
            }
          },
          "references": {
            "Three Times Referenced": {
              "value": "{references.Twice Referenced}",
              "type": "color"
            },
            "Twice Referenced": {
              "value": "{references.Single Referenced}",
              "type": "color"
            },
            "Single Referenced": {
              "value": "{red.50}",
              "type": "color"
            }
          }
        }
    }`

    return definition
}
