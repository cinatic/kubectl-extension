var Pod = class Pod {
  constructor (data) {
    this.status = {}
    this.spec = {}
    this.metadata = {}

    this.name = data.metadata.name

    this._containersReady = null
    this._containersCount = null
    this._statusText = null

    Object.assign(this, data)
  }

  get containersReady () {
    if (this._containersReady === null) {
      this._containersReady = this.status.containerStatuses.filter(item => item.ready).length
    }

    return this._containersReady
  }

  get containersCount () {
    if (this._containersCount === null) {
      this._containersCount = this.status.containerStatuses.length
    }

    return this._containersCount
  }

  get statusText () {
    if (!this._statusText) {
      switch (this.status.phase.toLowerCase()) {
        case 'running':
          this._statusText = `${this.status.phase} (${this.containersReady}/${this.containersCount})`
          break

        default:
          this._statusText = this.status.phase
          break
      }
    }

    return this._statusText
  }
}
