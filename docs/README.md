
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

Now that we have selected version, we can use it to download contents of our design system. Use category-specific methods to fetch them: 

```typescript
// Getting tokens
const tokens = await version.tokens()
for (let token of tokens) {
    console.log(token.name)
}
```

TODO ALL EXAMPLES


## Obtaining design system documentation

If you want to access your design system documentation, first request documentation object on the version you are targeting:

```typescript
const documentation = await version.documentation()
```

Documentation object allows you to to access both structure and content of the docs, so you can fetch `pages()`, `groups()` and many more pieces of information your teams create.

## Versions vs. Brands

X