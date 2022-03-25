//
//  SDKSupernova.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DataBridge, DataBridgeRequestHook } from "./data/SDKDataBridge"
import { DataCore } from "./data/SDKDataCore"
import { Configuration } from "./data/SDKConfiguration"
import { DesignSystem } from "./SDKDesignSystem"
import { DesignSystemVersion } from "./SDKDesignSystemVersion"
import { Workspace } from "./SDKWorkspace"
import { SupernovaError } from "./errors/SDKSupernovaError"
import { Exporter } from "../model/exporters/SDKExporter"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

/** Main Supernova.io SDK object. Use this to connect to your data instance and retrieve workspace / design system / version from which you can access all neccessary data. */
export class Supernova {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  private useResolutionCache = true
  private apiKey: string
  private apiUrl: string
  private apiVersion: string
  private requestHook: DataBridgeRequestHook | null
  dataBridge: DataBridge


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(apiKey: string, url: string | null, requestHook: DataBridgeRequestHook | null) {

    this.apiKey = apiKey
    this.apiUrl = url ?? Configuration.apiUrlForDefaultEnvironment()
    this.apiVersion = Configuration.apiVersionForDefaultEnvironment()
    this.requestHook = requestHook;

    this.rebuildBridge()
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Methods

  /** Fetches all workspaces available under provided API key. Each workspace contains specific design systems, which contain versions, which contain all the design system data. */
  async workspaces(): Promise<Array<Workspace>> {

    // Fetch the authenticated user
    const userEndpoint = `users/me`

    let user = (await this.dataBridge.getDSMGenericDataFromEndpoint(userEndpoint)).user
    if (!user) {
      throw SupernovaError.fromSDKError("Unable to retrieve current sdk user")
    }

    // Fetch the workspaces from the memberships
    const workspaceEndpoint = `users/${user.id}/workspaces`
    let memberships = (await this.dataBridge.getDSMGenericDataFromEndpoint(workspaceEndpoint)).membership

    if (!memberships) {
      throw SupernovaError.fromSDKError("Unable to retrieve available workspaces")
    }

    let workspaces = new Array<Workspace>()
    for (let membership of memberships) {
      let workspace = new Workspace(this, membership.workspace)
      workspaces.push(workspace)
    }

    return workspaces
  }

  /** Fetches one specific workspace by provided id. Throws when workspace is not found or user doesn't have access to it.  */
  async workspace(workspaceId: string): Promise<Workspace | null> {

    // Fetch the authenticated user
    const userEndpoint = `workspaces/${workspaceId}`
    let workspaceData = (await this.dataBridge.getDSMGenericDataFromEndpoint(userEndpoint)).workspace
    if (!workspaceData) {
      throw SupernovaError.fromSDKError(`Unable to retrieve workspace with id ${workspaceId}`)
    }

    return new Workspace(this, workspaceData)
  }

  /** Fetches design systems which belong to a provided workspace. */
  async designSystems(workspaceId: string): Promise<Array<DesignSystem>> {

      // Fetch the authenticated user
      const dsEndpoint = `workspaces/${workspaceId}/design-systems`
      let dsData = (await this.dataBridge.getDSMGenericDataFromEndpoint(dsEndpoint)).designSystems
      if (!dsData) {
        throw SupernovaError.fromSDKError(`Unable to retrieve design systems for workspace id ${workspaceId}`)
      }

      let designSystems = new Array<DesignSystem>()
      for (let designSystem of dsData) {
        let ds = new DesignSystem(this, designSystem)
        designSystems.push(ds)
      }

      return designSystems
  }

  /** Fetches design system by provided id. Throws when design system is not found or user doesn't have access to it. */
  async designSystem(designSystemId: string): Promise<DesignSystem | null> {

    // Fetch the authenticated user
    const dsEndpoint = `design-systems/${designSystemId}`
    let dsData = (await this.dataBridge.getDSMGenericDataFromEndpoint(dsEndpoint)).designSystem
    if (!dsData) {
      throw SupernovaError.fromSDKError(`Unable to retrieve design system for id ${designSystemId}`)
    }

    return new DesignSystem(this, dsData)
  }

  /** Fetches active design system version - the one to which all changes are being written currently. There is always one active version available for any provided design system. */
  async activeDesignSystemVersion(designSystemId: string): Promise<DesignSystemVersion | null> {

    // Fetch design system
    let ds = await this.designSystem(designSystemId)

    // Fetch the authenticated user
    const versionEndpoint = `design-systems/${designSystemId}/versions`
    let versionData = (await this.dataBridge.getDSMGenericDataFromEndpoint(versionEndpoint)).designSystemVersions
    if (!versionData) {
      throw SupernovaError.fromSDKError(`Unable to retrieve active version for design system id ${designSystemId}`)
    }

    // Retrieve version that is currently active and available for write
    for (let version of versionData) {

      if (version.isReadonly === false) {
        return new DesignSystemVersion(this, ds, version)
      }
    }

    throw SupernovaError.fromSDKError(`Unable to retrieve active version for design system id ${designSystemId} - no version is currently active in selected design system`)
  }

  /** Fetches all design system versions of provided design system */
  async designSystemVersions(designSystemId: string): Promise<Array<DesignSystemVersion>> {

      // Fetch design system
      let ds = await this.designSystem(designSystemId)

      // Fetch all versions belonging to one specific design system
      const versionEndpoint = `design-systems/${designSystemId}/versions`
      let versionData = (await this.dataBridge.getDSMGenericDataFromEndpoint(versionEndpoint)).designSystemVersions
      if (!versionData) {
        throw SupernovaError.fromSDKError(`Unable to retrieve active version for design system id ${designSystemId}`)
      }

      let versions = new Array<DesignSystemVersion>()
      for (let version of versionData) {
        let v = new DesignSystemVersion(this, ds, version)
        versions.push(v)
      }

      return versions
  }

  /** Fetches design system version by id */
  async designSystemVersion(designSystemId: string, versionId: string): Promise<DesignSystemVersion | null> {

      // Fetch design system
      let ds = await this.designSystem(designSystemId)

      // Fetch all versions belonging to one specific design system
      const versionEndpoint = `design-systems/${designSystemId}/versions/${versionId}`
      let versionData = (await this.dataBridge.getDSMGenericDataFromEndpoint(versionEndpoint)).designSystemVersion
      if (!versionData) {
        throw SupernovaError.fromSDKError(`Unable to retrieve design system version for id ${versionId}`)
      }

      return new DesignSystemVersion(this, ds, versionData)
  }

  /** Fetches exporters belonging to workspace by id */
  async exporters(workspaceId: string): Promise<Array<Exporter>> {

      // Fetch all versions belonging to one specific design system
      const exporterEndpoint = `codegen/workspaces/${workspaceId}/exporters`
      let exporterData = (await this.dataBridge.getDSMGenericDataFromEndpoint(exporterEndpoint)).exporters
      if (!exporterData) {
        throw SupernovaError.fromSDKError(`Unable to retrieve exporters for workspace id ${workspaceId}`)
      }

      return exporterData.map(e => new Exporter(e))
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Settings

  /** Enables or disables resolution cache. Because of potential amount of data processed extra when this cache is disabled, only do it when you have a good reason (like if you are building a long-running, client-side app). Cache is enabled by default. */
  setResolutionCacheEnabled(isEnabled: boolean) {

    this.useResolutionCache = isEnabled
    this.dataBridge.cache = isEnabled
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Data core replication

  /** Use this to rebuild data core if the settings change. */
  rebuildBridge() {

    this.dataBridge = new DataBridge({
      cache: this.useResolutionCache,
      apiUrl: this.apiUrl,
      apiVersion: this.apiVersion,
      accessToken: this.apiKey,
      target: null,
      requestHook: this.requestHook,
    })
  }

  /** Use this to make version-instance specific data core. Each version must have its own data core, as it caches the data and they can't intermix. Supernova instance has its own data core. */
  newDataCore(): DataCore {

    let bridge = new DataBridge({
      cache: this.useResolutionCache,
      apiUrl: this.apiUrl,
      apiVersion: this.apiVersion,
      accessToken: this.apiKey,
      target: null,
      requestHook: this.requestHook
    })
    return new DataCore(bridge)
  }
}
