//
//  DocumentationPageBlockRenderCode.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { btoa } from "abab"
import { Alignment } from "../../enums/SDKAlignment"
import { Size } from "../../support/SDKSize"
import { ExporterCustomBlock } from "../../exporters/custom_blocks/SDKExporterCustomBlock"
import { DocumentationConfiguration } from "../SDKDocumentationConfiguration"
import { DocumentationPageBlock } from "../SDKDocumentationPageBlock"
import { DocumentationPageBlockTextModel } from "./SDKDocumentationPageBlockText"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockRenderCodeModel extends DocumentationPageBlockTextModel {
  alignment: Alignment,
  renderCodeProperties: {
      showCode: boolean
  },
  backgroundColor?: {
      value?: string 
  }
  size?: Size
}


type DocumentationPageBlockRenderCodeSandboxData = {
  type: DocumentationPageBlockRenderCodeEnvironmentType
  code: string
  packageJSON: string
  visual: {
    forcedHeight: number
    horizontalAlignment: DocumentationPageBlockRenderCodeSandboxAlignment,
    verticalAlignment: DocumentationPageBlockRenderCodeSandboxAlignment,  
    backgroundHex: string
  }
}

enum DocumentationPageBlockRenderCodeSandboxAlignment {
  start = "start",
  center = "center",
  end = "end"
}

enum DocumentationPageBlockRenderCodeEnvironmentType {
  react = "react"
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockRenderCode extends DocumentationPageBlock {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  alignment: Alignment
  backgroundColor: string | null
  showCode: boolean
  code: string
  packageJSON: string
  height: number | null
  sandboxData: string
  sandboxType: DocumentationPageBlockRenderCodeEnvironmentType

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockRenderCodeModel, customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
    super(model, customBlocks, configuration)
    this.alignment = model.alignment
    this.backgroundColor = model.backgroundColor?.value ?? null
    this.showCode = model.renderCodeProperties.showCode
    this.height = model.size?.height ?? null
    this.code = model.text.spans.map(s => s.text).join("")
    this.packageJSON = configuration.packageJson
    this.sandboxData = this.encodeSandboxData(configuration)
    this.sandboxType = DocumentationPageBlockRenderCodeEnvironmentType.react
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Sandbox data encoding
  
  private encodeSandboxData(configuration: DocumentationConfiguration): string {

    let localAlignment: DocumentationPageBlockRenderCodeSandboxAlignment
    switch (this.alignment) {
      case Alignment.center:
        localAlignment = DocumentationPageBlockRenderCodeSandboxAlignment.center; break
      default:
        localAlignment = DocumentationPageBlockRenderCodeSandboxAlignment.start; break
    }

    let definition: DocumentationPageBlockRenderCodeSandboxData = {
      type: DocumentationPageBlockRenderCodeEnvironmentType.react,
      code: this.code,
      packageJSON: configuration.packageJson,
      visual: {
        forcedHeight: this.height,
        horizontalAlignment: localAlignment,
        verticalAlignment: DocumentationPageBlockRenderCodeSandboxAlignment.center,
        backgroundHex: this.backgroundColor ?? null
      }
    }

    return this.btoaUnicode(JSON.stringify(definition))
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Data decoding unicode support
  
  // Encoding UTF8 ⇢ base64
  btoaUnicode(str) {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
          return String.fromCharCode(parseInt(p1, 16))
      }))
  }
  
  // Decoding base64 ⇢ UTF8
  atobUnicode(str) {
      return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
  }
}