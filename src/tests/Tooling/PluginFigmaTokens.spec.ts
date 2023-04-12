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

import test from 'ava'
import path from 'path'
import * as fs from 'fs'
import _ from 'lodash'
import { SupernovaError } from '../../core/errors/SDKSupernovaError'
import {
  DTPluginToSupernovaMap,
  DTPluginToSupernovaMapPack,
  DTPluginToSupernovaMappingFile,
  DTPluginToSupernovaMapType,
  DTPluginToSupernovaSettings
} from '../../tools/design-tokens/utilities/SDKDTMapLoader'
import { Token } from '../../model/tokens/SDKToken'
import { ColorToken } from './../../index'

test.serial.beforeEach(setup)

async function setup(t) {
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID_EDIT,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID_EDIT
  )

  // Path to file
  let dataFilePath = path.join(process.cwd(), 'test-resources', 'figma-tokens', 'cleanup', 'tokens.json')
  let mappingFilePath = path.join(
    process.cwd(),
    'test-resources',
    'figma-tokens',
    'cleanup',
    'supernova.settings.json'
  )

  // Get Figma Tokens synchronization tool
  let syncTool = new SupernovaToolsDesignTokensPlugin(version)
  let dataLoader = new FigmaTokensDataLoader()
  let tokenDefinition = await dataLoader.loadTokensFromPath(dataFilePath)
  let configDefinition = dataLoader.loadConfigFromPath(mappingFilePath)

  // Run sync
  await syncTool.synchronizeTokensFromData(tokenDefinition, configDefinition.mapping, configDefinition.settings)
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_tooling_design_tokens_load_and_merge_from_file', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID_EDIT,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID_EDIT
  )

  // Path to file
  let dataFilePath = path.join(process.cwd(), 'test-resources', 'figma-tokens', 'single-file-sync', 'tokens.json')
  let mappingFilePath = path.join(
    process.cwd(),
    'test-resources',
    'figma-tokens',
    'single-file-sync',
    'supernova.settings.json'
  )

  // Get Figma Tokens synchronization tool
  let syncTool = new SupernovaToolsDesignTokensPlugin(version)
  let dataLoader = new FigmaTokensDataLoader()
  let tokenDefinition = await dataLoader.loadTokensFromPath(dataFilePath)
  let configDefinition = dataLoader.loadConfigFromPath(mappingFilePath)

  // Run sync
  await t.notThrowsAsync(syncTool.synchronizeTokensFromData(tokenDefinition, configDefinition.mapping, configDefinition.settings))
})

test('test_tooling_design_tokens_load_and_merge_from_file_using_names', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID_EDIT,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID_EDIT
  )

  // Path to file
  let dataFilePath = path.join(
    process.cwd(),
    'test-resources',
    'figma-tokens',
    'single-file-sync-using-names',
    'tokens.json'
  )
  let mappingFilePath = path.join(
    process.cwd(),
    'test-resources',
    'figma-tokens',
    'single-file-sync-using-names',
    'supernova.settings.json'
  )

  // Get Figma Tokens synchronization tool
  let syncTool = new SupernovaToolsDesignTokensPlugin(version)
  let dataLoader = new FigmaTokensDataLoader()
  let tokenDefinition = await dataLoader.loadTokensFromPath(dataFilePath)
  let configDefinition = dataLoader.loadConfigFromPath(mappingFilePath)

  // Run sync
  await t.notThrowsAsync(syncTool.synchronizeTokensFromData(tokenDefinition, configDefinition.mapping, configDefinition.settings))
})

