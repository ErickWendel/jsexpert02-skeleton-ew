class PeerBuilder {
  constructor({ peerConfig }) {
    this.peerConfig = peerConfig
    const defaultFn = () => { }
    this.onError = defaultFn
    this.onCallClose = defaultFn
    this.onCallError = defaultFn
    this.onCallReceived = defaultFn
    this.onConnectionOpened = defaultFn
    this.onPeerStreamReceived = defaultFn
  }

  setOnError(fn) {
    this.onError = fn

    return this
  }

  setOnCallClose(fn) {
    this.onCallClose = fn

    return this
  }

  setOnCallError(fn) {
    this.onCallError = fn

    return this
  }

  setOnCallReceived(fn) {
    this.onCallReceived = fn

    return this
  }

  setOnConnectionOpened(fn) {
    this.onConnectionOpened = fn

    return this
  }

  setOnPeerStreamReceived(fn) {
    this.onPeerStreamReceived = fn

    return this
  }

  _prepareCallEvent(call) {
    call.on('stream', stream => this.onPeerStreamReceived(call, stream))
    call.on('error', error => this.onCallError(call, error))
    call.on('close', () => this.onCallClose(call))

    this.onCallReceived(call)
  }

  // add the event behaviour to who's calling too
  _preparePeerInstanceFn(peerModule) {
    class PeerCustomModule extends peerModule { }

    const peerCall = PeerCustomModule.prototype.call
    const context = this

    PeerCustomModule.prototype.call = function (id, stream) {
      const call = peerCall.apply(this, [id, stream])

      context._prepareCallEvent(call)

      return call
    }

    return PeerCustomModule
  }

  build() {
    const PeerCustomInstance = this._preparePeerInstanceFn(Peer)
    const peer = new PeerCustomInstance(...this.peerConfig)

    peer.on('error', this.onError)
    peer.on('call', this._prepareCallEvent.bind(this))

    return new Promise(resolve => {
      peer.on('open', id => {
        this.onConnectionOpened(peer)
        resolve(peer)
      })
    })
  }
}