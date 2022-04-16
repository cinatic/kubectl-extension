const { GObject, St } = imports.gi

const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()
const { DefaultDetailsScreen } = Me.imports.components.screens.defaultDetailsScreen.defaultDetailsScreen
const { DefaultOverviewScreen } = Me.imports.components.screens.defaultOverviewScreen.defaultOverviewScreen

var ScreenWrapper = GObject.registerClass({
      GTypeName: 'KubectlExtension_ScreenWrapper'
    },
    class ScreenWrapper extends St.Widget {
      _init (mainEventHandler) {
        super._init({
          style_class: 'screen-wrapper'
        })

        this._mainEventHandler = mainEventHandler

        this._showScreenConnectId = this._mainEventHandler.connect('show-screen', (sender, { screen, additionalData }) => this.showScreen(screen, additionalData))

        this.connect('destroy', this._onDestroy.bind(this))

        this.showScreen()
      }

      showScreen (screenName, additionalData) {
        let screen

        switch (screenName) {
          case 'details':
            screen = new DefaultDetailsScreen({ cardItem: additionalData.item, mainEventHandler: this._mainEventHandler })
            break

          case 'overview':
          default:
            screen = new DefaultOverviewScreen(this._mainEventHandler)
            break
        }

        this.destroy_all_children()

        this.add_actor(screen)
      }

      _onDestroy () {
        if (this._showScreenConnectId) {
          this._mainEventHandler.disconnect(this._showScreenConnectId)
        }
      }
    }
)
