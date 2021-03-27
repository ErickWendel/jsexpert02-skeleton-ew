class Recorder {
  constructor(userName, stream) {
    this.userName = userName;
    this.stream = stream;

    this.filename = `id:${userName}-when:${Date.now()}`;
    this.videoType = 'video/webm';

    this.mediaRecorder = {}
    this.recordedBlobs = []
    this.completeRecordings = []
    this.recordingActive = false
  }

  _setup() {
    const commonCodecs = [
      'codecs=vp9,opus',
      'codecs=vp8,opus',
      ''
    ]

    const options = commonCodecs
      .map(codec => ({ mimeType: `${this.videoType};${codec}` }))
      .find(options => MediaRecorder.isTypeSupported(options.mimeType))

    if (!options) {
      throw new Error(`None of the codecs: ${commonCodecs.join(', ')} is supported`)
    }

    return options
  }

  startRecording() {
    const options = this._setup()

    if (!this.stream.active) {
      return
    }

    this.mediaRecorder = new MediaRecorder(this.stream, options)

    this.mediaRecorder.onstop = (event) => {
      console.log('Recorded blobs', this.recordedBlobs)
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (!event.data || !event.data.size) {
        return
      }

      this.recordedBlobs.push(event.data)
    }

    this.mediaRecorder.start()
    this.recordingActive = true
  }

  async stopRecording() {
    if (!this.recordingActive || this.mediaRecorder.state === 'inactive') {
      return
    }

    this.mediaRecorder.stop()
    this.recordingActive = false

    await Util.sleep(200)

    this.completeRecordings.push(this.recordedBlobs)
    this.recordedBlobs = []
  }

  getAllVideoURLs() {
    return this.completeRecordings.map(recording => {
      const superBuffer = new Blob(recording, { type: this.videoType })

      return window.URL.createObjectURL(superBuffer)
    })
  }
}