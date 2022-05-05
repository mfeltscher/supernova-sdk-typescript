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
import { SupernovaToolsStyleDictionary } from '../..'
import { TokenType } from '../../exports'
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
    console.log(JSON.stringify(sdRepresentation, null, 2))
})

