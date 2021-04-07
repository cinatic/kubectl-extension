const { GObject, St } = imports.gi

const ExtensionUtils = imports.misc.extensionUtils

const Me = ExtensionUtils.getCurrentExtension()
const { Translations } = Me.imports.helpers.translations

var DefaultDetails = GObject.registerClass({
  GTypeName: 'KubectlExtension_DefaultDetails'
}, class DefaultDetails extends St.BoxLayout {
  _init ({ cardItem }) {
    super._init({
      style_class: 'details-table default',
      x_expand: true,
      vertical: true
    })

    this.cardItem = cardItem

    this._sync()

    this.connect('destroy', this._onDestroy.bind(this))
  }

  _sync () {
    this._headerBox = this._createHeaderBox()
    this._detailsTableBox = this._createDetailTableBox()

    this.add_child(this._headerBox)
    this.add_child(this._detailsTableBox)
  }

  _createHeaderBox () {
    const headerBox = new St.BoxLayout({
      style_class: 'header-box',
      x_expand: true,
      y_align: St.Align.MIDDLE
    })

    const cardItemNameLabel = new St.Label({
      style_class: 'card-item-name fwb',
      text: this.cardItem.name
    })

    headerBox.add_child(cardItemNameLabel)

    return headerBox
  }

  _createDetailTableBox () {
    const detailTableBox = new St.BoxLayout({
      style_class: 'detail-table-box',
      x_expand: true,
      y_expand: false
    })

    detailTableBox.add_child(this._createLeftDetailBox())
    detailTableBox.add_child(this._createRightDetailBox())

    return detailTableBox
  }

  _createLeftDetailBox () {
    const leftDetailBox = new St.BoxLayout({
      style_class: 'details-box left',
      x_expand: true,
      y_expand: false,
      vertical: true
    })

    leftDetailBox.add(this._createDetailItem(
        this._createDetailItemLabel(Translations.RESOURCE.KIND),
        this._createDetailItemValue(this.cardItem.kind || '')
    ))

    leftDetailBox.add(this._createDetailItem(
        this._createDetailItemLabel(Translations.RESOURCE.NAMESPACE),
        this._createDetailItemValue(this.cardItem.metadata.namespace || 'N/A')
    ))

    return leftDetailBox
  }

  _createRightDetailBox () {
    const rightDetailBox = new St.BoxLayout({
      style_class: 'details-box right',
      x_expand: true,
      y_expand: false,
      vertical: true
    })

    rightDetailBox.add(this._createDetailItem(
        this._createDetailItemLabel(Translations.RESOURCE.UID),
        this._createDetailItemValue(this.cardItem.metadata.uid || 'N/A')
    ))

    rightDetailBox.add(this._createDetailItem(
        this._createDetailItemLabel(Translations.RESOURCE.CREATED),
        this._createDetailItemValue(this.cardItem.metadata.creationTimestamp || '')
    ))

    return rightDetailBox
  }

  _createDetailItem (label, value) {
    const detailItem = new St.BoxLayout({
      style_class: 'detail-item-bin',
      x_expand: true
    })

    detailItem.add_child(label)
    detailItem.add_child(value)

    return detailItem
  }

  _createDetailItemLabel (text) {
    const detailItemLabel = new St.Bin({
      style_class: 'detail-item-label-bin',
      x_expand: true,
      child: new St.Label({ style_class: 'detail-item-label', text })
    })

    return detailItemLabel
  }

  _createDetailItemValue (text, additionalStyleClass) {
    const detailItemValue = new St.Bin({
      style_class: 'detail-item-value-bin',
      x_expand: true,
      child: new St.Label({ style_class: `detail-item-value tar ${additionalStyleClass || ''}`, text: text.toString() })
    })

    return detailItemValue
  }

  _onDestroy () {
  }
})
