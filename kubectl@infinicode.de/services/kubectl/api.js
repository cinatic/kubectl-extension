import { isNullOrEmpty } from '../../helpers/data.js';
import { showNotification } from '../../helpers/components.js';
import { run } from '../../helpers/subprocess.js';
import { SettingsHandler } from '../../helpers/settings.js';
import { Translations } from '../../helpers/translations.js';
import { DefaultResource } from '../dto/defaultResource.js';
import { Pod } from '../dto/pod.js';

const defaultApiResources = [
  'pods',
  'services',
  'persistentvolumes',
  'persistentvolumeclaims',
  'namespaces',
  'secrets'
]

export const createStandardParams = (context = true, namespace = true) => {
  const _settings = new SettingsHandler()

  const params = []
  if (context && _settings.context) {
    params.push(`--context=${_settings.context}`)
  }

  if (namespace && _settings.namespace) {
    if (_settings.namespace === 'all') {
      params.push(`--all-namespaces`)
    } else {
      params.push(`--namespace=${_settings.namespace}`)
    }
  }

  return params
}

export const loadApiResources = async () => {
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

export const loadNamespaces = async () => {
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

export const loadContexts = async () => {
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

export const loadResourcesByType = async (resourceType) => {
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

export const _fetchGenericResources = async (resourceType) => {
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

export const _loadDefaultResourceItems = async resourceType => {
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

export const _loadPodItems = async () => {
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
