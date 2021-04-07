const { Gio, GLib, GObject } = imports.gi

const Mainloop = imports.mainloop
const Main = imports.ui.main
const MessageTray = imports.ui.messageTray

const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()

const iconCache = {}

var getCustomIconPath = iconName => {
  if (iconCache[iconName]) {
    return iconCache[iconName]
  }

  const newIcon = Gio.icon_new_for_string(Me.dir.get_child('icons').get_path() + '/' + iconName + '.svg')
  iconCache[iconName] = newIcon

  return newIcon
}

var setTimeout = (func, time, repeat) => GLib.timeout_add(
    GLib.PRIORITY_DEFAULT,
    time,
    () => {
      func.call()

      return repeat
    })

var clearTimeout = timerId => {
  try {
    GLib.source_remove(timerId)
  } catch (e) {
  }

  try {
    GLib.source_destroy(timerId)
  } catch (e) {
  }

  return null
}

var showNotification = (title, message, dialogType, transient) => {
  let icon = 'dialog-question'

  switch (dialogType) {
    case 'error':
      icon = 'dialog-error'
      break
    case 'warning':
      icon = 'dialog-warning'
      break
  }

  const source = new MessageTray.Source('kubectl-extension', icon)
  const notification = new MessageTray.Notification(source, title, message)
  notification.setTransient(transient)

  Main.messageTray.add(source)
  source.showNotification(notification)
}

