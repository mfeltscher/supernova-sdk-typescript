# Changelog

All notable changes to this SDK are mentioned here in this changelog.


## [1.8.42] - 2023-26-01
### Design System Switcher

We've added data model to support upcoming design system switcher. The data is available on every design system model:

```typescript
designSystemSwitcher: {
  isEnabled: boolean 
  designSystemIds: Array<string>
}
```


## [1.8.23] - 2022-30-11
### Component and Token Views

We have added option to get component and token views internally. This will be used later for some upcoming features. Additionally:

- Ordering of component properties was fixed
- Ordering of token properties was fixed
- Ordering of table columns was fixed
- Width/height of assets was added to `Asset` object
- Width/height of assets was added to `Frame` object (used in Figma frames, for example)


## [1.8.23] - 2022-30-11
### Option to invoke publication of the documentation from the command line

We have added option to publish documentation using our SDK. To do that, simply use your existing `Documentation` object and call `publish()`. Do note that builds gets only queued if there isn't already existing build happening, to prevent spamming the build server.

Finally, if you ever need to check progress of your deployment of the documentation, call `isPublishing()` on top of the documentation object to get all the information you need.

## [1.8.8 - 1.8.21] - 2022-29-11
### Major performance optimizations, debug mode, CLI hooks

We have significantly improved performance, added debug mode for network calls inside SDK, and added some underlaying pre-requirements for our CLI. You'll see the fruits of this really soon!

## [1.8.7] - 2022-02-11
### Exposed TokenTheme and TokenThemeOverride objects

All page blocks can now use new property `theme` that contains information about what theme to apply. It additionally also allows listing of `blacklistedElementProperties` to filter what properties to show and what not to. Finally, a new property `userMetadata` is available on every documentation block to store any arbitrary payload from the users.

We have also audited all packages, removed some unused ones and updated all libraries to their recommended version for tighter security. We have additionally removed commands for documentation and test coverage as part of the cleanup, as we'll use different approaches going forward (work in progress).

## [1.8.6] - 2022-02-11
### Exposed TokenTheme and TokenThemeOverride objects

You can now properly access `TokenTheme` and `TokenThemeOverride` objects from exposed interfaces.


## [1.8.5] - 2022-02-11
### Themes!

We have added support for theming into Supernova base engine. Themes allow to create overrides for tokens that can then be consumed alongside the token pools, or separately. Token themes can be combined and applied to each other so they form resolved token pools. You can use new object `TokenTheme` to access all data about the theme. To fetch the themes, either use version or brand object conveniences:

```typescript
// Fetch specific design system version
let version = await supernova.designSystemVersion(DS_ID, DS_VERSION_ID)

// Download all themes belonging to version, from all brands
let themes = await version.themes()

// Or download only themes belonging to a specific brand
let brand = await version.brands()[0]
let brandSpecificThemes = await brand.themes()
```

Each theme consists of tokens that were overriden in the specific theme. All other tokens are not present, but you can get all the information together via combination of different accessors:

```typescript
let baseTokens = await brand.tokens() // Contains all tokens
let themes = await brand.themes() // Contains all brands
let overridenTokens = theme[0].overridenTokens // To access the tokens overriden in one particular theme, use `overridenTokens`
```

Finally, it is possible to compute resulting pool of tokens from the base tokens + any number of themes applied to it. The result will be array of tokens that are either base tokens if there is no override for the token in any of the applied themes, or themed override selected from the theme that was applied the last:

```typescript
let themes = await version.themes()
let themedTokens = await version.tokensByApplyingThemes(tokens.map(t => t.id), themes.map(t => t.id))
```

We hope this release will greatly improve the capabilities of your systems, enjoy!

## [1.8.0] - 2022-05-10
### Added element and pathing system to all objects, added support for multi-layered shadows,

We have extended pathing system so all paths you might need (relative, deployed etc.). We have additionally added `ElementProperty` to components and tokens so you can access all custom properties from all object in the same manner. Finally, we have added support for multilayer shadows, gradients and blurs - you can access those using `.shadowLayers`, `.gradientLayers` and `.blurLayers` on each respective object.

