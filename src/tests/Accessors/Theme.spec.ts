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


test('test_theme_resolution_from_version', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let tokens = await version.tokens()
    let themes = await version.themes()
    let firstTheme = themes[0]
    let themedTokens = await version.tokensByApplyingThemes(tokens.map(t => t.id), [firstTheme.id])

    // Test that number of themed and unthemed tokens is what was requested
    t.is(themedTokens.filter(t => t.themeId === null).length, tokens.length - firstTheme.overriddenTokens.length)
    t.is(themedTokens.filter(t => t.themeId !== null).length, firstTheme.overriddenTokens.length)
    t.is(themedTokens.length, tokens.length)
})


test('test_theme_resolution_from_brand', async t => {

    // Fetch specific design system version and brand
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brands = await version.brands()
    let firstBrand = brands[0]

    let tokens = await firstBrand.tokens()
    let themes = await firstBrand.themes()
    let firstTheme = themes[0]

    let themedTokens = await firstBrand.tokensByApplyingThemes([firstTheme.id])

    // Test that number of themed and unthemed tokens is what was requested in regards to that single brand
    t.is(themedTokens.filter(t => t.themeId === null).length, tokens.length - firstTheme.overriddenTokens.length)
    t.is(themedTokens.filter(t => t.themeId !== null).length, firstTheme.overriddenTokens.length)
    t.is(themedTokens.length, tokens.length)
})







