//
//  StyleDictionary.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import test from 'ava'
import { JSONBuilderNamingOption, TokenJSONBuilder, TokenJSONBuilderOptions } from '../../tools/json-builder/SDKToolsJSONBuilder'
import { testInstance } from '../helpers'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_tooling_json_builder_to_style_dictionary', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Options
    let options: TokenJSONBuilderOptions = {
        naming: JSONBuilderNamingOption.original,
        includeComments: true,
        includeBrandId: true,
        brandId: null,
        includeType: true,
        includeRootTypeNodes: false,
        type: null,
        multifile: false,
    }

    // Build color representation
    let jsonTooling = new TokenJSONBuilder(testInstance, version)
    let sdRepresentation = await jsonTooling.styleDictionaryRepresentation(options)

    // Test structure
    t.true(sdRepresentation !== undefined || sdRepresentation !== null)
})


test('test_tooling_json_builder_to_figma_tokens_single_file', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Options
    let options: TokenJSONBuilderOptions = {
        naming: JSONBuilderNamingOption.original,
        includeComments: true,
        includeBrandId: true,
        brandId: null,
        includeType: true,
        includeRootTypeNodes: false,
        type: null,
        multifile: false,
    }

    // Build color representation
    let jsonTooling = new TokenJSONBuilder(testInstance, version)
    let figmaTokensRepresentation = await jsonTooling.figmaTokensRepresentation(true)

    console.log(figmaTokensRepresentation)

    // Test structure
    t.true(figmaTokensRepresentation !== undefined || figmaTokensRepresentation !== null)
})