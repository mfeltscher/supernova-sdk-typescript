//
//  SDKDTJSONLoader.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

export type DTParsedNode = {
  rootKey: string
  name: string
  path: Array<string>
  type: string
  value: any
  description: string | null
}

export type DTParsedTokenSet = {
  name: string
  id: string
  contains: Array<DTParsedNode>
}

export type DTParsedTheme = {
  name: string
  id: string
  selectedTokenSets: Array<DTParsedThemeSetPriorityPair>
}

export type DTParsedThemeSetPriorityPair = {
  set: DTParsedTokenSet
  priority: DTParsedThemeSetPriority
}

export enum DTParsedThemeSetPriority {
  source = 'source',
  enabled = 'enabled',
  disabled = 'disabled'
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Design Tokens Plugin Manipulation Tool */
export class DTJSONParser {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  themeBuffer: Array<DTParsedTheme>

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {
    this.themeBuffer = new Array<DTParsedTheme>()
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Data Parser

  async processPluginDataRepresentation(
    definition: object
  ): Promise<{
    nodes: Array<DTParsedNode>
    themes: Array<DTParsedTheme>
    sets: Array<DTParsedTokenSet>
  }> {
    let sets = this.processSets(definition)
    let nodes = this.parseNode([], definition, sets)
    let themes = this.processThemes(definition, sets)

    let setArray = Array.from(sets.values())

    console.log(`----- Loaded token data:`)
    console.log(`Nodes: ${nodes.length}`)
    console.log(`Sets: ${setArray.length}, ${setArray.map(s => `\n | ${s.name}: ${s.contains.length} nodes`)}`)
    console.log(
      `Themes: ${themes.length}, ${themes.map(
        t =>
          `\n | ${t.name}: ${
            t.selectedTokenSets.filter(s => s.priority !== DTParsedThemeSetPriority.disabled).length
          } sets`
      )}`
    )

    return {
      nodes: nodes,
      sets: Array.from(sets.values()),
      themes: themes
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Theme Parser

  private processThemes(definition: object, tokenSets: Map<string, DTParsedTokenSet>): Array<DTParsedTheme> {
    let themes: Array<DTParsedTheme> = new Array<DTParsedTheme>()
    let order: Array<string> = []

    // Find metadata
    let metadata = definition['$metadata']
    if (metadata) {
      let setOrder = metadata['tokenSetOrder']
      if (setOrder) {
        order = setOrder
      }
    }

    let themeDefinitions = definition['$themes'] // Parse each theme separately
    if (themeDefinitions) {
      for (let themeObject of themeDefinitions) {
        let name = themeObject['name']
        let id = themeObject['id']
        let selectedTokenSets = themeObject['selectedTokenSets']
        if (!name || !id || !selectedTokenSets) {
          // Skip execution of this theme as it doesn't have correct information provided
          throw new Error(
            'Incorrect theme data structure, missing one of required attributes [name, id, selectedTokenSets]'
          )
        }

        // Process token sets
        let pairedSets = new Array<{ name: string; pair: any }>()
        for (let [tokenSetName, unknownPriority] of Object.entries(selectedTokenSets)) {
          let setName = tokenSetName
          let setPriority = unknownPriority
          let fetchedSet = tokenSets.get(setName)
          let pair: DTParsedThemeSetPriorityPair = {
            priority: setPriority as DTParsedThemeSetPriority,
            set: fetchedSet
          }
          pairedSets.push({ name: setName, pair })
        }

        // Respect $metadata.json -> tokenSetOrder
        if (order.length) {
          // We could have process tokens in reverse orders here, and do not replace tokens at all:
          // i.e. trying to resolve higher priority tokens first and add them in DTTokenReferenceResolver
          // but lower priority tokens still could be resolved earlier, so reverse sort order would not help.
          pairedSets.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
        }

        let theme: DTParsedTheme = {
          selectedTokenSets: pairedSets.map(o => o.pair),
          name: name,
          id: id
        }
        themes.push(theme)
      }
    }

    return themes
  }

  private processSets(definition: object): Map<string, DTParsedTokenSet> {
    let sets = new Map<string, DTParsedTokenSet>()

    // Parse top level objects as sets, unless they contain $
    // Value is ignored, as that is parsed separately
    for (let [setName, value] of Object.entries(definition)) {
      if (!setName.startsWith('$')) {
        let set: DTParsedTokenSet = {
          contains: [],
          name: setName,
          id: setName
        }
        sets.set(setName, set)
      }
    }

    return sets
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Node Parser

  private parseNode(path: Array<string>, objects: object, sets: Map<string, DTParsedTokenSet>): Array<DTParsedNode> {
    let result: Array<DTParsedNode> = []
    for (let [name, value] of Object.entries(objects)) {
      if (typeof value === 'object') {
        if (
          (value.hasOwnProperty('value') && value.hasOwnProperty('type')) ||
          (value.hasOwnProperty('$value') && value.hasOwnProperty('$type'))
        ) {
          // Treat as value
          let entity = {
            rootKey: path[0],
            name: name,
            path: path,
            type: value['type'] ?? value['$type'],
            value: value['value'] ?? value['$value'],
            description: value['description'] ?? null
          }
          let set = sets.get(entity.rootKey)
          if (!set) {
            throw new Error('Node references unknown set')
          }
          // Modify entity if it contains color but is really a gradient
          entity = this.modifyEntityForParse(entity)

          set.contains.push(entity)
          result.push(entity)
        } else if (name.startsWith('$')) {
          // Skipping keys internal to design token plugin because we are currently not using them
        } else {
          // Treat as leaf
          result = result.concat(this.parseNode(path.concat(name), value, sets))
        }
      } else {
        throw new Error('Unable to parse, unsupported structure in token node leaf')
      }
    }

    return result
  }

  private modifyEntityForParse(entity: DTParsedNode): DTParsedNode {
    // Modify some entities to be parsed correctly by directly manipulating their values
    // Workaround for differentiating between color and gradient - as they are both defined as color in TS
    if (entity.type === 'color') {
      if (entity.value.includes('linear-gradient')) {
        entity.type = 'gradient'
        entity.value = entity.value.replace('linear-gradient', '')
      } else if (entity.value.includes('radial-gradient')) {
        entity.type = 'gradient'
        entity.value = entity.value.replace('radial-gradient', '')
      }
    }

    // Workaround for opacity not being defined as percentage
    if (entity.type === 'opacity') {
      try {
        const entityValue = entity.value
        const opacity = parseFloat(entity.value)
        const isUnitless = !Number.isNaN(Number(entity.value))
        if (isUnitless && (opacity >= 0 || opacity <= 1)) {
          entity.value = `${opacity * 100}%`
        }
      } catch (e) {
        // Do nothing here
      }
    }

    return entity
  }
}
