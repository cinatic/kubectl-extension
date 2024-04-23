import Clutter from 'gi://Clutter'
import GObject from 'gi://GObject'
import St from 'gi://St'

import * as Util from 'resource:///org/gnome/shell/misc/util.js';

import { IconButton } from '../buttons/iconButton.js';
import { isNullOrEmpty } from '../../helpers/data.js';
import { SettingsHandler } from '../../helpers/settings.js';

export const ServiceCard = GObject.registerClass({
  GTypeName: 'KubectlExtension_ServiceCard'
}, class ServiceCard extends St.Button {
  _init (cardItem, mainEventHandler) {
    super._init({
      style_class: 'card message service-card',
      can_focus: true,
      x_expand: true
    })

    this.cardItem = cardItem

    this._mainEventHandler = mainEventHandler
    this._settings = new SettingsHandler()

    const contentBox = new St.BoxLayout({
      x_expand: true,
      x_align: Clutter.ActorAlign.START,
      y_align: Clutter.ActorAlign.CENTER
    })

    this.set_child(contentBox)

    const detailsBox = this._createDetailsBox()

    contentBox.add_child(detailsBox)

    this.connect('destroy', this._onDestroy.bind(this))
  }

  _createDetailsBox () {
    const detailsBox = new St.BoxLayout({
      style_class: 'details-box',
      x_expand: true,
      vertical: true
    })

    const nameRow = this._createSimpleTextRow(this.cardItem.name, 'fwb')
    detailsBox.add_child(nameRow)

    const detailsRow = this._createDetailRow()
    detailsBox.add_child(detailsRow)

    if (!isNullOrEmpty(this.cardItem.spec.externalIPs)) {
      const externalIpRow = this._createSimpleTextRow(`ExternalIPs: ${this.cardItem.spec.externalIPs.join(' | ')}`, 'small-text')
      detailsBox.add_child(externalIpRow)
    }

    if (!isNullOrEmpty(this.cardItem.spec.ports)) {
      const portRow = this._createPortRow()
      detailsBox.add_child(portRow)
    }

    return detailsBox
  }

  _createSimpleTextRow (text, additionalStyleClass) {
    const cardItemNameLabel = new St.Label({
      style_class: `card-item-name ${additionalStyleClass || ''}`,
      text
    })

    return cardItemNameLabel
  }

  _createDetailRow () {
    const details = [
      `Type: ${this.cardItem.spec.type}`
    ]

    if (this.cardItem.spec.clusterIP) {
      details.push(`ClusterIP: ${this.cardItem.spec.clusterIP}`)
    }

    details.push(`${this.cardItem.metadata.creationTimestamp}`)

    const cardDetailsLabel = new St.Label({
      style_class: 'small-text card-item-details',
      text: details.filter(item => item).join(' | ')
    })

    return cardDetailsLabel
  }

  _createPortRow () {
    const portsRowBox = new St.BoxLayout({
      style_class: 'ports-row-box small-text',
      x_expand: true,
      y_expand: true,
      y_align: Clutter.ActorAlign.CENTER
    })

    this.cardItem.spec.ports.forEach(portItem => {
      const { nodePort, port, protocol } = portItem

      let portText = `${port}/${protocol}`

      if (nodePort) {
        portText = `${port}:${nodePort}/${protocol}`
      }

      const portItemLabel = new St.Label({
        y_expand: true,
        y_align: Clutter.ActorAlign.CENTER,
        style_class: 'card-item-details fwb',
        text: portText
      })

      portsRowBox.add_child(portItemLabel)

      const portForwardIconButton = new IconButton({
        style_class: 'port-forward-icon-button',
        icon_name: 'network-wired-symbolic',
        icon_size: 12,
        onClick: () => {
          this._mainEventHandler.emit('hide-panel')
          const path = this._settings.extensionObject.dir.get_child('scripts').get_path()

          Util.spawnApp([
            'gnome-terminal',
            '--',
            path + '/port-forward.sh',
            this._settings.context,
            this.cardItem.metadata.namespace,
            `service/${this.cardItem.name}`,
            port
          ])
        }
      })

      portsRowBox.add_child(portForwardIconButton)
    })

    return portsRowBox
  }

  _onDestroy () {
  }
})