## [1.7.32] - 2022-31-08
### Timestamps for all objects

We have added `createdAt` and `updatedAt` for all objects. This is not retroactive, so only objects created since September will have that information associated.

## [1.7.31] - 2022-17-08
### Inbuilt NPM registry in code blocks

We have made the call to retrieve NPM packages core part of code blocks, so now code blocks will be autoconfigured with this when NPM registry is available.

## [1.7.28] - 2022-15-08
### Workspace NPM registry

We have exposed new information to `DocumentationConfiguration` about new workspace settings object, `WorkspaceNPMRegistry`, in preparation for support for private repositories in code blocks. Workspace registry provides information about how to access the private repositories, however, it doesn't provide auth token to do so which is usually required to access the data. 

The token information is currently exclusive to internal systems of Supernova for security reasons (securely stored and encrypted without outside access) and are only available to users through browser session through some secure dark magic - we'll make updates to what information is available publicly as we feel comfortable with the full system integration and security on release and if we see the need to expose such information through SDK (unlikely).

## [1.7.27] - 2022-10-08
### Public API endpoint

We are switching our test API to its final destination, in preparation for Supernova SDK launch. The SDK will now access all the data through `https://api.supernova.io/`.

## [1.7.25] - 2022-31-07
### Markdown fix

Hotfixed issue where markdown transformer would not properly generate .md page links, but instead would append html as with regular pages as it was the last thing not tranformed. Oh well!

## [1.7.24] - 2022-31-07
### Markdown transformation tool (preview)

Markdown transformer is now out of the preview. It allows transformation of all pieces of information from your documentation into commonmark markdown. To use markdown transformer, simply request transformation through the new utility object, `MarkdownTransform`, now available also through SDK external tooling.


```typescript
// Fetch specific design system version
let version = await supernova.designSystemVersion(DS_ID, DS_VERSION_ID)

// Fetch documentation pages needed for the index construction
let docs = await version.documentation()
let pages = await docs.pages()

// Construct markdown transformer with one of the available modes
let transformer = new MarkdownTransform(MarkdownTransformType.commonmark)
let pageAsMarkdown = transformer.convertPageToMarkdown(pages[0])

/*

Your result will look similar to this (depending on content)

# Page Title

Page description

Block 1 content
## Block 2 content
- Block 3 content
1. Block 4 content

...

*/

```

## [1.7.23] - 2022-28-07
### Added quick accessors for complex URLs

We have added new options how you can render icons. 

It is now possible to render either all assets in various formats, or specify only selected assets in various formats, from both version pool of assets as well as brand pool of assets. Use:

- `specificRenderedAssets()` on `Brand`
- `specificRenderedAssets()` on `Version`
- `renderedAssets()` on `Brand`
- `renderedAssets()` on `Version`


## [1.7.22] - 2022-27-07
### Added quick accessors for complex URLs

We have added new accessors that you can use to access various pieces of information. This includes:

- Design component URL using `remoteDesignComponentUrl()` on `DesignComponent` object
- Documentation page editor URL for specific `DocumentationPage` using `editorPageUrl()`
- Documentation page site URL for specific `DocumentationPage` using `deployedDocsPageUrl()`
- Relative URL you can use for other targets (page site url without domain) for specific `DocumentationPage` using `relativeDocsPageUrl()`

## [1.7.21] - 2022-27-07
### Added token transformer utility

We have added common utility to transform tokens and their values to specific formats, such as CSS. You can use the transformer as follows:

```typescript
// Fetch specific design system version
let version = await supernova.designSystemVersion(DS_ID, DS_VERSION_ID)

// Fetch documentation pages needed for the index construction
let tokens = await version.tokens()

// Construct token transformer and transform all tokens to their css representations
let transformer = new TokenTransformer()
let transformedCSSValues = tokens.map(token => {
  return transformer.tokenToCSS(token) // Color: rgb(0,0,0,1), Border: 1px solid #fff etc.
})

/* 
This transform will return: 
rgb(0,0,0,1) (color)
1px solid #fff (border)
etc.
*/

```

