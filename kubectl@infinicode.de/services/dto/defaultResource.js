var DefaultResource = class Pod {
  constructor (data) {
    this.status = {}
    this.spec = {}
    this.metadata = {}

    this.name = data.metadata.name

    Object.assign(this, data)
  }
}
