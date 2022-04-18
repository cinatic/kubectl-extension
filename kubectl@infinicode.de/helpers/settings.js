const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()

var POSITION_IN_PANEL_KEY = 'position-in-panel'
var KUBECTL_NAMESPACE = 'namespace'
var KUBECTL_CONTEXT = 'context'
var KUBECTL_RESOURCE = 'resource'

var SETTINGS_SCHEMA_DOMAIN = 'org.gnome.shell.extensions.kubectl'

var SettingsHandler = class SettingsHandler {
  constructor () {
    this._settings = ExtensionUtils.getSettings()
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
