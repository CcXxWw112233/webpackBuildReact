import React, {Component} from 'react'
import styles from './index.less'
import {getUpdateLog, updateUpdateLogStatus} from './../../../../../services/technological/workbench'

class UpdateLog extends Component {
  state = {
    isShouldShow: false,
    id: '', //新功能的 id
    url: '', //新功能的 url
  }
  async handleClikedUpdateLog(){
    const {id, url} = this.state
    const isResOk = res => res&&res.code === '0'

    this.openWinInNewTabWithATag(url)

    const res = await updateUpdateLogStatus(id)
    if(isResOk(res)) {
      //...do something.
    }
    this.setState({
      isShouldShow: false,
      id: '',
      url: ''
    })
  }
  openWinInNewTabWithATag = url => {
    const aTag = document.createElement("a");
    aTag.href = url;
    aTag.target = "_blank";
    document.querySelector("body").appendChild(aTag);
    aTag.click();
    aTag.parentNode.removeChild(aTag);
  };
  async fetchUpdateLog() {
    const res = await getUpdateLog()
    const isResOk = res => res&&res.code === '0'
    const isHasUpdate = res => res.data && res.data.content
    if(isResOk(res)) {
      if(isHasUpdate(res)) {
        const {content: url, id} = res.data
        this.setState({
          isShouldShow: true,
          id,
          url,
        })
      }
    }
  }
  componentDidMount() {
    this.fetchUpdateLog()
  }
  render() {
    const {isShouldShow} = this.state
    if(!isShouldShow) return null

    //content
    return (
      <div className={styles.wrapper}>
      <p className={styles.text} onClick={this.handleClikedUpdateLog.bind(this)}>新功能</p>
    </div>
    )
  }
}

export default UpdateLog
