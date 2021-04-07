const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()

const { isNullOrEmpty } = Me.imports.helpers.data
const { showNotification } = Me.imports.helpers.components
const { run } = Me.imports.helpers.subprocess
const { Settings } = Me.imports.helpers.settings
const { Translations } = Me.imports.helpers.translations
const { DefaultResource } = Me.imports.services.dto.defaultResource
const { Pod } = Me.imports.services.dto.pod

const defaultApiResources = [
  'pods',
  'services',
  'persistentvolumes',
  'persistentvolumeclaims',
  'namespaces',
  'secrets'
]

var createStandardParams = (context = true, namespace = true) => {
  const params = []
  if (context && Settings.context) {
    params.push(`--context=${Settings.context}`)
  }

  if (namespace && Settings.namespace) {
    if (Settings.namespace === 'all') {
      params.push(`--all-namespaces`)
    } else {
      params.push(`--namespace=${Settings.namespace}`)
    }
  }

  return params
}

var loadApiResources = async () => {
  const command = [
    'kubectl',
    'api-resources',
    ...createStandardParams(true, false),
    '-o',
    'name'].join(' ')

  let { output, error } = await run({ command, asJson: false })

  const apiResources = [
    ...defaultApiResources
  ]

  if (output) {
    try {
      const names = output.split('\n').map(line => line.trim()).filter(item => item && !defaultApiResources.includes(item))
      apiResources.push(...names)
    } catch (e) {
      logError(e)
      error = e
    }
  }

  const apiResourceObjects = apiResources.map(resource => {
    const group = resource.split('.').splice(1).join('.')

    return {
      resource,
      group: group || 'default'
    }
  })

  return { data: apiResourceObjects, error }
}

var loadNamespaces = async () => {
  const command = [
    'kubectl',
    'get',
    'namespaces',
    ...createStandardParams(true, false),
    '-o',
    'json'].join(' ')

  let { output, error } = await run({ command })

  let namespaces = []

  if (output && !isNullOrEmpty(output.items)) {
    try {
      namespaces = output.items.map(item => ({
        name: item.metadata.name
      }))
    } catch (e) {
      logError(e)
      error = e
    }
  }

  return { data: namespaces, error }
}

var loadContexts = async () => {
  const command = ['kubectl', 'config', 'get-contexts', '-o', 'name'].join(' ')

  let { output, error } = await run({ command, asJson: false })

  let contexts = []

  if (output) {
    try {
      contexts = output.split('\n').map(line => line.trim()).filter(item => item)
    } catch (e) {
      logError(e)
      error = e
    }
  }

  return { data: contexts, error }
}

var loadResourcesByType = async (resourceType) => {
  let dataPromise

  switch (resourceType) {
    case 'pods':
      dataPromise = _loadPodItems()
      break

    default:
      dataPromise = _loadDefaultResourceItems(resourceType)
      break
  }

  const data = await dataPromise

  if (data.error) {
    showNotification(Translations.K8S.FAILED_LOADING_RESOURCES.format(resourceType), data.error, 'error')
  }

  return data
}

var _fetchGenericResources = async (resourceType) => {
  const command = [
    'kubectl',
    'get',
    ...createStandardParams(),
    resourceType,
    '-o',
    'json'
  ].join(' ')

  return run({ command })
}

var _loadDefaultResourceItems = async resourceType => {
  let { output, error } = await _fetchGenericResources(resourceType)
  let items = []

  if (output && !isNullOrEmpty(output.items)) {
    try {
      items = output.items.map(item => new DefaultResource(item))
    } catch (e) {
      logError(e)
      error = e
    }
  }

  return { data: items, error }
}

var _loadPodItems = async () => {
  let { output, error } = await _fetchGenericResources('pods')

  let items = []

  if (output && !isNullOrEmpty(output.items)) {
    try {
      items = output.items.map(data => new Pod(data))
    } catch (e) {
      logError(e)
      error = e
    }
  }

  return { data: items, error }
}
