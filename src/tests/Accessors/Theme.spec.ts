//
//  Theme.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import test from 'ava'
import { AnyToken } from '../../model/tokens/SDKTokenValue'
import { testInstance } from '../helpers'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_theme', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let themes = (await version.themes())

    t.true(themes.length > 0)
})


test('test_theme_override', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let theme = (await version.themes())[0]

    t.true(theme.overriddenTokens.length > 1)
})


test('test_theme_resolution', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let tokens = await version.tokens()
    let themes = await version.themes()
    let themedTokens = await version.tokensByApplyingThemes(tokens.map(t => t.id), themes.map(t => t.id))

    // Test that we have both themed and unthemed tokens, when applied
    t.true(themedTokens.filter(t => t.themeId === null).length > 0)
    t.true(themedTokens.filter(t => t.themeId !== null).length > 0)
})