test('test_tooling_design_tokens_load_and_merge_from_directory', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID_EDIT,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID_EDIT
  )

  // Path to file
  let dataFilePath = path.join(process.cwd(), 'test-resources', 'figma-tokens', 'multi-file-sync')
  let mappingFilePath = path.join(
    process.cwd(),
    'test-resources',
    'figma-tokens',
    'multi-file-sync',
    'supernova.settings.json'
  )

  // Get Figma Tokens synchronization tool
  let syncTool = new SupernovaToolsDesignTokensPlugin(version)
  let dataLoader = new FigmaTokensDataLoader()
  let tokenDefinition = await dataLoader.loadTokensFromDirectory(dataFilePath, mappingFilePath)
  let configDefinition = dataLoader.loadConfigFromPath(mappingFilePath)

  // Run sync
  await t.notThrowsAsync(syncTool.synchronizeTokensFromData(tokenDefinition, configDefinition.mapping, configDefinition.settings))
})

test.failing('test_tooling_design_tokens_test', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID_EDIT,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID_EDIT
  )

  // Path to file
  let dataFilePath = path.join(process.cwd(), 'test-resources', 'figma-tokens', 'test', 'global_testbed.json')
  let mappingFilePath = path.join(process.cwd(), 'test-resources', 'figma-tokens', 'test', 'supernova.settings.json')

  // Get Figma Tokens synchronization tool
  let syncTool = new SupernovaToolsDesignTokensPlugin(version)
  let dataLoader = new FigmaTokensDataLoader()
  let tokenDefinition = await dataLoader.loadTokensFromPath(dataFilePath)
  let configDefinition = dataLoader.loadConfigFromPath(mappingFilePath)

  // Run sync
  await t.notThrowsAsync(syncTool.synchronizeTokensFromData(tokenDefinition, configDefinition.mapping, configDefinition.settings))
})

// ENG-870 - deep links in references combined with order
test('test_tooling_design_tokens_chakra', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID_EDIT,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID_EDIT
  )

  // Path to file
  let dataFilePath = path.join(process.cwd(), 'test-resources', 'figma-tokens', 'chakra-min')
  let mappingFilePath = path.join(process.cwd(), 'test-resources', 'figma-tokens', 'chakra-min', 'supernova.settings.json')

  // Get Figma Tokens synchronization tool
  let syncTool = new SupernovaToolsDesignTokensPlugin(version)
  let dataLoader = new FigmaTokensDataLoader()
  let tokenDefinition = await dataLoader.loadTokensFromDirectory(dataFilePath, mappingFilePath)
  let configDefinition = dataLoader.loadConfigFromPath(mappingFilePath)

  // Run sync
  await t.notThrowsAsync(syncTool.synchronizeTokensFromData(tokenDefinition, configDefinition.mapping, configDefinition.settings))
})

// Tokens that were not in upstream, but are referenced in this theme
test('test_tooling_design_tokens_prism', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID_EDIT,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID_EDIT
  )

  // Path to file
  let dataFilePath = path.join(process.cwd(), 'test-resources', 'figma-tokens', 'prism-min')
  let mappingFilePath = path.join(process.cwd(), 'test-resources', 'figma-tokens', 'prism-min', 'supernova.settings.json')

  // Get Figma Tokens synchronization tool
  let syncTool = new SupernovaToolsDesignTokensPlugin(version)
  let dataLoader = new FigmaTokensDataLoader()
  let tokenDefinition = await dataLoader.loadTokensFromDirectory(dataFilePath, mappingFilePath)
  let configDefinition = dataLoader.loadConfigFromPath(mappingFilePath)

  // Run sync
  await t.notThrowsAsync(syncTool.synchronizeTokensFromData(tokenDefinition, configDefinition.mapping, configDefinition.settings))
})


