const { Clutter, GObject, St } = imports.gi

const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()

var DefaultCard = GObject.registerClass({
  GTypeName: 'KubectlExtension_DefaultCard'
}, class DefaultCard extends St.Button {
  _init (cardItem) {
    super._init({
      style_class: 'card message default-card',
      can_focus: true,
      x_expand: true
    })

    this.cardItem = cardItem

    const vContentBox = new St.BoxLayout({
      vertical: true,
      x_expand: true
    })

    this.set_child(vContentBox)

    const cardContentBox = this._createCardContent()

    vContentBox.add_child(cardContentBox)

    this.connect('destroy', this._onDestroy.bind(this))
    this._sync()
  }

  _createCardContent () {
    const contentBox = new St.BoxLayout({
      style_class: 'card-item-content-box',
      x_expand: true,
      y_align: St.Align.MIDDLE
    })

    const cardItemNameLabel = new St.Label({
      style_class: 'card-item-name fwb',
      text: this.cardItem.name
    })

    contentBox.add_child(cardItemNameLabel)

    return contentBox
  }

  _sync () {
  }

  _onDestroy () {
  }
})