You can also use the transformer for many different purposes, such as creating CSS variables by providing name of the token:

```typescript 

// Transforms all tokens to variables by creating dashed-name and then creating variable / formatting values
let transformedCSSValues = tokens.map(token => {
  let dashedName = token.name.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
  return transformer.tokenToCSSVariableDeclaration(token, dashedName) 
})

/* 
This transform will return: 
Color (Blue 100): "--blue-100: rgb(0,0,0,1)" 
Border (Primary):  "--primary: 1px solid #fff" 
etc.
*/
```

## [1.7.20] - 2022-19-07
### Fixed radius linking issue

If radius was used with referenced measure token that was itself referenced, due to incorrect priorities inside the resolution chain, entire resolution failed. This will no longer happen!

## [1.7.19] - 2022-17-07
### URL conveniences

We have released an update where you can more easily access your design system data from the original source. Specifically, it is now possible to access `Source` available on each `DesignSystem` which uniquely identifies and links to Figma files associated with design components. 

Additionally, each `DesignComponent` contains precise information to be able to reconstruct Figma URL to point directly to the node of origin. You can use `remoteDesignComponentUrl()` method to generate the URL for you.

Finally, we have added conveniences and additional information about documentation pages and the ability to retrieve URL of the deployment documentation site / page. Use `fullPath` on each `DocumentationPage` object to access it and `fullFirstPagePath` on each `DocumentationGroup`.


## [1.7.18] - 2022-15-07
### Markdown transformation tool (preview)

We have released a preview of a new tool to help you represent the documentation in your apps - as markdown. You can access it using `MarkdownTransform` object. `MarkdownTransform` allows you to convert pages to markdown just by creating it with desired mode, and feeding it with documentation page objects:

```typescript
// Fetch specific design system version
let version = await supernova.designSystemVersion(DS_ID, DS_VERSION_ID)

// Fetch documentation pages needed for the index construction
let docs = await version.documentation()
let pages = await docs.pages()

// Construct markdown transformer with one of the available modes
let transformer = new MarkdownTransform(MarkdownTransformType.commonmark)
let pageAsMarkdown = transformer.convertPageToMarkdown(pages[0])

/*

Your result will look similar to this (depending on content)

# Page Title

Page description

Block 1 content
## Block 2 content
- Block 3 content
1. Block 4 content

...

*/

```

We are continuing to improve the markdown transformer every day, for now, enjoy!

## [1.7.17] - 2022-15-07
### Doc search tool

We have released a new tool to help you search the documentation. You can access it using `DocSearch` object. `DocSearch` constructs search index from the documentation pages and you can then use it to fuzzy (or precise)-search your docs locally. Here is how you can use it:

```typescript
// Fetch specific design system version
let version = await supernova.designSystemVersion(DS_ID, DS_VERSION_ID)

// Fetch documentation pages needed for the index construction
let docs = await version.documentation()
let pages = await docs.pages()

// Construct index from the data using precise configuration for search. You can use fuzzy or even your own configuration. For more, read about underlaying search index framework here https://github.com/krisk/Fuse
let configuration = DocSearch.defaultPreciseConfiguration() // or DocSearch.defaultFuzzyConfiguration()
let searchEngine = new DocSearch(configuration)
searchEngine.updateSearchIndex(pages)

// You can now search for whatever you want! Search is VERY quick as index gets created beforehand, so sync searchin is not a problem (althought throttling is recommended for RT inputs)
const results = searchEngine.search("component")

/*

Your results will look similar to this:

    [{
      id: 27,
      text: 'Some interesting information about this component that you didn't know',
      type: 'contentBlock',
      blockId: 'd518e990-4d43-11ec-8ce5-cb0f56bcf344',
      pageId: '159467',
      pageName: 'Typography'
    }]
    ...
*/

```

## [1.7.10] - 2022-19-06
### Stable component API

Component API is now stable and can be used in production

## [1.7.5] - 2022-19-05
### Component API (preview)

We are releasing component API for preview. (true) Components are new concept coming to Supernova and we will be building upon them heavily in the upcoming months. You can access their first iteration through both version and brand accessors:

