This guide summarizes common tasks you might want to do with Supernova SDK - from fetching workspaces to using tokens to accessing the documentation. Copy-paste snippets and enjoy!

## Obtaining design system data instance

Let's start by retrieving all workspaces we have available:

```typescript
const workspaces = await supernova.workspaces()
```

We can filter by id, workspace URL handle or even the workspace name. For all these steps, you'd usually create dropdown option so user has option to select it easily select. Once we have selected one workspace that we are looking for, we can download all design systems that belong to it:

```typescript
const workspace = workspaces[0]
const designSystems = await workspace.designSystems()
```

We can also filter by different means, same as with workspaces. Finally, take one and download all versions that belong to it: 

```typescript
const designSystem = designSystem[0]
const versions = await designSystem.versions()
```

Versions finally allow you to get to the data like `Tokens`, `Assets` or `Components`. You can also use `Version` to access the `Documentation` tree, containing all pages, groups, configuration and every piece of text you made. Finally, versions contain `Brands`.

If you need the latest version everyone is building, instead of downloading all of them and checking `isActive` attribute, use convenience method of `DesignSystem` to fetch correct one for you:

```typescript
const version = await designSystem.activeVersion()
```

## Design system quick-selection

If you are building tool for specific purpose and you know what design system you are targeting, you can also bypass all steps and just request specific version directly from `Supernova` object by calling:

```typescript
const version = await supernova.designSystemVersion(DS_ID, DS_VERSION_ID)
```

You can find IDs of specific design system and its version in the URL when you browse your design system:

```
https://cloud.supernova.io/ws/[WS_HANDLE]/ds/[DS_ID]/[DS_VERSION_ID]/...
```

## Obtaining design system elements

You can use `Version` object to access contents of your design system. Each type of data (`Tokens`, `Assets`, `Components`) has several methods you can use to retrieve it: 

```typescript
// Retrieve tokens as plain array
const tokens = await version.tokens()
for (let token of tokens) {
    console.log(token.name)
}

// Retrieve tokens as structure of groups that contain them
const tokenTreeRoots = await version.tokenGroupTrees()
```


## Obtaining design system documentation

If you want to access your design system documentation, first request documentation object on the version you are targeting:

```typescript
const documentation = await version.documentation()
```

Documentation object allows you to to access both structure and content of the docs, so you can fetch `pages()`, `groups()` and many more pieces of information your teams create.

## Versions vs. Brands

`Brand` is a concept of having single design system which can contain "value" variation of a particular semantic entity. For example, `Brand A` might contain `color-token-primary`, but `Brand B` might also contain that same one - just the second brand needs that token to be red, instead of default blue.

To allow for use-cases as described above, Supernova model defines `Brand`, a container that lives under `Version`. You can fetch all available brands like this:

```typescript
const brands = await version.brands()
```

You might notice that `Brand` object has the same interface as `Version`. This is because they both can retrieve the same data. However, in case of `Brand`, the data will be filtered by that particular brand. With `Version` object, you will get all elements of a specific type. 

For example, say you have `Brand A`, `Brand B` and they both contain 1 color token "primary" with different values. If you fetch tokens from `Version`, you actually get two tokens:

```typescript
const tokens = await version.tokens()
// [
// Token (name=primary, brandId=1, value="ffffff")
// Token (name=primary, brandId=2, value="000000")
// ]
```

You can filter this by `brandId` but it is not the most convenient, neither most performant option if you are just focused on one brand. For this reason, you can use `Brand` object to make it easy for you:

```typescript
const brands = await version.brands()
const brand1 = brands[0]
const brand2 = brands[1]

const tokens = await brand1.tokens()
// [
// Token (name=primary, brandId=1, value="ffffff")
// ]
const tokens = await brand2.tokens()
// [
// Token (name=primary, brandId=2, value="000000")
// ]
```

Please do note that `all` objects in Supernova belong under brand, with the sole exception of `Documentation` which is directly related to design system. 

## More to come

We will be extending this guide with more information soon. For now, you can always explore what is possible through autocomplete on each object starting with `Supernova` instance. If you have any questions, don't hesitate to ask us at https://community.supernova.io/