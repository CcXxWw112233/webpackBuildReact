import { WEvent } from 'whiteboard-lingxi/lib/utils'
class openWs {
  wsLink
  open = url => {
    this.wsLink = new WebSocket(url)
    this.wsLink.onmessage = this.onMessage
    this.wsLink.onopen = this.onOpen
    this.wsLink.onerror = this.onError
    this.wsLink.onclose = this.onClose
    return this
  }
  onOpen = val => {
    WEvent.dispatchDEvent('ws:open', { ws: this.wsLink, message: val })
  }
  onMessage = val => {
    WEvent.dispatchDEvent('ws:message', { ws: this.wsLink, message: val.data })
  }
  onError = () => {
    WEvent.dispatchDEvent('ws:error', { ws: this.wsLink, message: null })
  }
  onClose = () => {
    WEvent.dispatchDEvent('ws:close', { ws: this.wsLink, message: null })
  }
  disconnect = () => {
    if (this.wsLink) this.wsLink.close()
  }
}

export default openWs
