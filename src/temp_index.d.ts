// Type definitions for Supernova Pulsar 1.5.18
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
//
// TypeScript Version: 4.2
// Supernova Pulsar Version: 1.5.18
// Author: Supernova.io (Jiri Trecak<jiri@supernova.io>)
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Core Accessor and Data Objects

export interface Supernova {

    /** Constructor */
    new(apiKey: string, url: string | null)

    /** Fetches all workspaces available under provided API key. Each workspace contains specific design systems, which contain versions, which contain all the design system data. */
    workspaces(): Promise<Array<Workspace>>

    /** Fetches one specific workspace by provided id. Throws when workspace is not found or user doesn't have access to it.  */
    workspace(workspaceId: string): Promise<Workspace | null>

    /** Fetches design systems which belong to a provided workspace. */
    designSystems(workspaceId: string): Promise<Array<DesignSystem>>

    /** Fetches design system by provided id. Throws when design system is not found or user doesn't have access to it. */
    designSystem(designSystemId: string): Promise<DesignSystem | null>

    /** Fetches active design system version - the one to which all changes are being written currently. There is always one active version available for any provided design system. */
    activeDesignSystemVersion(designSystemId: string): Promise<DesignSystemVersion | null>

    /** Fetches all design system versions of provided design system */
    designSystemVersions(designSystemId: string): Promise<Array<DesignSystemVersion>>

    /** Fetches design system version by id */
    designSystemVersion(designSystemId: string, versionId: string): Promise<DesignSystemVersion | null>
}


export interface Workspace {

    /** Unique identifier of the workspace */
    id: string

    /** Unique URL handle of the workspace */
    handle: string

    /** Workspace name */
    name: string

    /** Fetches design systems which belong to this workspace. */
    designSystems(): Promise<Array<DesignSystem>>
}


export interface DesignSystem {

    /** Unique identifier of design system */
    id: string

    /** Unique identifier of the workspace in which this design system was created */
    workspaceId: string

    /** Design system name */
    name: string

    /** Design system description */
    description: string

    /** Sources that are used to feed the design system with the data (design & code) */
    sources: Array<File>

    /** Internal: Engine */
    engine: Supernova

    /** Fetches all versions that were created in the design system. Note that there is always at least one version - the "draft" - if there was no version created manually. */
    versions(): Promise<Array<DesignSystemVersion>>

    /** Fetches active design system version - the one to which all changes are being written currently. There is always one active version at any moment. */
    activeVersion(): Promise<DesignSystemVersion>
}


export class DesignSystemVersion {

    /** Unique identifier of design system version */
    id: string

    /** Unique identifier of the design system in which this version was created */
    designSystemId: string

    /** Design system version name */
    name: string

    /** Design system version description */
    description: string

    /** Semantic name of version. Will be null if the version is in draft mode */
    version: string | null

    /** Change log for the version. Will be null if the version is in draft mode */
    changeLog: string | null

    /** If version is in read-only mode, it can't be modified - only documentation that can be improved */
    isReadOnly: boolean

    /** Custom token properties configuration enabled globally for this design system version */
    customTokenProperties: Array<CustomTokenProperty>

    /** Fetches all tokens in this workspace */
    tokens(): Promise<Array<Token>>

    /** Fetches all token groups in this workspace */
    tokenGroups(): Promise<Array<TokenGroup>>

    /** Fetches all token group roots */
    tokenGroupTrees(): Promise<Map<TokenType, TokenGroup>>

    /** Fetches all components available in this workspace */
    components(): Promise<Array<Component>>

    /** Fetches all component groups as flattened array */
    componentGroups(): Promise<Array<ComponentGroup>>

    /** Fetches the root group of component tree */
    componentGroupTree(): Promise<ComponentGroup>

    /** Fetches all assets available in this design system version */
    assets(): Promise<Array<Asset>>

    /** Fetches all asset groups and retrieve them as flat array. You can still access all children of groups with children accessor of group object */
    assetGroups(): Promise<Array<AssetGroup>>

    /** Fetches root of the asset group tree */
    assetGroupTree(): Promise<AssetGroup>

    /** Fetches root documentation object containing the entire documentation structure. This will never be null as there is always documentation object attached to a specific design system version */
    documentation(): Promise<Documentation>
}


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Enums and constants

export type TokenType = "Color" | "Typography" | "Radius" | "Font" | "Measure" | "Shadow" | "Border" | "Gradient" | "Text"

export type TokenPropertyType = "Number" | "Boolean" | "String" | "Generic"

export type CustomTokenPropertyType = "Number" | "Boolean" | "String" | "Generic"

export type SourceType = "Supernova" | "Figma"

export type TextCase = "Original" | "Upper" | "Lower" | "Camel"

export type TextDecoration = "None" | "Underline" | "Strikethrough"

