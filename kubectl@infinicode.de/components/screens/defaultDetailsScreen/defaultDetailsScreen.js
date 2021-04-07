const { Clutter, GObject, Pango, St } = imports.gi

const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()

const { getComplementaryColor } = Me.imports.helpers.data
const { ButtonGroup } = Me.imports.components.buttons.buttonGroup
const { SearchBar } = Me.imports.components.searchBar.searchBar
const { setTimeout, clearTimeout } = Me.imports.helpers.components
const { DefaultDetails } = Me.imports.components.screens.defaultDetailsScreen.defaultDetails
const { showNotification } = Me.imports.helpers.components

const { Translations } = Me.imports.helpers.translations
const { kubectl } = Me.imports.services.kubectlService

var DefaultDetailsScreen = GObject.registerClass({
  GTypeName: 'KubectlExtension_DefaultDetailsScreen'
}, class DefaultDetailsScreen extends St.BoxLayout {
  _init ({ cardItem }) {
    super._init({
      style_class: 'screen details-screen default',
      x_expand: true,
      vertical: true,
      reactive: true
    })

    this.cardItem = cardItem

    this._selectionDebounceTimeoutId = null
    this._clipboard = St.Clipboard.get_default()

    this._initialRender()
  }

  async _initialRender () {
    const searchBar = new SearchBar({
      back_screen_name: 'overview',
      showFilterInputBox: false
    })

    this._contentBox = new St.BoxLayout({
      style_class: 'content-box',
      x_expand: true,
      vertical: true
    })

    const tabsButtonGroup = await this._createTabsButtonGroup()

    this.add_child(searchBar)
    this.add_child(tabsButtonGroup)
    this.add_child(this._contentBox)

    this.connect('destroy', this._onDestroy.bind(this))

    searchBar.connect('refresh', () => {
      this._sync()
    })

    this._sync()
  }

  async _sync () {
    this._contentBox.destroy_all_children()

    const detailsBox = new DefaultDetails({ cardItem: this.cardItem })
    const rawBox = this._createRawResourceContentBox()

    this._contentBox.add_child(detailsBox)
    this._contentBox.add_child(rawBox)
  }

  _createRawResourceContentBox () {
    const rawContentBox = new St.BoxLayout({
      style_class: 'raw-resource-content-box',
      vertical: true
    })

    const copyJsonButton = new St.Button({
      style_class: 'button',
      label: Translations.BUTTONS.COPY_JSON
    })

    copyJsonButton.connect('clicked', this._copyWholeJson.bind(this))

    rawContentBox.add_child(copyJsonButton)

    const scrollView = new St.ScrollView({
      style_class: 'raw-resource-content-scroll-view',
      x_expand: true,
      clip_to_allocation: true
    })

    const innerContentBox = new St.BoxLayout({
      style_class: 'raw-resource-content-inner-box',
      x_expand: true
    })

    scrollView.add_actor(innerContentBox)

    const rawResourceJsonLabel = new St.Label({
      style_class: 'raw-resource-json-label',
      text: JSON.stringify(this.cardItem, null, 4),
      reactive: true
    })

    rawResourceJsonLabel.clutter_text.connect('cursor-changed', this._onCursorChange.bind(this))

    // get primary color from themes
    const themeNode = this.get_theme_node()
    const fgColor = themeNode.get_foreground_color()

    const newColorString = getComplementaryColor(fgColor.to_string().slice(1, 7), false)
    const secondaryColor = Clutter.color_from_string(`${newColorString}ff`)[1]

    rawResourceJsonLabel.clutter_text.set_reactive(true)
    rawResourceJsonLabel.clutter_text.set_selectable(true)
    rawResourceJsonLabel.clutter_text.set_ellipsize(Pango.EllipsizeMode.NONE)
    rawResourceJsonLabel.clutter_text.set_selection_color(secondaryColor)

    innerContentBox.add_child(rawResourceJsonLabel)

    rawContentBox.add_child(scrollView)

    return rawContentBox
  }

  async _createTabsButtonGroup () {
    const tabs = [Translations.K8S.KEY_DATA]

    const buttons = tabs.map(item => ({
      label: item,
      value: item,
      selected: true
    }))

    const newButtonGroup = new ButtonGroup({ buttons })
    // newButtonGroup.connect('clicked', (_, stButton) => this._selectProject(stButton.buttonData.value))

    return newButtonGroup
  }

  _onCursorChange (actor) {
    if (this._selectionDebounceTimeoutId) {
      this._selectionDebounceTimeoutId = clearTimeout(this._selectionDebounceTimeoutId)
    }

    const selectedContent = actor.get_selection()

    this._selectionDebounceTimeoutId = setTimeout(() => {
      this._clipboard.set_text(St.ClipboardType.CLIPBOARD, selectedContent)
      showNotification(Translations.COPIED_SELECTION, Translations.COPIED_SELECTION, null, true)
      return false
    }, 500)
  }

  _copyWholeJson () {
    const json = JSON.stringify(this.cardItem, null, 4)
    this._clipboard.set_text(St.ClipboardType.CLIPBOARD, json)

    showNotification(Translations.COPIED_JSON, Translations.COPIED_JSON, null, true)
  }

  _onDestroy () {
  }
})
