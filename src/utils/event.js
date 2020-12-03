function DEvent() {
  this.events = {}
  this.listenEvent = {}
  let fireEvent = (evt, data) => {
    if (evt && this.events[evt]) {
      let func = this.events[evt]
      func.call(this, data)
    }
    if (evt && this.listenEvent[evt] && this.listenEvent[evt].length) {
      this.listenEvent[evt].forEach(item => item.call(this, data))
    }
  }

  let on = (evtName, callback) => {
    if (evtName) this.events[evtName] = callback
  }

  let addEventListener = (evtName, callback) => {
    if (evtName) {
      !this.listenEvent[evtName] && (this.listenEvent[evtName] = [])
      this.listenEvent[evtName].push(callback)
    }
  }

  let removeEventListener = (evtName, callback) => {
    if (evtName) {
      if (this.listenEvent[evtName] && this.listenEvent[evtName].length) {
        this.listenEvent[evtName] = this.listenEvent[evtName].filter(
          item => item !== callback
        )
      }
    }
  }

  this.firEvent = fireEvent
  this.on = on
  this.addEventListener = addEventListener
  this.removeEventListener = removeEventListener
  this.un = evtName => {
    this.events[evtName] = null
  }
}
let evt = new DEvent()
export default evt