export type Unit = "Pixels" | "Points" | "Percent" | "Ems"

export type BorderPosition = "Inside" | "Center" | "Outside"

export type GradientType = "Linear" | "Radial" | "Angular"

export type DocumentationItemType = "Page" | "Group"

export type DocumentationPageBlockCodeLiveSandboxType = "react"

export type DocumentationPageBlockType =
    | "Text"
    | "Heading"
    | "Code"
    | "UnorderedList"
    | "OrderedList"
    | "Quote"
    | "Callout"
    | "Divider"
    | "Image"
    | "Link"
    | "Token"
    | "TokenList"
    | "TokenGroup"
    | "Shortcuts"
    | "FigmaEmbed"
    | "YoutubeEmbed"
    | "Embed"
    | "FigmaFrames"

export type RichTextSpanAttributeType = "Bold" | "Italic" | "Link" | "Strikethrough" | "Code"

export type CalloutType = "Info" | "Success" | "Warning" | "Error"

export type HeadingType = "1" | "2" | "3"

export type ContentAlignment = "Left" | "Center" | "Stretch"

export type HeaderAlignment = "Default" | "Center"

export type FrameAlignment = "FrameHeight" | "Center"

export type FrameLayout = "C8" | "C7" | "C5" | "C4" | "C3" | "C2" | "C1" | "C1_75"

export type ShortcutType = "Internal" | "External"

export type ShadowType = "Inner" | "Outer"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Token Models

export interface Token extends TokenValue {}

export interface ColorToken extends Token {
    value: ColorTokenValue
}

export interface TypographyToken extends Token {
    value: TypographyTokenValue
}

export interface RadiusToken extends Token {
    value: RadiusTokenValue
}

export interface ShadowToken extends Token {
    value: ShadowTokenValue
}

export interface MeasureToken extends Token {
    value: MeasureTokenValue
}

export interface BorderToken extends Token {
    value: BorderTokenValue
}

export interface GradientToken extends Token {
    value: GradientTokenValue
}

export interface TextToken extends Token {
    value: TextTokenValue
}

export interface FontToken extends Token {
    value: FontTokenValue
}

//
// Data Types
// Subcategory: Design Token Values
//

export interface TokenValue {
    id: string
    name: string
    description: string
    tokenType: TokenType
    origin: SourceOrigin | null
    properties: Array<TokenProperty>
}

export interface TokenProperty {
    name: string
    codeName: string
    type: TokenPropertyType
    value: string | number | boolean
}

export interface ColorTokenValue {
    hex: string
    r: number
    g: number
    b: number
    a: number
    referencedToken: ColorToken | null
}

export interface TypographyTokenValue {
    font: FontTokenValue
    fontSize: MeasureTokenValue
    textDecoration: TextDecoration
    textCase: TextCase
    letterSpacing: MeasureTokenValue
    lineHeight: MeasureTokenValue | null
    paragraphIndent: MeasureTokenValue
    referencedToken: TypographyToken | null
}

export interface RadiusTokenValue {
    radius: MeasureTokenValue
    topLeft: MeasureTokenValue | null
    topRight: MeasureTokenValue | null
    bottomLeft: MeasureTokenValue | null
    bottomRight: MeasureTokenValue | null
    referencedToken: RadiusToken | null
}

export interface ShadowTokenValue {
    color: ColorTokenValue
    x: MeasureTokenValue
    y: MeasureTokenValue
    radius: MeasureTokenValue
    spread: MeasureTokenValue
    opacity: number
    type: ShadowType
    referencedToken: ShadowToken | null
}

export interface MeasureTokenValue {
    unit: Unit
    measure: number
    referencedToken: MeasureToken | null
}

export interface FontTokenValue {
    family: string
    subfamily: string
    referencedToken: FontToken | null
}

export interface BorderTokenValue {
    color: ColorTokenValue
    width: MeasureTokenValue
    position: BorderPosition
    referencedToken: BorderToken | null
}

export interface GradientTokenValue {
    to: {
        x: number
        y: number
    }
    from: {
        x: number
        y: number
    }
    type: GradientType
    aspectRatio: number
    stops: Array<GradientStopValue>
    referencedToken: GradientToken | null
}

export interface GradientStopValue {
    position: number
    color: ColorTokenValue
}

export interface TextTokenValue {
    text: string
    referencedToken: TextToken
}

//
// Data Types
// Subcategory: Groups
//
export interface TokenGroup {
    id: string
    name: string
    description: string
    path: Array<string>
    subgroups: Array<TokenGroup>
    tokenType: TokenType
    isRoot: boolean
    childrenIds: Array<string>
    tokenIds: Array<string>
    parent: TokenGroup | null
}


export interface CustomTokenProperty {

    id: string
    name: string
    codeName: string
    type: CustomTokenPropertyType
    defaultValue: string | number | boolean
}

