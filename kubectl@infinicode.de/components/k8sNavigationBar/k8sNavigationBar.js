import Clutter from 'gi://Clutter'
import GObject from 'gi://GObject'
import St from 'gi://St'

import { SelectBox } from '../buttons/selectBox.js';
import { isNullOrEmpty } from '../../helpers/data.js';
import { Translations } from '../../helpers/translations.js';

import {
  SettingsHandler,
  KUBECTL_NAMESPACE,
  KUBECTL_CONTEXT,
  KUBECTL_RESOURCE
} from '../../helpers/settings.js'

import { kubectl } from '../../services/kubectlService.js';

const SETTING_KEYS_TO_REFRESH = [
  KUBECTL_NAMESPACE,
  KUBECTL_CONTEXT,
  KUBECTL_RESOURCE
]

export const K8sNavigationBar = GObject.registerClass({
  GTypeName: 'KubectlExtension_K8sNavigationBar',
  Signals: {
    'text-change': {
      param_types: [GObject.TYPE_STRING]
    },
    'refresh': {}
  }
}, class K8sNavigationBar extends St.BoxLayout {
  _init () {
    super._init({
      style_class: 'k8s-navigation-bar',
      x_expand: true
    })

    this._settings = new SettingsHandler()

    this.connect('destroy', this._onDestroy.bind(this))

    this._settingsChangedId = this._settings.connect('changed', (value, key) => {
      if (SETTING_KEYS_TO_REFRESH.includes(key)) {
        this._sync()
      }
    })

    this._sync().catch(e => {
      log(e)
    })
  }

  refresh () {
    this._sync().catch(e => {
      log(e)
    })
  }

  async _sync () {
    const [{ data: apiResources }, { data: contexts }, { data: namespaces }] = await Promise.all([
      kubectl.api.loadApiResources(),
      kubectl.api.loadContexts(),
      kubectl.api.loadNamespaces()
    ])

    const contextSelectBox = new SelectBox({
      x_align: Clutter.ActorAlign.START,
      buttons: contexts.map(item => ({
        label: item,
        value: item
      })),
      fallbackToFirstItem: true,
      selectedValue: this._settings.context,
      onItemValidationChange: this._onContextChange.bind(this),
      noItemsText: Translations.BUTTONS.NO_CONTEXTS
    })

    const resourceSelectBox = new SelectBox({
      x_align: Clutter.ActorAlign.CENTER,
      buttons: apiResources.map(item => ({
        label: item.resource,
        value: item.resource
      })),
      fallbackToFirstItem: true,
      selectedValue: this._settings.resource,
      onItemValidationChange: this._onResourceChange.bind(this)
    })

    const namespaceSelectBoxItems = namespaces.map(item => ({
      label: item.name,
      value: item.name
    }))

    const namespacesSelectBox = new SelectBox({
      x_align: Clutter.ActorAlign.END,
      buttons: [
        {
          label: Translations.K8S.ALL_NAMESPACES,
          value: 'all',
          addSeparator: !isNullOrEmpty(contexts)
        },
        ...namespaceSelectBoxItems
      ],
      fallbackToFirstItem: true,
      selectedValue: this._settings.namespace,
      onItemValidationChange: this._onNamespaceChange.bind(this)
    })

    contextSelectBox.connect('item-clicked', this._onContextChange.bind(this))
    resourceSelectBox.connect('item-clicked', this._onResourceChange.bind(this))
    namespacesSelectBox.connect('item-clicked', this._onNamespaceChange.bind(this))

    this.destroy_all_children()

    this.add_child(contextSelectBox)
    this.add_child(resourceSelectBox)
    this.add_child(namespacesSelectBox)
  }

  _onContextChange (_, value) {
    this._settings.context = value
    this._sync()
  }

  _onResourceChange (_, value) {
    this._settings.resource = value
    this._sync()
  }

  _onNamespaceChange (_, value) {
    this._settings.namespace = value
    this._sync()
  }

  _onDestroy () {
    if (this._settingsChangedId) {
      this._settingsChangedId = this._settings.disconnect(this._settingsChangedId)
    }
  }
})
