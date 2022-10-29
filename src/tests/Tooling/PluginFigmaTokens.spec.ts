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

test('test_tooling_design_tokens_load_and_merge', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )

  // Fetch brands and themes
  let brands = await version.brands()
  let themes = await version.themes()

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
    }
  ]

  // Load token definition
  let tokens = path.join(process.cwd(), 'files', 'tokens_real-case-1.json')
  let definition = fs.readFileSync(tokens, 'utf8')

  // Create DT tool, load tokens from definition, merge them with upstream source
  let tool = new SupernovaToolsDesignTokensPlugin(version)
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
  }
})

test('test_tooling_design_tokens_load_and_merge_from_file', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )

  // Fetch brand and themes
  let brands = await version.brands()
  let themes = await version.themes()
  console.log(
    themes.map(t => {
      return {
        name: t.name,
        id: t.id,
        brand: t.brandId
      }
    })
  )

  // Mapping
  let mapping: DTPluginToSupernovaMapPack = [
    {
      nodes: null,
      processedNodes: null,
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: '5c4398306818a6f47794e6d3ac02ae3709a649b1', // "Brand A - Light Mode" plugin theme
      bindToBrand: '9140da27-4478-4856-921a-696d6a3bd3d5', // Brand A
      bindToTheme: null // No theme - binding to default token values,
    },
    {
      nodes: null,
      processedNodes: null,
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: '12a614e62a2c8bcc0781820b59f7df6f2a4e30d6', // "Brand B - Light Mode" plugin theme
      bindToBrand: '50826250-56a8-11ed-854c-8516ec9e182f', // Brand B
      bindToTheme: null // No theme - binding to default token values
    },
    {
      nodes: null,
      processedNodes: null,
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: '58cc12aa9a1c28268e7478aa8236425156ba5bd8', // "Brand A - Dark Mode" plugin theme
      bindToBrand: '9140da27-4478-4856-921a-696d6a3bd3d5', // Brand A
      bindToTheme: '7e477820-1068-45df-a220-35bdc0ea1b16' // Dark Mode
    },
    {
      nodes: null,
      processedNodes: null,
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: 'f061c7e5f70b83702d62cf09978fb074c06f40d4', // "Brand B - Dark Mode" plugin theme
      bindToBrand: '50826250-56a8-11ed-854c-8516ec9e182f', // Brand B
      bindToTheme: '3e784eb0-5777-11ed-b077-993e4d6a5bda' // Dark Mode
    }


    /*
    {
      nodes: null,
      processedNodes: null,
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: 'ca88ec5b9ef77216df07f6e6ab8edb84daf75453', // Headless base plugin theme
      bindToBrand: '9140da27-4478-4856-921a-696d6a3bd3d5', // Brand A
      bindToTheme: null // No theme - binding to default token values,
    },
    {
      nodes: null,
      processedNodes: null,
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: 'ca88ec5b9ef77216df07f6e6ab8edb84daf75453', // Headless base plugin theme
      bindToBrand: '50826250-56a8-11ed-854c-8516ec9e182f', // Brand B
      bindToTheme: null // No theme - binding to default token values
    },
    {
      nodes: null,
      processedNodes: null,
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: '5c4398306818a6f47794e6d3ac02ae3709a649b1', // "Brand A - Light Mode" plugin theme
      bindToBrand: '9140da27-4478-4856-921a-696d6a3bd3d5', // Brand A
      bindToTheme: 'fa9e7700-5776-11ed-b077-993e4d6a5bda' // Light Mode
    },
    {
      nodes: null,
      processedNodes: null,
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: '58cc12aa9a1c28268e7478aa8236425156ba5bd8', // "Brand A - Dark Mode" plugin theme
      bindToBrand: '9140da27-4478-4856-921a-696d6a3bd3d5', // Brand A
      bindToTheme: '7e477820-1068-45df-a220-35bdc0ea1b16' // Dark Mode
    },
    {
      nodes: null,
      processedNodes: null,
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: '12a614e62a2c8bcc0781820b59f7df6f2a4e30d6', // "Brand B - Light Mode" plugin theme
      bindToBrand: '50826250-56a8-11ed-854c-8516ec9e182f', // Brand B
      bindToTheme: '4f2e9110-5777-11ed-b077-993e4d6a5bda' // Light Mode
    },
    {
      nodes: null,
      processedNodes: null,
      processedGroups: null,
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: 'f061c7e5f70b83702d62cf09978fb074c06f40d4', // "Brand B - Dark Mode" plugin theme
      bindToBrand: '50826250-56a8-11ed-854c-8516ec9e182f', // Brand B
      bindToTheme: '3e784eb0-5777-11ed-b077-993e4d6a5bda' // Dark Mode
    }*/
  ]

  /*
  
  */

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
