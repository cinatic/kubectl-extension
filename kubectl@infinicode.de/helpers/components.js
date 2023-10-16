import Gio from 'gi://Gio'
import GLib from 'gi://GLib'

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const iconCache = {}

export const getCustomIconPath = iconName => {
  if (iconCache[iconName]) {
    return iconCache[iconName]
  }

  const extensionObject = Extension.lookupByURL(import.meta.url);

  const newIcon = Gio.icon_new_for_string(extensionObject.dir.get_child('icons').get_path() + '/' + iconName + '.svg')
  iconCache[iconName] = newIcon

  return newIcon
}

export const setTimeout = (func, time, repeat) => GLib.timeout_add(
    GLib.PRIORITY_DEFAULT,
    time,
    () => {
      func.call()

      return repeat
    })

export const clearTimeout = timerId => {
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

export const showNotification = (title, message, dialogType, transient) => {
  let icon = 'dialog-question'

  switch (dialogType) {
    case 'error':
      icon = 'dialog-error'
      break
    case 'warning':
      icon = 'dialog-warning'
      break
  }

  const source = new Main.MessageTray.Source('kubectl-extension', icon)
  const notification = new Main.MessageTray.Notification(source, title, message)
  notification.setTransient(transient)

  Main.messageTray.add(source)
  source.showNotification(notification)
}

