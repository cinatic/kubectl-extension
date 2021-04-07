const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()

const api = Me.imports.services.kubectl.api

var kubectl = {
  api: api
}
