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
    this.userRecordings = new Map()
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
    const recorderInstance = new Recorder(userId, stream);

    this.userRecordings.set(recorderInstance.filename, recorderInstance)

    if (this.recordingEnabled) {
      recorderInstance.startRecording()
    }

    this.view.renderVideo({
      stream,
      userId,
    })
  }

  onUserConnected = () => {
    return userId => {
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
      this.stopRecording(userId)
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

    for (const [key, value] of this.userRecordings) {
      if (this.recordingEnabled) {
        value.startRecording()
        continue;
      }

      this.stopRecording(key)
    }
  }

  async stopRecording(userId) {
    for (const [key, value] of this.userRecordings) {
      if (!key.includes(userId) || !value.recordingActive) {
        continue;
      }

      await value.stopRecording()
      this.playRecordings(key)
    }
  }

  playRecordings(userId) {
    const user = this.userRecordings.get(userId)
    const videosURLs = user.getAllVideoURLs()

    videosURLs.map(url => {
      this.view.renderVideo({ url, userId })
    })
  }
}
