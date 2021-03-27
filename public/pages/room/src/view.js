class View {
  constructor() {
    this.recorderBtn = document.getElementById('record')
    this.leaveBtn = document.getElementById('leave')
  }

  createVideoElement({ muted = true, src, srcObject }) {
    const video = document.createElement("video");
    video.muted = muted;
    video.src = src;
    video.srcObject = srcObject;

    if (src) {
      video.controls = true;
      video.loop = true;
      Util.sleep(200).then(() => video.play());
    }

    if (srcObject) {
      video.addEventListener("loadedmetadata", () => video.play());
    }

    return video;
  }

  renderVideo({ userId, stream = null, url = null, isCurrentId }) {
    const video = this.createVideoElement({
      muted: isCurrentId,
      src: url,
      srcObject: stream,
    });

    this.appendToHTMLTree(userId, video, isCurrentId);
  }

  appendToHTMLTree(userId, video, isCurrentId) {
    const div = document.createElement("div");
    div.id = userId;
    div.classList.add("wrapper");
    div.append(video);

    const div2 = document.createElement("div");
    div2.innerText = isCurrentId ? "" : userId;
    div.append(div2);

    const videoGrid = document.getElementById("video-grid");
    videoGrid.append(div);
  }

  setParticipants(count) {
    const participants = document.getElementById("participants");

    participants.textContent = count + 1
  }

  removeVideoElement(id) {
    document.getElementById(id).remove()
  }

  toggleRecordingBtnColor(isActive) {
    this.recorderBtn.style.color = isActive ? "red" : "white";
  }

  onRecordClick(command) {
    this.recordingEnabled = false;

    return () => {
      this.recordingEnabled = !this.recordingEnabled;
      command(this.recordingEnabled)
      this.toggleRecordingBtnColor(this.recordingEnabled)
    };
  };

  onLeaveClick(command) {
    return async () => {
      command()

      await Util.sleep(1000)
      window.location = '/pages/home'
    }
  }

  configureRecordButton(command) {
    this.recorderBtn.addEventListener("click", this.onRecordClick(command));
  }

  configureLeaveButton(command) {
    this.leaveBtn.addEventListener("click", this.onLeaveClick(command));
  }
}
