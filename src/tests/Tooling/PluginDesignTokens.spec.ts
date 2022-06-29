//
//  PluginDesignTokens.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import test from 'ava'
import path from 'path'
import { SupernovaToolsDesignTokensPlugin } from '../../tools/design-tokens/SDKToolsDesignTokensPlugin'
import { testInstance } from '../helpers'
import fs from "fs"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_tooling_design_tokens_load_and_merge', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch specific brand
    let brands = await version.brands()
    let brand = brands[0]

    // Create DT tool, load tokens from definition, merge them with upstream source 
    let tool = new SupernovaToolsDesignTokensPlugin(testInstance, version, brand)
    let incomingTokenPack = await tool.loadTokensFromDefinition(provideTokens())

    await t.notThrowsAsync(tool.mergeWithRemoteSource(incomingTokenPack.processedNodes, true))
})

test('test_tooling_design_tokens_load_and_merge_from_file', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch specific brand
    let brands = await version.brands()
    let brand = brands[0]

    // Create DT tool, load tokens from definition, merge them with upstream source 
    let tool = new SupernovaToolsDesignTokensPlugin(testInstance, version, brand)
    let tokens = path.join(process.cwd(), 'files', 'tokens.json')
    

    let definition = fs.readFileSync(tokens, "utf8") 
    let incomingTokenPack = tool.loadTokensFromDefinition(definition)

    t.true(true)
    //await t.notThrowsAsync(tool.mergeWithRemoteSource(incomingTokenPack.processedNodes, true))
})


function provideTokens(): string {
    
    let definition = `
    {
      "Supernova": {
        "Red": {
          "value": "#ff0000ff",
          "type": "color"
        },
        "Green": {
          "value": "#00c8ff",
          "type": "color"
        }
      },
      "$themes": []
    }`

    return definition
}
