class Business {
  constructor({ room, media, view }) {
    this.room = room;
    this.media = media;
    this.view = view;

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
}
