import { DefaultCard } from './defaultCard.js';
import { PodCard } from './podCard.js';
import { ServiceCard } from './serviceCard.js';

export const createCard = (type, data, mainEventHandler) => {
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

