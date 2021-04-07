const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()

const { DefaultCard } = Me.imports.components.cards.defaultCard
const { PodCard } = Me.imports.components.cards.podCard
const { ServiceCard } = Me.imports.components.cards.serviceCard

var createCard = (type, data) => {
  let cardItem

  switch ((type || '').toLowerCase()) {
    case 'pods':
      cardItem = new PodCard(data)
      break

    case 'services':
      cardItem = new ServiceCard(data)
      break

    case 'namespaces':
      cardItem = new DefaultCard(data)
      break

    default:
      cardItem = new DefaultCard(data)
      break
  }

  return cardItem
}

