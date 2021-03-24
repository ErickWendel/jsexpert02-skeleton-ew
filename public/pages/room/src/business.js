class Business {
  constructor({ room, media, peerBuilder, socketBuilder, view }) {
    this.room = room;
    this.media = media;
    this.view = view;

    this.peerBuilder = peerBuilder

    this.socketBuilder = socketBuilder

    this.currentStream = {};
    this.socket = {}
    this.currentPeer = {}
    this.peers = new Map()
  }

  static initialize(deps) {
    const instance = new Business(deps);

    return instance._init();
  }

  async _init() {
    this.view.configureRecordButton(this.onRecordPressed.bind(this));

    this.currentStream = await this.media.getCamera();

    this.socket = this.socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .build();

    this.currentPeer = await this.peerBuilder
      .setOnError(this.onPeerError())
      .setOnConnectionOpened(this.onPeerConnectionOpened())
      .setOnCallReceived(this.onPeerCallReceived())
      .setOnPeerStreamReceived(this.onPeerStreamReceived())
      .setOnCallError(this.onPeerCallError())
      .setOnCallClose(this.onPeerCallClose())
      .build();

    this.addVideoStream(this.currentPeer.id)
  }

  addVideoStream(userId, stream = this.currentStream) {
    this.view.renderVideo({
      stream,
      userId,
    })
  }

  onUserConnected = () => {
    return userId => {
      console.log('user connected!', userId)
      this.currentPeer.call(userId, this.currentStream)
    }
  }

  onUserDisconnected = () => {
    return userId => {
      if (!this.peers.has(userId)) {
        return
      }

      this.peers.get(userId).call.close()
      this.peers.delete(userId)
      this.view.setParticipants(this.peers.size)
      this.view.removeVideoElement(userId)
    }
  }

  onPeerError = () => error => console.error('error on on peer!', error)

  onPeerConnectionOpened = () => (peer) => {
    this.socket.emit('join-room', this.room, peer.id)
  }

  onPeerCallReceived = () => call => {
    call.answer(this.currentStream)
  }

  onPeerStreamReceived = () => (call, stream) => {
    const callerId = call.peer

    this.addVideoStream(callerId, stream)
    this.peers.set(callerId, { call })
    this.view.setParticipants(this.peers.size)
  }

  onPeerCallError = () => (call, error) => {
    this.view.removeVideoElement(call.peer)
  }

  onPeerCallClose = () => (call) => {

  }

  onRecordPressed(recordingEnabled) {
    this.recordingEnabled = recordingEnabled
  }
}
