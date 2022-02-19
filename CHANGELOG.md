# Changelog

All notable changes to this SDK are mentioned here in this file.

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

