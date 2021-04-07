const { GObject, St } = imports.gi

const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()
const { DefaultDetailsScreen } = Me.imports.components.screens.defaultDetailsScreen.defaultDetailsScreen
const { DefaultOverviewScreen } = Me.imports.components.screens.defaultOverviewScreen.defaultOverviewScreen
const { EventHandler } = Me.imports.helpers.eventHandler

var ScreenWrapper = GObject.registerClass({
      GTypeName: 'KubectlExtension_ScreenWrapper'
    },
    class ScreenWrapper extends St.Widget {
      _init () {
        super._init({
          style_class: 'screen-wrapper'
        })

        this._showScreenConnectId = EventHandler.connect('show-screen', (sender, { screen, additionalData }) => this.showScreen(screen, additionalData))

        this.connect('destroy', this._onDestroy.bind(this))

        this.showScreen()
      }

      showScreen (screenName, additionalData) {
        let screen

        switch (screenName) {
          case 'details':
            screen = new DefaultDetailsScreen({ cardItem: additionalData.item })
            break

          case 'overview':
          default:
            screen = new DefaultOverviewScreen()
            break
        }

        this.destroy_all_children()

        this.add_actor(screen)
      }

      _onDestroy () {
        if (this._showScreenConnectId) {
          EventHandler.disconnect(this._showScreenConnectId)
        }
      }
    }
)
