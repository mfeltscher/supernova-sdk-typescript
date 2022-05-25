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
import { uuid } from 'uuidv4'
import { Brand, ColorToken, DesignSystemVersion, SupernovaToolsStyleDictionary, Token, TokenGroup } from '../..'
import { TokenType } from '../../exports'
import { SupernovaToolsDesignTokensPluginConverter } from '../../tools/SDKToolsDesignTokensPluginConverter'
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
    let writeDefinitions = provideTokens()
    let writeObject = constructTokens(version, brand, group, writeDefinitions)
    console.log(writeObject)

    await t.notThrowsAsync(writer.writeTokens(writeObject.tokens, writeObject.tokenGroups))
    // await t.notThrowsAsync(writer.writeTokens([], []))
})


function constructTokens(version: DesignSystemVersion, brand: Brand, root: TokenGroup, definitions: Array<{
    name: string
    path: Array<string>
    color: string
}>): {
    tokens: Array<Token>
    tokenGroups: Array<TokenGroup>
} {

    let tokens = new Array<Token>()

    // Set main root group
    let mappedGroups: Map<string, TokenGroup> = new Map<string, TokenGroup>()
    mappedGroups.set("", root)

    for (let definition of definitions) {
        let groupKey = definition.path.join(".")
        let constructedToken = ColorToken.create(version, brand, definition.name, "", definition.color, undefined)
        tokens.push(constructedToken)
        constructGroupChain(version, brand, mappedGroups, definition.path)
        let group = mappedGroups.get(groupKey)
        group = group.toMutatedObject(group.childrenIds.concat(constructedToken.id))
        mappedGroups.set(groupKey, group)
    }

    return {
        tokens: tokens,
        tokenGroups: Array.from(mappedGroups.values()),
    }
}


function constructGroupChain(version: DesignSystemVersion, brand: Brand, groups: Map<string, TokenGroup>, path: Array<string>) {

    if (path.length === 0) {
        return
    }

    // Get parent object
    let parentPath = ""
    let parent = groups.get(parentPath)

    let partialPath: Array<string> = []
    for (let segment of path) {
        partialPath.push(segment)
        let partialKey = partialPath.join(".")
        let object = groups.get(partialKey)
        if (object) {
            // Path exists so we don't do anything else
        } else {
            // Path doesn't exist, we create it
            let group = new TokenGroup({
                brandId: brand.persistentId,
                tokenType: TokenType.color,
                designSystemVersionId: version.id,
                persistentId: uuid(),
                isRoot: false,
                id: undefined,
                meta: {
                  name: segment,
                  description: ""
                },
                childrenIds: []
            })
            
            // Assign to parent
            parent = parent.toMutatedObject(parent.childrenIds.concat(group.id))
            groups.set(parentPath, parent)
            parent = group

            // Store group
            groups.set(partialKey, group)
            parentPath = partialKey
        }
    }
}


function provideTokens() {

    let parser = new SupernovaToolsDesignTokensPluginConverter()
    /*
    let tokens = parser.parseDesignTokensDefinitionJSON(`
    {
        "colors": {
            "Black": "#212121",
            "White": "#ffffff",
            "Primary ": {
            "100": "#e9f4ff",
            "200": "#d2e9ff",
            "300": "#8fc8ff",
            "400": "#4ba6ff",
            "500": "#1e90ff",
            "600": "#1565b3",
            "700": "#0c3a66",
            "800": "#061d33",
            "900": "#030e19"
            },
            "Secondary ": {
            "100": "#e7efff",
            "200": "#cfdffe",
            "300": "#a0bffd",
            "400": "#709ffd",
            "500": "#115ffb",
            "600": "#0a3997",
            "700": "#072664",
            "800": "#031332",
            "900": "#020919"
            }
        }
    }
    `)*/
    
    let tokens = parser.parseDesignTokensDefinitionJSON(`
    {
        "colors": {
            "Black": "#212121",
            "White": "#ffffff",
            "Primary": {
                "100": "#e9f4ff",
                "200": "#d2e9ff",
                "300": "#8fc8ff",
                "400": "#4ba6ff",
                "500": "#1e90ff",
                "600": "#1565b3",
                "700": "#0c3a66",
                "800": "#061d33",
                "900": "#030e19"
            },
            "Secondary": {
              "100": "#e7efff",
              "200": "#cfdffe",
              "300": "#a0bffd",
              "400": "#709ffd",
              "500": "#115ffb",
              "600": "#0a3997",
              "700": "#072664",
              "800": "#031332",
              "900": "#020919"
            }
        }
    }
    `)
    return tokens
}
