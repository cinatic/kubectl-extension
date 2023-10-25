import Clutter from 'gi://Clutter'
import GObject from 'gi://GObject'
import St from 'gi://St'

import * as Util from 'resource:///org/gnome/shell/misc/util.js'

import { IconButton } from '../buttons/iconButton.js'
import { SettingsHandler } from '../../helpers/settings.js'

export const PodCard = GObject.registerClass({
  GTypeName: 'KubectlExtension_PodCard'
}, class PodCard extends St.Button {
  _init (cardItem, mainEventHandler) {
    super._init({
      style_class: 'card message pod-card',
      can_focus: true,
      x_expand: true
    })

    this._settings = new SettingsHandler()
    this._mainEventHandler = mainEventHandler

    this.cardItem = cardItem

    const contentBox = new St.BoxLayout({
      y_align: Clutter.ActorAlign.CENTER
    })

    this.set_child(contentBox)

    const detailsBox = this._createDetailsBox()
    const buttonBox = this._createButtonBox()

    contentBox.add_child(detailsBox)
    contentBox.add_child(buttonBox)

    this.connect('destroy', this._onDestroy.bind(this))
  }

  _createDetailsBox () {
    const detailsBox = new St.BoxLayout({
      style_class: 'details-box',
      x_expand: true,
      vertical: true
    })

    const nameRow = this._createNameRow()
    detailsBox.add_child(nameRow)

    const detailsRow = this._createDetailRow()
    detailsBox.add_child(detailsRow)

    return detailsBox
  }

  _createNameRow () {
    const cardItemNameLabel = new St.Label({
      style_class: 'card-item-name fwb',
      text: this.cardItem.name
    })

    return cardItemNameLabel
  }

  _createDetailRow () {
    const details = [
      this.cardItem.spec.nodeName,
      this.cardItem.status.podIP,
      this.cardItem.statusText,
      `${this.cardItem.metadata.creationTimestamp}`
    ]

    const cardDetailsLabel = new St.Label({
      style_class: 'small-text card-item-name',
      text: details.filter(item => item).join(' | ')
    })

    return cardDetailsLabel
  }

  _createButtonBox () {
    const buttonBox = new St.BoxLayout({
      style_class: 'button-box',
      x_expand: true,
      vertical: true,
      y_align: Clutter.ActorAlign.CENTER,
      x_align: Clutter.ActorAlign.END
    })

    const runCommandIconButton = new IconButton({
      style_class: 'run-command-icon-button',
      icon_name: 'utilities-terminal-symbolic',
      onClick: () => {
        this._mainEventHandler.emit('hide-panel')
        const path = this._settings.extensionObject.dir.get_child('scripts').get_path()

        Util.spawnApp([
          'gnome-terminal',
          '--',
          path + '/open-terminal.sh',
          this._settings.context,
          this.cardItem.metadata.namespace,
          this.cardItem.name
        ])
      }
    })

    buttonBox.add_child(runCommandIconButton)

    return buttonBox
  }

  _onDestroy () {
  }
})
