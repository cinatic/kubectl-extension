 import { Gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js'

export const Translations = {
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