```typescript

// Fetch specific design system version
let version = await supernova.designSystemVersion(DS_ID, DS_VERSION_ID)
let brand = await version.brands()[0]

// Fetch all components
let components: Array<Component> = await version.components()
// (or) fetch brand-specific components
let brandedComponents: Array<Component> = await brand.components()
```

We have also changed current (mostly unused) Figma components to be called `DesignComponent`.

## [1.7.3] - 2022-05-05
### Better tables & experimental style dictionary transformer

We have added experimental implementation of very powerful and performant Style Dictionary transformer. This allows SDK to represent tokens as style dictionary objects with all bells and whisles like value referencing and mixins. You can try it out by accessing new top-level object called `SupernovaToolsStyleDictionary`. This is currently experimental and not recommended using in production, as its interface might change a bit before general release.

You can use it by instantiating the tool and configuring its behavior:

```typescript
// Fetch specific design system version
let version = await supernova.designSystemVersion(DS_ID, DS_VERSION_ID)

// Configure options
let options: SupernovaToolStyleDictionaryOptions = {
    naming: SupernovaToolStyleDictionaryKeyNaming.original,
    includeComments: true,
    includeBrandId: true,
    brandId: null,
    includeType: true,
    includeRootTypeNodes: false,
    type: TokenType.color, // All token categories are supported. Use null for all token categories
}

// Build style dictionary representation
let sdTool = new SupernovaToolsStyleDictionary(testInstance, version)
let sdRepresentation = await sdTool.tokensToSD(options)
```

Additionally, following was added:

- Tables can now hide borders (`tableBlock.tableProperties.showBorders` property)
- Tables can now highlight row header (`tableBlock.tableProperties.showRowHeader` property)
- Tables can now highlight column header (`tableBlock.tableProperties.showColumnHeader` property)

## [1.7.2] - 2022-28-03
### Better inline links

- Inline links can now be additionally opened in new window (`openInNewWindow` property on rich attribute object)
- Rich attributes can now link to specific groups and pages (`documentationItemId` property on rich attribute object)

## [1.7.1] - 2022-28-03
### Color & Typography properties

- It is now possible to retrieve `color` configuration properties from exporter packages
- It is now possible to retrieve `typography` configuration properties from exporter packages


## [1.7.0] - 2022-25-03
### Exporter SDK

We have added additional category of data - access to your installed exporters. This is first part of our implementation of triggering exporters through the SDK, and in preparation for SDK CLI that can be used as part of your toolchains.

- You can now fetch all exporters available to the workspace through additional functions on `workspace` and `supernova` objects
- Added option to fetch all custom blocks for currently selected documentation exporter. Use `SDKDocumentation.customBlocks()` to access it
- Added option to fetch all custom configuration properties for currently selected documentation exporter. Use `SDKDocumentation.customConfiguration()` to access it
- Added option to fetch all custom block variants for currently selected documentation exporter. Use `SDKDocumentation.customBlockVariants()` to access it
- Moved configuration of unit tests to .env variables in preparation for automated testing infra


## [1.6.24] - 2022-23-02
### Rendering variants
- Added rendering variant to block definition under optional key `variantKey`. If defined, block can decide to render differently than default


## [1.6.23] - 2022-19-02
### Unit Tests
- Improved runner for unit tests - running `npm run test:unit` will now properly detect all `spec.ts` files and will also auto-trash / auto-build the project
- Fixed parsing of tab blocks
- Added hardening of block parser, so it detects unsupported blocks right away


## [1.6.21] - 2022-18-02
### Data Model Fixes
- Fixed `backgroundColor` computation for `Frames` and `Frame`
- Fixed `backgroundColor` computation for `Assets` and `Asset`


## [1.6.19] - 2022-18-02
### Data Model Extension
- Added new model definitions for `Table` (+`TableCell`, +`TableRow`) block
- Added new model definitions for `Column` (+`ColumnItem`) block
- Added new model definitions for `Tab` (+`TabItem`) block
- Added `showTitles` property into `Frames` block


## [until 1.6.16] - 2021 - 2022
### Initial implementation

