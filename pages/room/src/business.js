class Business {
  constructor({ room, media, socketBuilder, view }) {
    this.room = room;
    this.media = media;
    this.view = view;

    this.socketBuilder = socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .build();
    this.socketBuilder.emit('join-room', this.room, 'artden')

    this.currentStream = {};
  }

  static initialize(deps) {
    const instance = new Business(deps);

    return instance._init();
  }

  async _init() {
    this.currentStream = await this.media.getCamera();
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
    }
  }

  onUserDisconnected = () => {
    return userId => {
      console.log('user disconnected!', userId)
    }
  }
}
