import Clutter from 'gi://Clutter'
import GObject from 'gi://GObject'
import St from 'gi://St'
import Shell from 'gi://Shell'
import Atk from 'gi://Atk'

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import { isNullOrEmpty } from '../../helpers/data.js';
import { Translations } from '../../helpers/translations.js';


// THX https://gitlab.com/jmiskinis/gnome-shell-extension-task-widget
// the idea with the task select box thingy is super awesome!

export const SelectBox = GObject.registerClass({
  GTypeName: 'KubectlExtension_SelectBox',
  Signals: {
    'item-clicked': {
      param_types: [GObject.TYPE_STRING, GObject.TYPE_STRING]
    }
  }
}, class SelectBox extends St.Button {
  _init ({ buttons, selectedValue, style_class, fallbackToFirstItem, onItemValidationChange, noItemsText, ...props }) {
    this._buttons = buttons
    this._selectedValue = selectedValue
    this._fallbackToFirstItem = fallbackToFirstItem
    this._onItemValidationChange = onItemValidationChange
    this.selectedItem = null

    this._validateSelection()

    let buttonText = Translations.BUTTONS.NO_SELECTION

    if (isNullOrEmpty(this._buttons)) {
      buttonText = noItemsText || Translations.BUTTONS.EMPTY
    } else if (this.selectedItem) {
      buttonText = this.selectedItem.label
    }

    this._buttonLabel = new St.Label({
      style_class: 'select-box-button-label',
      text: buttonText,
      y_expand: true,
      y_align: Clutter.ActorAlign.CENTER
    })

    const arrowIcon = new St.Icon({
      style_class: 'popup-menu-arrow select-box-popup-menu-arrow',
      icon_name: 'pan-down-symbolic',
      accessible_role: Atk.Role.ARROW,
      y_expand: true,
      y_align: Clutter.ActorAlign.CENTER
    })

    this._selectBoxButtonBox = new St.BoxLayout()
    this._selectBoxButtonBox.add_child(this._buttonLabel)
    this._selectBoxButtonBox.add_child(arrowIcon)

    super._init({
      style_class: `button select-box ${style_class}`,
      reactive: true,
      track_hover: true,
      can_focus: true,
      x_expand: true,
      accessible_name: 'Select item',
      accessible_role: Atk.Role.MENU,
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.CENTER,
      child: this._selectBoxButtonBox,
      ...props
    })
    this._buttons = buttons

    this.connect('destroy', this._onDestroy.bind(this))

    this._render()
  }

  _validateSelection () {
    let selectedButton

    if (this._selectedValue) {
      selectedButton = this._buttons.find(button => button.value === this._selectedValue)
    }

    if (!selectedButton && this._fallbackToFirstItem) {
      selectedButton = this._buttons[0]

      if (selectedButton) {
        this._selectedValue = selectedButton.value

        if (this._onItemValidationChange) {
          this._onItemValidationChange(this, selectedButton.value, selectedButton.label)
        }
      }
    }

    this.selectedItem = selectedButton
  }

  _render () {
    this._selectBoxMenu = new PopupMenu.PopupMenu(this, 0.5, St.Side.BOTTOM)

    Main.uiGroup.add_actor(this._selectBoxMenu.actor)
    this._selectBoxMenu.actor.hide()

    this.connect('clicked', async () => {
      this._selectBoxMenu.removeAll()

      const mainSelectBoxContentBox = new St.BoxLayout({ vertical: false })

      const menuSection = new PopupMenu.PopupMenuSection()
      this._selectBoxMenu.addMenuItem(menuSection)

      const menuSelectScrollView = new St.ScrollView({
        style_class: 'kubectl-select-box-selection-menu-scroll-view',
        x_expand: true
      })

      const innerContentBox = new St.BoxLayout({ vertical: true })

      menuSelectScrollView.add_actor(innerContentBox)

      this._buttons.forEach(button => {
        const popupMenuItem = new PopupMenu.PopupMenuItem(button.label)
        popupMenuItem.button = button

        innerContentBox.add_child(popupMenuItem)

        if (this._selectedValue === button.value) {
          popupMenuItem.setOrnament(PopupMenu.Ornament.DOT)
        } else {
          popupMenuItem.setOrnament(PopupMenu.Ornament.NONE)
        }

        popupMenuItem.connect('activate', () => {
          this._buttonLabel.set_text(button.label)
          this._selectBoxMenu.actor.hide()

          this.emit('item-clicked', button.value || '', button.label || '')
        })

        if (button.addSeparator) {
          const separator = new PopupMenu.PopupSeparatorMenuItem()
          innerContentBox.add_child(separator)
        }
      })

      mainSelectBoxContentBox.add_child(menuSelectScrollView)
      menuSection.actor.add_actor(mainSelectBoxContentBox)

      this._selectBoxMenu.toggle()
    })

    this._manager = new PopupMenu.PopupMenuManager(this, { actionMode: Shell.ActionMode.NORMAL })
    this._manager.addMenu(this._selectBoxMenu)
  }

  _onDestroy () {
    // remove manually otherwise it will throw a `incorrect pop` error in grabHelper.js
    this._manager.removeMenu(this._selectBoxMenu)
  }
})
