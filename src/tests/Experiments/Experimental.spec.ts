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
import { ColorToken, SupernovaToolsStyleDictionary } from '../..'
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
})


test('test_experimental_token_write', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch specific brand
    let brands = await version.brands()
    let brand = brands[0]

    // Fetch groups
    let groups = await brand.tokenGroups()
    let group = groups.filter(g => g.isRoot && g.tokenType === TokenType.color)[0]

    // Construct fake token and assign it to the group
    let writer = brand.writer()
    let token = ColorToken.create(version, brand, "primary-color", "My new imported token", "#123456ff", undefined)
    let referencedToken = ColorToken.create(version, brand, "primary-referenced-color", "My new imported token created as reference", token.value.hex, token)
    let updatedGroup = group.toMutatedObject(group.childrenIds.concat([token.id, referencedToken.id]))

    await t.notThrowsAsync(writer.writeTokens([token, referencedToken], [updatedGroup]))
})
