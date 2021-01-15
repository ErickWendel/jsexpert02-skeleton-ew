

const recordClick = function (recorderBtn) {
  this.recordingEnabled = false
  return () => {
    this.recordingEnabled = !this.recordingEnabled
    recorderBtn.style.color = this.recordingEnabled ? 'red' : 'white'
  }
}

const shareScreenClick = function (shareScreenBtn) {
  this.shareScreenEnabled = false
  return () => {
    this.shareScreenEnabled = !this.shareScreenEnabled
    const inactive = 'btn-success'
    const active = 'btn-danger'
    shareScreenBtn.classList.remove(active, inactive)
    shareScreenBtn.classList.add(
      this.shareScreenEnabled ? active : inactive
    )
  }
}

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const room = urlParams.get('room');
  console.log('this is the room', room)

  const recorderBtn = document.getElementById('record')
  recorderBtn.addEventListener('click', recordClick(recorderBtn))

  const shareScreenBtn = document.getElementById('shareScreen')
  shareScreenBtn.addEventListener('click', shareScreenClick(shareScreenBtn))

}
