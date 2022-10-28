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
import { DTPluginToSupernovaMapPack, DTPluginToSupernovaMapType } from '../../tools/design-tokens/utilities/SDKDTJSONLoader'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_tooling_design_tokens_load_and_merge', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
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
  let tool = new SupernovaToolsDesignTokensPlugin(testInstance, version, brand)
  let incomingTokenPack = tool.loadTokensFromDefinition(definition, mapping)

  await t.notThrowsAsync(tool.mergeWithRemoteSource(incomingTokenPack.processedNodes, true))
})

test('test_tooling_design_tokens_load_and_merge_from_file', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
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
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: 'ca88ec5b9ef77216df07f6e6ab8edb84daf75453',
      bindToBrand: 'id',
      bindToTheme: null // If not provided, will be default
    }
  ]

  // Create DT tool, load tokens from definition, merge them with upstream source
  let tool = new SupernovaToolsDesignTokensPlugin(testInstance, version, brand)
  let tokens = path.join(process.cwd(), 'files', 'tokens.json')
  let definition = fs.readFileSync(tokens, 'utf8')
  let incomingTokenPack = tool.loadTokensFromDefinition(definition, mapping)

  await t.notThrowsAsync(tool.mergeWithRemoteSource(incomingTokenPack.processedNodes, true))
})

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
      type: DTPluginToSupernovaMapType.theme,
      pluginSet: null,
      pluginTheme: 'ca88ec5b9ef77216df07f6e6ab8edb84daf75453',
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