test('test_tooling_design_tokens_order', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID_EDIT,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID_EDIT
  )

  // Path to file
  let dataFilePath = path.join(process.cwd(), 'test-resources', 'figma-tokens', 'token-order-sync')
  let mappingFilePath = path.join(
    process.cwd(),
    'test-resources',
    'figma-tokens',
    'token-order-sync',
    'supernova.settings.json'
  )

  // Get Figma Tokens synchronization tool
  let syncTool = new SupernovaToolsDesignTokensPlugin(version)
  let dataLoader = new FigmaTokensDataLoader()
  let tokenDefinition = await dataLoader.loadTokensFromDirectory(dataFilePath, mappingFilePath)
  let configDefinition = dataLoader.loadConfigFromPath(mappingFilePath)

  // Run sync
  await t.notThrowsAsync(syncTool.synchronizeTokensFromData(tokenDefinition, configDefinition.mapping, configDefinition.settings))

  const validateToken = (tokens: Token[], description: string, hex: string, name: string) => {
    const token = tokens.filter(t => t.description === description)[0] as ColorToken
    t.true(!!token)
    const ref = tokens.filter(t => t.id === token.value.referencedToken.id)[0] as ColorToken
    t.true(!!ref)
    t.is(token.value.hex, hex)
    t.is(ref.value.hex, hex)
    t.is(ref.name, name)
  }

  const tokens = await version.tokens()
  validateToken(tokens, 'ocean-primary-default', '0000ffff', 'blue')
  validateToken(tokens, 'forest-primary-default', '00ff00ff', 'green')
})


// EPDA-167
test('test_tooling_design_tokens_same_path_and_value', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID_EDIT,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID_EDIT
  )

  // Path to file
  let dataFilePath = path.join(process.cwd(), 'test-resources', 'figma-tokens', 'same-path-and-value', 'data')
  let mappingFilePath = path.join(
    process.cwd(),
    'test-resources',
    'figma-tokens',
    'same-path-and-value',
    'supernova-1.settings.json'
  )

  // Get Figma Tokens synchronization tool
  let syncTool = new SupernovaToolsDesignTokensPlugin(version)
  let dataLoader = new FigmaTokensDataLoader()
  let tokenDefinition = await dataLoader.loadTokensFromDirectory(dataFilePath, mappingFilePath)
  let configDefinition = dataLoader.loadConfigFromPath(mappingFilePath)

  // Run sync
  await t.notThrowsAsync(syncTool.synchronizeTokensFromData(tokenDefinition, configDefinition.mapping, configDefinition.settings))

  const tokens = await version.tokens()
  const themes = await version.themes()
  const theme = themes[0]

  // Validate base
  validateToken(t, tokens, 'fg', '00ff00ff')
  validateToken(t, tokens, 'bg', '0000ffff')

  // Validate theme
  validateToken(t, theme.overriddenTokens, 'bg', '00ff00ff')
  validateNoToken(t, theme.overriddenTokens, 'fg')

  let mappingFilePath2 = path.join(
    process.cwd(),
    'test-resources',
    'figma-tokens',
    'same-path-and-value',
    'supernova-2.settings.json'
  )
  let tokenDefinition2 = await dataLoader.loadTokensFromDirectory(dataFilePath, mappingFilePath2)
  let configDefinition2 = dataLoader.loadConfigFromPath(mappingFilePath2)

  // Run sync
  await t.notThrowsAsync(syncTool.synchronizeTokensFromData(tokenDefinition2, configDefinition2.mapping, configDefinition2.settings))
  const tokens2 = await version.tokens()
  const themes2 = await version.themes()
  const theme2 = themes2[0]

  // Validate base
  validateToken(t, tokens2, 'fg', '00ff00ff')
  validateToken(t, tokens2, 'bg', '0000ffff')

  // Validate theme
  validateNoToken(t, theme2.overriddenTokens, 'bg')
  validateToken(t, theme2.overriddenTokens, 'fg', '0000ffff')
})

