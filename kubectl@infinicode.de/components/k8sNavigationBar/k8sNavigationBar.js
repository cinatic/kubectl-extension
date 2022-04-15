const { Clutter, GObject, St } = imports.gi

const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()

const { SelectBox } = Me.imports.components.buttons.selectBox
const { isNullOrEmpty } = Me.imports.helpers.data
const { Translations } = Me.imports.helpers.translations

const {
  Settings,
  KUBECTL_NAMESPACE,
  KUBECTL_CONTEXT,
  KUBECTL_RESOURCE
} = Me.imports.helpers.settings

const { kubectl } = Me.imports.services.kubectlService

const SETTING_KEYS_TO_REFRESH = [
  KUBECTL_NAMESPACE,
  KUBECTL_CONTEXT,
  KUBECTL_RESOURCE
]

var K8sNavigationBar = GObject.registerClass({
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

    this.connect('destroy', this._onDestroy.bind(this))

    this._settingsChangedId = Settings.connect('changed', (value, key) => {
      if (SETTING_KEYS_TO_REFRESH.includes(key)) {
        this._sync()
      }
    })

    this._sync()
  }

  refresh () {
    this._sync()
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
      selectedValue: Settings.context,
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
      selectedValue: Settings.resource,
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
      selectedValue: Settings.namespace,
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
    Settings.context = value
    this._sync()
  }

  _onResourceChange (_, value) {
    Settings.resource = value
    this._sync()
  }

  _onNamespaceChange (_, value) {
    Settings.namespace = value
    this._sync()
  }

  _onDestroy () {
    if (this._settingsChangedId) {
      this._settingsChangedId = Settings.disconnect(this._settingsChangedId)
    }
  }
})
