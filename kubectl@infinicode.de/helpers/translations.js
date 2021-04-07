const Gettext = imports.gettext
const _ = Gettext.gettext

const Config = imports.misc.config
const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()

const { SETTINGS_SCHEMA_DOMAIN } = Me.imports.helpers.settings

var Translations = {
  BACK: _('back'),
  FILTER_PLACEHOLDER: _('Filter Results'),
  LOADING_DATA: _('Loading Data'),
  UNKNOWN: _('UNKNOWN'),
  COPIED_SELECTION: _('Copied Selection'),
  COPIED_JSON: _('Copied JSON'),
  BUTTONS: {
    COPY_JSON: _('Copy whole JSON'),
    EMPTY: _('No Items'),
    NO_SELECTION: _('No Selection'),
    NO_CONTEXTS: _('No Contexts')
  },
  K8S: {
    FAILED_LOADING_RESOURCES: _('Failed loading k8s resources %s'),
    ALL_NAMESPACES: _('All Namespaces'),
    KEY_DATA: _('Key Data')
  },
  RESOURCE: {
    NAME: _('Name'),
    NAMESPACE: _('Namespace'),
    NODE: _('Node'),
    UID: _('UID'),
    CREATED: _('Created'),
    KIND: _('Kind')
  },
  FORMATS: {
    DEFAULT_DATE_TIME: _('%H:%M:%S %d.%m.%Y')
  }
}

/**
 * initTranslations:
 * @domain: (optional): the gettext domain to use
 *
 * Initialize Gettext to load translations from extensionsdir/locale.
 * If @domain is not provided, it will be taken from metadata['gettext-domain']
 */
var initTranslations = domain => {
  if (Config.PACKAGE_VERSION.startsWith('3.32')) {
    ExtensionUtils.initTranslations(domain)
  } else {
    const extension = ExtensionUtils.getCurrentExtension()

    domain = domain || SETTINGS_SCHEMA_DOMAIN || extension.metadata['gettext-domain']

    // check if this extension was built with "make zip-file", and thus
    // has the locale files in a subfolder
    // otherwise assume that extension has been installed in the
    // same prefix as gnome-shell
    const localeDir = extension.dir.get_child('locale')
    if (localeDir.query_exists(null)) {
      Gettext.bindtextdomain(domain, localeDir.get_path())
    } else {
      Gettext.bindtextdomain(domain, Config.LOCALEDIR)
    }
  }
}
