//
//  PluginDesignTokens.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { SupernovaToolsDesignTokensPlugin } from '../../tools/design-tokens/SDKToolsDesignTokensPlugin'
import { testInstance } from '../helpers'
import { TokenJSONBuilder } from '../../tools/json-builder/SDKToolsJSONBuilder'
import { Supernova } from '../..'

import test from 'ava'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import {
  DTPluginToSupernovaMapPack,
  DTPluginToSupernovaMapType
} from '../../tools/design-tokens/utilities/SDKDTJSONLoader'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_tooling_design_tokens_load_and_merge_from_file', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )

  // Fetch brand and themes
  let brands = await version.brands()
  let themes = await version.themes()

  console.log("Themes")
  console.log(themes)

  // Mapping
  let mapping: DTPluginToSupernovaMapPack = [
    {
      nodes: null,
      processedNodes: null,
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: '079b44a8b28ed46aff5be1542d750aaa108d08e1', // Light theme as default values
      bindToBrand: '42d93b8e-ef03-4c0d-bf77-cbbb12a3953a', // Default brand
      bindToTheme: null // No theme - binding to default token values,
    },
    {
      nodes: null,
      processedNodes: null,
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: 'd7f7ed73c544a76604e81ff7a6be59bc9ab43fad', // Dark theme as default value
      bindToBrand: '42d93b8e-ef03-4c0d-bf77-cbbb12a3953a', // Default brand
      bindToTheme: 'a47eef50-fb6d-4c01-b9be-76b7a094d510' // Dark Mode
    }
  ]


  // Create DT tool, load tokens from definition, merge them with upstream source
  let tool = new SupernovaToolsDesignTokensPlugin(version)
  let tokens = path.join(process.cwd(), 'files', 'tokens.json')
  let definition = fs.readFileSync(tokens, 'utf8')
  let processedMaps = tool.loadTokensFromDefinition(definition, mapping, brands)
  for (let map of processedMaps) {
    // First, process default values for tokens, for each brand, separately, skipping themes as they need to be created later
    if (map.bindToTheme) {
      continue
    }
    // Find the destination brand
    let brand = brands.find(b => b.persistentId === map.bindToBrand)
    if (!brand) {
      throw new Error(`Unknown brand provided in binding`)
    }
    await t.notThrowsAsync(tool.mergeWithRemoteSource(map.processedNodes, brand, true))
    console.log(`Finished map synchronization: Synchronized base tokens for brand ${brand.name}`)
  }

  for (let map of processedMaps) {
    // Merge all remaining themes
    if (!map.bindToTheme) {
      continue
    }
    // Find the destination brand
    let brand = brands.find(b => b.persistentId === map.bindToBrand)
    if (!brand) {
      throw new Error(`Unknown brand provided in binding`)
    }
    // Find the destination theme
    let theme = themes.find(t => t.id === map.bindToTheme)
    if (!theme) {
      throw new Error(`Unknown theme provided in binding`)
    }
    await t.notThrowsAsync(tool.mergeThemeWithRemoteSource(map.processedNodes, brand, theme, true))
    console.log(`Finished map synchronization: Synchronized themed tokens for brand ${brand.name}, theme ${theme.name}`)
  }
})

/*
test('test_tooling_design_tokens_reverse_load', async t => {
  // Fetch specific design system version
  let supernova = new Supernova(process.env.TEST_API_KEY, process.env.TEST_API_URL, null)

  // Disable caching system so the tokens can be retrieved properly with each tool pass
  supernova.setResolutionCacheEnabled(false)
  let version = await supernova.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )

  // Fetch specific brand
  let brands = await version.brands()
  let brand = brands[0]

  // Mapping
  let mapping: DTPluginToSupernovaMapPack = [
    {
      nodes: null,
      processedNodes: null, 
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: 'ca88ec5b9ef77216df07f6e6ab8edb84daf75453',
      bindToBrand: 'id',
      bindToTheme: null // If not provided, will be default
    },
    {
      nodes: null,
      processedNodes: null, 
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: '5c4398306818a6f47794e6d3ac02ae3709a649b1',
      bindToBrand: 'id',
      bindToTheme: null // If not provided, will be default
    },
    {
      nodes: null,
      processedNodes: null, 
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: '58cc12aa9a1c28268e7478aa8236425156ba5bd8',
      bindToBrand: 'id',
      bindToTheme: null // If not provided, will be default
    }
  ]

  // Load token definition
  let tokens = path.join(process.cwd(), 'files', 'tokens_temporary.json')
  let definition = fs.readFileSync(tokens, 'utf8')

  // Convert tokens to object so we can compare it later
  let originalTokens = JSON.parse(definition)

  // Step 1: Load tokens and sync them with Supernova remote
  let phase1Tool = new SupernovaToolsDesignTokensPlugin(testInstance, version, brand)
  let phase1TokenPack = phase1Tool.loadTokensFromObject(originalTokens, mapping)
  await phase1Tool.mergeWithRemoteSource(phase1TokenPack.processedNodes, true)

  // Step 2: Rebuild tokens from Supernova source
  let phase2Tool = new TokenJSONBuilder(testInstance, version)
  let reconstructedTokens = await phase2Tool.figmaTokensRepresentation(true)

  // Step 3: Compare tokens with the initial definition and test
  t.deepEqual(originalTokens, reconstructedTokens)
})
*/
