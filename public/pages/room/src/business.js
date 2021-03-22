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
  }

  static initialize(deps) {
    const instance = new Business(deps);

    return instance._init();
  }

  async _init() {
    this.currentStream = await this.media.getCamera();

    this.socket = this.socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .build();

    this.currentPeer = this.peerBuilder
      .setOnError(this.onPeerError())
      .setOnConnectionOpened(this.onPeerConnectionOpened())
      .setOnCallReceived(this.onPeerCallReceived())
      .build();

    this.addVideoStream('test01')
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
      console.log('user disconnected!', userId);
    }
  }

  onPeerError = () => error => console.error('error on on peer!', error)

  onPeerConnectionOpened = () => (peer) => {
    this.socket.emit('join-room', this.room, peer.id)
  }

  onPeerCallReceived = () => call => {
    call.answer(this.currentStream)
  }
}
