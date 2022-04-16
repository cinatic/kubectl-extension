const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()

const { DefaultCard } = Me.imports.components.cards.defaultCard
const { PodCard } = Me.imports.components.cards.podCard
const { ServiceCard } = Me.imports.components.cards.serviceCard

var createCard = (type, data, mainEventHandler) => {
  let cardItem

  switch ((type || '').toLowerCase()) {
    case 'pods':
      cardItem = new PodCard(data, mainEventHandler)
      break

    case 'services':
      cardItem = new ServiceCard(data, mainEventHandler)
      break

    case 'namespaces':
      cardItem = new DefaultCard(data, mainEventHandler)
      break

    default:
      cardItem = new DefaultCard(data, mainEventHandler)
      break
  }

  return cardItem
}