// EPDA-168
test('test_tooling_design_tokens_precise_with_override', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID_EDIT,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID_EDIT
  )

  // Path to file
  let dataFilePath = path.join(process.cwd(), 'test-resources', 'figma-tokens', 'same-path-and-value', 'data')
  let mappingFilePath = path.join(
    process.cwd(),
    'test-resources',
    'figma-tokens',
    'same-path-and-value',
    'supernova-1.settings.json'
  )

  // Get Figma Tokens synchronization tool
  let syncTool = new SupernovaToolsDesignTokensPlugin(version)
  let dataLoader = new FigmaTokensDataLoader()
  let tokenDefinition = await dataLoader.loadTokensFromDirectory(dataFilePath, mappingFilePath)
  let configDefinition = dataLoader.loadConfigFromPath(mappingFilePath)

  // Run sync
  await t.notThrowsAsync(syncTool.synchronizeTokensFromData(tokenDefinition, configDefinition.mapping, configDefinition.settings))

  const tokens = await version.tokens()
  const themes = await version.themes()
  const theme = themes[0]

  // Validate base
  validateToken(t, tokens, 'fg', '00ff00ff')
  validateToken(t, tokens, 'bg', '0000ffff')

  // Validate theme
  t.is(theme.overriddenTokens.length, 1)
  validateToken(t, theme.overriddenTokens, 'bg', '00ff00ff')
  validateNoToken(t, theme.overriddenTokens, 'fg')

  let mappingFilePath2 = path.join(
    process.cwd(),
    'test-resources',
    'figma-tokens',
    'same-path-and-value',
    'supernova-precise.settings.json'
  )
  let tokenDefinition2 = await dataLoader.loadTokensFromDirectory(dataFilePath, mappingFilePath2)
  let configDefinition2 = dataLoader.loadConfigFromPath(mappingFilePath2)

  // Run sync
  await t.notThrowsAsync(syncTool.synchronizeTokensFromData(tokenDefinition2, configDefinition2.mapping, configDefinition2.settings))
  const tokens2 = await version.tokens()
  const themes2 = await version.themes()
  const theme2 = themes2[0]

  // Validate base
  validateToken(t, tokens2, 'bg', '0000ffff')
  validateToken(t, tokens2, 'fg', '00ff00ff')
  validateToken(t, tokens2, 'primary', 'ffffffff')

  // Validate theme
  t.is(theme2.overriddenTokens.length, 0)
  validateNoToken(t, theme2.overriddenTokens, 'bg')
  validateNoToken(t, theme2.overriddenTokens, 'fg')
  validateNoToken(t, theme2.overriddenTokens, 'primary')
})

const validateToken = (t: any, tokens: Token[], name: string, hex: string) => {
  const token = tokens.filter(t => t.name === name)[0] as ColorToken
  t.true(!!token)
  t.is(token.value.hex, hex)
}

const validateNoToken = (t: any, tokens: Token[], name: string) => {
  const token = tokens.filter(t => t.name === name)[0] as ColorToken
  t.true(!token)
}

export class FigmaTokensDataLoader {

  /** Load token definitions from path */
  async loadTokensFromPath(pathToFile: string): Promise<object> {
    try {
      if (!(fs.existsSync(pathToFile) && fs.lstatSync(pathToFile).isFile())) {
        throw SupernovaError.fromProcessingError(
          `Provided token file directory ${pathToFile} is not a file or doesn't exist`
        )
      }

      let definition = fs.readFileSync(pathToFile, 'utf8')
      let parsedDefinition = this.parseDefinition(definition)
      return parsedDefinition
    } catch (error) {
      throw SupernovaError.fromProcessingError('Unable to load JSON definition file: ' + error)
    }
  }

  async loadTokensFromDirectory(pathToDirectory: string, settingsPath: string): Promise<object> {
    try {
      let fullStructuredObject = {}

      if (!(fs.existsSync(pathToDirectory) && fs.lstatSync(pathToDirectory).isDirectory())) {
        throw SupernovaError.fromProcessingError(
          `Provided data directory ${pathToDirectory} is not a directory or doesn't exist`
        )
      }

      let jsonPaths = this.getAllJSONFiles(pathToDirectory)
      for (let path of jsonPaths) {
        if (path.endsWith('json') && path !== settingsPath && !path.includes('$')) {
          let result = await this.loadObjectFile(path)
          if (typeof result === 'object') {
            // let name = this.getFileNameWithoutExtension(path)
            let name = this.getSetKey(path, pathToDirectory)
            fullStructuredObject[name] = result
          }
        }
      }

      // Try to load themes, if any
      let themePath = pathToDirectory + '/' + '$themes.json'
      if (fs.existsSync(themePath)) {
        let themes = await this.loadObjectFile(themePath)
        fullStructuredObject['$themes'] = themes
      }

      // Try to load metadata, if any
      let metadataPath = pathToDirectory + '/' + '$metadata.json'
      if (fs.existsSync(metadataPath)) {
        let metadata = await this.loadObjectFile(metadataPath)
        fullStructuredObject['$metadata'] = metadata
      }

      return fullStructuredObject
    } catch (error) {
      throw SupernovaError.fromProcessingError('Unable to load JSON definition file: ' + error)
    }
  }