//
// Data Types
// Subcategory: Documentation Base

export interface DocumentationItem {
    id: string
    persistentId: string
    title: string
    type: DocumentationItemType
}

export interface DocumentationGroup extends DocumentationItem {
    isRoot: boolean
    childrenIds: Array<string>
    children: Array<DocumentationItem>
    parent: DocumentationGroup | null
}

export interface DocumentationPage extends DocumentationItem {
    slug: string
    userSlug: string | null
    blocks: Array<DocumentationPageBlock>
    parent: DocumentationGroup
}

export interface DocumentationPageStyle {
    title: string
    textAlignment: HeaderAlignment
    description: string | null
    backgroundColor: string | null
    backgroundImage: string | null
    headerHeight: number | null
    hideSidebar: boolean
    invertHeader: boolean
}

export interface Documentation {
    domain: string
    settings: DocumentationConfiguration
}

export interface DocumentationConfiguration {
    tabbedNavigation: boolean
}

//
// Data Types
// Subcategory: Documentation Text

export interface DocumentationRichText {
    spans: Array<DocumentationRichTextSpan>
}

export interface DocumentationRichTextSpan {
    text: string
    attributes: Array<DocumentationRichTextSpanAttribute>
}

export interface DocumentationRichTextSpanAttribute {
    type: RichTextSpanAttributeType
    link: string | null
}

//
// Data Types
// Subcategory: Documentation Blocks

export interface DocumentationPageBlock {
    id: string
    children: Array<DocumentationPageBlock>
    type: DocumentationPageBlockType
}

export interface DocumentationPageBlockCallout extends DocumentationPageBlockText {
    calloutType: CalloutType
}

export interface DocumentationPageBlockCode extends DocumentationPageBlockText {
    codeLanguage: string | null
    caption: string | null
}

export interface DocumentationPageBlockCodeLive extends DocumentationPageBlock {
    alignment: ContentAlignment
    backgroundColor: string | null
    showCode: boolean
    code: string
    sandboxData: string
    sandboxType: DocumentationPageBlockCodeLiveSandboxType
}

export interface DocumentationPageBlockDivider extends DocumentationPageBlock {
    // No extra attributes
}

export interface DocumentationPageBlockHeading extends DocumentationPageBlockText {
    headingType: HeadingType
}

export interface DocumentationPageBlockImage extends DocumentationPageBlock {
    url: string | null
    caption: string | null
    alignment: ContentAlignment
}

export interface DocumentationPageBlockLink extends DocumentationPageBlock {
    url: string | null
}

export interface DocumentationPageBlockOrderedList extends DocumentationPageBlockText {
    // No extra attributes
}

export interface DocumentationPageBlockQuote extends DocumentationPageBlockText {
    // No extra attributes
}

export interface DocumentationPageBlockText extends DocumentationPageBlock {
    text: DocumentationRichText
}

export interface DocumentationPageBlockToken extends DocumentationPageBlock {
    tokenId: string
}

export interface DocumentationPageBlockTokenGroup extends DocumentationPageBlock {
    groupId: string
}

export interface DocumentationPageBlockTokenList extends DocumentationPageBlock {
    tokenIds: Array<string>
}

export interface DocumentationPageBlockUnorderedList extends DocumentationPageBlockText {
    // No extra attributes
}

export interface DocumentationPageBlockEmbedFigma extends DocumentationPageBlock {
    url: string | null
}

export interface DocumentationPageBlockEmbedUrl extends DocumentationPageBlock {
    url: string | null
    title: string | null
    description: string | null
    thumbnailUrl: string | null
}

export interface DocumentationPageBlockEmbedYoutube extends DocumentationPageBlock {
    url: string | null
}

export interface DocumentationPageBlockFrames extends DocumentationPageBlock {
    frames: Array<DocumentationPageBlockFrame>
    properties: {
        alignment: FrameAlignment,
        layout: FrameLayout,
        backgroundColor: string | null
    }
}

export interface DocumentationPageBlockFrame {
    sourceFileId: string
    sourceFrameId: string
    sourceFileName: string

    title: string
    description: string | null
    previewUrl: string | null
    backgroundColor: string | null
}

export interface DocumentationPageBlockShortcuts extends DocumentationPageBlock {
    shortcuts: Array<DocumentationPageBlockShortcut>
}

export interface DocumentationPageBlockShortcut {

    // Visual data
    title: string | null
    description: string | null
    previewUrl: string | null

    // Linking data
    externalUrl: string | null
    internalId: string | null

    // Block type
    type: ShortcutType
}

//
// Data Types
// Subcategory: Support
//

export interface SourceOrigin {

    source: SourceType
    id: string | null
    name: string | null
}

export interface Component {

}

export interface ComponentGroup {

}

export interface Asset {

}

export interface AssetGroup {

}