/* jshint esnext:true */
/*
 * This file is part of gnome-shell-extension-kubectl.
 *
 * gnome-shell-extension-kubectl is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * gnome-shell-extension-kubectl is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gnome-shell-extension-kubectl.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import Clutter from 'gi://Clutter'
import GObject from 'gi://GObject'
import St from 'gi://St'

import { ScreenWrapper } from './components/screenWrapper/screenWrapper.js';
import { EventHandler } from './helpers/eventHandler.js';
import { SettingsHandler } from './helpers/settings.js';

import * as ComponentsHelper from './helpers/components.js';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

const MenuPosition = {
  CENTER: 0,
  RIGHT: 1,
  LEFT: 2
}

let KubectlMenuButton = GObject.registerClass(class KubectlMenuButton extends PanelMenu.Button {
  _init () {
    this._previousPanelPosition = null
    this._settingsChangedId = null

    this._settings = new SettingsHandler()
    const mainEventHandler = new EventHandler()

    // Panel menu item - the current class
    let menuAlignment = 0.25

    if (Clutter.get_default_text_direction() == Clutter.TextDirection.RTL) {
      menuAlignment = 1.0 - menuAlignment
    }

    super._init(menuAlignment, _('Kubectl'))
    this.add_style_class_name('kubectl-extension')

    const panelMenuIcon = new St.Icon({
      gicon: ComponentsHelper.getCustomIconPath('kubernetes-symbolic'),
      style_class: 'system-status-icon'
    })

    const gitlabPanelIconBin = new St.Bin({
      style_class: 'gitlab-panel-bin',
      child: panelMenuIcon
    })

    this.add_actor(gitlabPanelIconBin)

    const bin = new St.Widget({ style_class: 'kubectl-extension' })
    bin._delegate = this
    this.menu.box.add_child(bin)

    this._screenWrapper = new ScreenWrapper(mainEventHandler)
    bin.add_actor(this._screenWrapper)

    // Bind events
    mainEventHandler.connect('hide-panel', () => this.menu.close())
    this._settingsChangedId = this._settings.connect('changed', (changedValue, changedKey) => this._sync(changedValue, changedKey))

    this.menu.connect('destroy', this._destroyExtension.bind(this))
    this.menu.connect('open-state-changed', (menu, isOpen) => {
      mainEventHandler.emit('open-state-changed', { isOpen })
    })

    this._sync()
  }

  _sync (changedValue, changedKey) {
    this.checkPositionInPanel()
  }

  checkPositionInPanel () {
    const container = this.container
    const parent = container.get_parent()

    if (!parent || this._previousPanelPosition === this._settings.position_in_panel) {
      return
    }

    parent.remove_actor(container)

    let children = null

    switch (this._settings.position_in_panel) {
      case MenuPosition.LEFT:
        children = Main.panel._leftBox.get_children()
        Main.panel._leftBox.insert_child_at_index(container, children.length)
        break
      case MenuPosition.CENTER:
        children = Main.panel._centerBox.get_children()
        Main.panel._centerBox.insert_child_at_index(container, children.length)
        break
      case MenuPosition.RIGHT:
        children = Main.panel._rightBox.get_children()
        Main.panel._rightBox.insert_child_at_index(container, 0)
        break
    }

    this._previousPanelPosition = this._settings.position_in_panel
  }

  _destroyExtension () {
    if (this._settingsChangedId) {
      this._settings.disconnect(this._settingsChangedId)
    }
  }
})

let _kubectlMenu = null

export default class KubectlExtension extends Extension {
  enable() {
    _kubectlMenu = new KubectlMenuButton()
    Main.panel.addToStatusArea('kubectlMenu', _kubectlMenu)
    _kubectlMenu.checkPositionInPanel()
  }

  disable() {
    _kubectlMenu.destroy();
    _kubectlMenu = null;
  }
}