  private getAllJSONFiles(dir: string): string[] {
    const files = fs.readdirSync(dir)
    const jsonFiles = []

    for (const file of files) {
      const filePath = `${dir}/${file}`
      const fileStat = fs.statSync(filePath)

      if (fileStat.isDirectory()) {
        jsonFiles.push(...this.getAllJSONFiles(filePath))
      } else if (fileStat.isFile() && filePath.endsWith('.json')) {
        jsonFiles.push(filePath)
      }
    }

    return jsonFiles
  }

  private getFileNameWithoutExtension(filePath: string): string {
    const fileStat = fs.statSync(filePath)

    if (!fileStat.isFile()) {
      throw new Error(`${filePath} is not a file`)
    }

    return path.basename(filePath, path.extname(filePath))
  }

  private getSetKey(jsonFilePath: string, loadedDirectory: string): string {
    return jsonFilePath.substring(loadedDirectory.length + 1, jsonFilePath.length - 5)
  }

  loadConfigFromPath(
    pathToFile: string
  ): {
    mapping: DTPluginToSupernovaMapPack
    settings: DTPluginToSupernovaSettings
  } {
    try {
      if (!(fs.existsSync(pathToFile) && fs.lstatSync(pathToFile).isFile())) {
        throw SupernovaError.fromProcessingError(
          `Provided configuration file directory ${pathToFile} is not a file or doesn't exist`
        )
      }

      let definition = fs.readFileSync(pathToFile, 'utf8')
      let parsedDefinition = this.parseDefinition(definition) as DTPluginToSupernovaMappingFile
      this.weakValidateMapping(parsedDefinition)
      return this.processFileToMapping(parsedDefinition)
    } catch (error) {
      throw SupernovaError.fromProcessingError('Unable to load JSON definition file: ' + error)
    }
  }

