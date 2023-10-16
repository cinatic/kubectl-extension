import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';


export const POSITION_IN_PANEL_KEY = 'position-in-panel'
export const KUBECTL_NAMESPACE = 'namespace'
export const KUBECTL_CONTEXT = 'context'
export const KUBECTL_RESOURCE = 'resource'

export const SETTINGS_SCHEMA_DOMAIN = 'org.gnome.shell.extensions.kubectl'

export const SettingsHandler = class SettingsHandler {
  constructor () {
    this._extensionObject = Extension.lookupByURL(import.meta.url)
    this._settings = this._extensionObject.getSettings()
  }

  get extensionObject() {
    return this._extensionObject
  }

  get position_in_panel () {
    return this._settings.get_enum(POSITION_IN_PANEL_KEY)
  }

  get context () {
    return this._settings.get_string(KUBECTL_CONTEXT)
  }

  set context (value) {
    this._settings.set_string(KUBECTL_CONTEXT, value)
  }

  get namespace () {
    return this._settings.get_string(KUBECTL_NAMESPACE)
  }

  set namespace (value) {
    this._settings.set_string(KUBECTL_NAMESPACE, value)
  }

  get resource () {
    return this._settings.get_string(KUBECTL_RESOURCE)
  }

  set resource (value) {
    this._settings.set_string(KUBECTL_RESOURCE, value)
  }

  connect (identifier, onChange) {
    return this._settings.connect(identifier, onChange)
  }

  disconnect (connectId) {
    this._settings.disconnect(connectId)
  }
}
