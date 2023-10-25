import GObject from 'gi://GObject'
import St from 'gi://St'

import { isNullOrEmpty } from '../../../helpers/data.js';
import { K8sNavigationBar } from '../../k8sNavigationBar/k8sNavigationBar.js';
import { FlatList } from '../../flatList/flatList.js';
import { createCard } from '../../cards/cardFactory.js';
import { SearchBar } from '../../searchBar/searchBar.js';

import {
  SettingsHandler,
  KUBECTL_NAMESPACE,
  KUBECTL_CONTEXT,
  KUBECTL_RESOURCE
}from '../../../helpers/settings.js';

import { Translations } from '../../../helpers/translations.js';
import { kubectl } from '../../../services/kubectlService.js';

const SETTING_KEYS_TO_REFRESH = [
  KUBECTL_NAMESPACE,
  KUBECTL_CONTEXT,
  KUBECTL_RESOURCE
]

export const DefaultOverviewScreen = GObject.registerClass({
  GTypeName: 'KubectlExtension_DefaultOverviewScreen'
}, class DefaultOverviewScreen extends St.BoxLayout {
  _init (mainEventHandler) {
    super._init({
      style_class: 'screen overview-screen default',
      vertical: true,
      reactive: true
    })

    this._settings = new SettingsHandler()
    this._mainEventHandler = mainEventHandler

    this._isRendering = false
    this._showLoadingInfoTimeoutId = null
    this._autoRefreshTimeoutId = null

    const searchBar = new SearchBar({ mainEventHandler: this._mainEventHandler })
    const k8sNavigationBar = new K8sNavigationBar()
    this._list = new FlatList()

    this.add_child(searchBar)
    this.add_child(k8sNavigationBar)
    this.add_child(this._list)

    this.connect('destroy', this._onDestroy.bind(this))

    searchBar.connect('refresh', () => {
      k8sNavigationBar.refresh()
      this._loadData()
    })

    searchBar.connect('text-change', (sender, searchText) => this._filter_results(searchText))

    this._settingsChangedId = this._settings.connect('changed', (value, key) => {
      if (SETTING_KEYS_TO_REFRESH.includes(key)) {
        this._loadData()
      }
    })

    this._list.connect('clicked-item', this._onItemClick.bind(this))

    this._loadData()

    this._registerTimeout()
  }

  _filter_results (searchText) {
    const listItems = this._list.items

    listItems.forEach(item => {
      const data = item.cardItem

      if (!searchText) {
        item.visible = true
        return
      }

      const searchContent = `${data.name}`.toUpperCase()

      item.visible = searchContent.includes(searchText.toUpperCase())
    })
  }

  _registerTimeout () {
    if (this._autoRefreshTimeoutId) {
      return
    }

    this._autoRefreshTimeoutId = setTimeout(() => {
      if (!this._autoRefreshTimeoutId) {
        return false
      }

      this._loadData()

      return true
    }, 10 * 1000, true)
  }

  async _loadData () {
    if (this._showLoadingInfoTimeoutId || this._isRendering) {
      return
    }

    this._registerTimeout()

    this._isRendering = true

    this._showLoadingInfoTimeoutId = setTimeout(() => this._list.show_loading_info(), 500)

    let dataList, error
    try {
      const result = await kubectl.api.loadResourcesByType(this._settings.resource)
      dataList = result.data
      error = result.error
    } catch (e) {
      logError(e)
      error = e
    }

    this._showLoadingInfoTimeoutId = clearTimeout(this._showLoadingInfoTimeoutId)

    if (error) {
      this._list.show_error_info(error)
      this._autoRefreshTimeoutId = clearTimeout(this._autoRefreshTimeoutId)
    } else if (isNullOrEmpty(dataList)) {
      this._list.show_error_info(Translations.BUTTONS.EMPTY)
    } else {
      this._list.clear_list_items()

      dataList.forEach(data => {
        const card = createCard(this._settings.resource, data, this._mainEventHandler)
        this._list.addItem(card)
      })
    }

    this._isRendering = false
  }

  _onItemClick (sender, item) {
    this._mainEventHandler.emit('show-screen', {
      screen: 'details',
      additionalData: {
        item: item.cardItem
      }
    })
  }

  _onDestroy () {
    if (this._showLoadingInfoTimeoutId) {
      this._showLoadingInfoTimeoutId = clearTimeout(this._showLoadingInfoTimeoutId)
    }

    if (this._autoRefreshTimeoutId) {
      this._autoRefreshTimeoutId = clearTimeout(this._autoRefreshTimeoutId)
    }

    if (this._settingsChangedId) {
      this._settingsChangedId = this._settings.disconnect(this._settingsChangedId)
    }
  }
})