  private weakValidateMapping(mapping: DTPluginToSupernovaMappingFile) {
    if (
      !mapping.hasOwnProperty('mode') ||
      typeof mapping.mode !== 'string' ||
      (mapping.mode !== 'multi-file' && mapping.mode !== 'single-file')
    ) {
      throw SupernovaError.fromProcessingError(
        'Unable to load mapping file: `mode` must be provided [single-file or multi-file]`'
      )
    }
    if (!mapping.mapping || !(mapping.mapping instanceof Array)) {
      throw SupernovaError.fromProcessingError('Unable to load mapping file: `mapping` key must be present and array.')
    }
    let mapPack = mapping.mapping
    for (let map of mapPack) {
      if (typeof map !== 'object') {
        throw SupernovaError.fromProcessingError('Unable to load mapping file: `mapping` must contain objects only')
      }
      if (!map.tokenSets && !map.tokensTheme) {
        throw SupernovaError.fromProcessingError(
          'Unable to load mapping file: `mapping` must contain either `tokensTheme` or `tokenSets`'
        )
      }
      if (map.tokenSets && map.tokensTheme) {
        throw SupernovaError.fromProcessingError(
          'Unable to load mapping file: `mapping` must not contain both `tokensTheme` or `tokenSets`'
        )
      }
      if (map.tokenSets && (!(map.tokenSets instanceof Array) || (map.tokenSets as Array<any>).length === 0)) {
        throw SupernovaError.fromProcessingError(
          'Unable to load mapping file: `mapping`.`tokenSets` must be an Array with at least one entry'
        )
      }
      if (map.tokensTheme && (typeof map.tokensTheme !== 'string' || (map.tokensTheme as string).length === 0)) {
        throw SupernovaError.fromProcessingError(
          'Unable to load mapping file: `mapping`.`tokensTheme` must be a non-empty string'
        )
      }
      if (!map.supernovaBrand || typeof map.supernovaBrand !== 'string' || map.supernovaBrand.length === 0) {
        throw SupernovaError.fromProcessingError(
          'Unable to load mapping file: `supernovaBrand` must be a non-empty string'
        )
      }
      if (map.supernovaTheme && (typeof map.supernovaTheme !== 'string' || map.supernovaTheme.length === 0)) {
        throw SupernovaError.fromProcessingError(
          'Unable to load mapping file: `supernovaTheme` may be empty but must be non-empty string if not'
        )
      }
    }

    if (mapping.settings) {
      if (typeof mapping.settings !== 'object') {
        throw SupernovaError.fromProcessingError('Unable to load mapping file: `settings` must be an object')
      }
      if (mapping.settings.hasOwnProperty('dryRun') && typeof mapping.settings.dryRun !== 'boolean') {
        throw SupernovaError.fromProcessingError('Unable to load mapping file: `dryRun` must be of boolan type')
      }
      if (mapping.settings.hasOwnProperty('verbose') && typeof mapping.settings.verbose !== 'boolean') {
        throw SupernovaError.fromProcessingError('Unable to load mapping file: `verbose` must be of boolan type')
      }
      if (mapping.settings.hasOwnProperty('preciseCopy') && typeof mapping.settings.preciseCopy !== 'boolean') {
        throw SupernovaError.fromProcessingError('Unable to load mapping file: `preciseCopy` must be of boolan type')
      }
    }
  }

  private processFileToMapping(
    mapping: DTPluginToSupernovaMappingFile
  ): {
    mapping: DTPluginToSupernovaMapPack
    settings: DTPluginToSupernovaSettings
  } {
    let result = new Array<DTPluginToSupernovaMap>()
    for (let map of mapping.mapping) {
      result.push({
        type: map.tokenSets ? DTPluginToSupernovaMapType.set : DTPluginToSupernovaMapType.theme,
        pluginSets: map.tokenSets,
        pluginTheme: map.tokensTheme ?? null,
        bindToBrand: map.supernovaBrand,
        bindToTheme: map.supernovaTheme ?? null,
        nodes: null,
        processedNodes: null,
        processedGroups: null
      })
    }

    let settings: DTPluginToSupernovaSettings = {
      dryRun: mapping.settings?.dryRun ?? false,
      verbose: mapping.settings?.verbose ?? false,
      preciseCopy: mapping.settings?.preciseCopy ?? false
    }

    return {
      mapping: result,
      settings: settings
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - File Parser

  private parseDefinition(definition: string): object {
    try {
      let object = JSON.parse(definition)
      if (typeof object !== 'object') {
        throw SupernovaError.fromProcessingError(
          'Invalid Supernova mapping definition JSON file - root level entity must be object'
        )
      }
      return object
    } catch (error) {
      throw SupernovaError.fromProcessingError(
        'Invalid Supernova mapping definition JSON file - file structure invalid'
      )
    }
  }


  private async loadObjectFile(pathToFile: string): Promise<object> {
    try {
      if (!(fs.existsSync(pathToFile) && fs.lstatSync(pathToFile).isFile())) {
        throw SupernovaError.fromProcessingError(
          `Provided token file directory ${pathToFile} is not a file or doesn't exist`
        )
      }

      let definition = fs.readFileSync(pathToFile, 'utf8')
      let parsedDefinition = this.parseDefinition(definition)
      return parsedDefinition
    } catch (error) {
      throw SupernovaError.fromProcessingError('Unable to load JSON definition file: ' + error)
    }
  }
}
