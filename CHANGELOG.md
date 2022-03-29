# Changelog

All notable changes to this SDK are mentioned here in this file.

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

