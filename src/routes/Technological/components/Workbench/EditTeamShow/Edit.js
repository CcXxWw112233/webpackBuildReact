import React from 'react'
import {message } from 'antd'
import {REQUEST_DOMAIN, REQUEST_DOMAIN_TEAM_SHOW} from "../../../../../globalset/js/constant";
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/index.css'
import Cookies from 'js-cookie'

export default class Edit extends React.Component {

  state = {
  }

  componentDidMount () {

  }

  handleEditorChange = (content) => {
    this.props.handleEditorChangeProps(content)
  }
  isJSON = (str) => {
    if (typeof str === 'string') {
      try {
        var obj=JSON.parse(str);
        if(str.indexOf('{')>-1){
          return true;
        }else{
          return false;
        }

      } catch(e) {
        return false;
      }
    }
    return false;
  }
  myUploadFn = (param) => {
    const serverURL = `${REQUEST_DOMAIN_TEAM_SHOW}/upload`
    const xhr = new XMLHttpRequest()
    const fd = new FormData()

    const successFn = (response) => {
      // 假设服务端直接返回文件上传后的地址
      // 上传成功后调用param.success并传入上传后的文件地址
      if(xhr.status === 200 && this.isJSON(xhr.responseText)) {
        if(JSON.parse(xhr.responseText).code === '0') {
          param.success({
            url: JSON.parse(xhr.responseText).data ? JSON.parse(xhr.responseText).data.url : '',
            meta: {
              id: 'xxx',
              title: 'xxx',
              alt: 'xxx',
              loop: true, // 指定音视频是否循环播放
              autoPlay: true, // 指定音视频是否自动播放
              controls: true, // 指定音视频是否显示控制栏
              // poster: 'http://xxx/xx.png', // 指定视频播放器的封面
            }
          })
        }else {
          errorFn()
        }
      }else {
        errorFn()
      }

    }

    const progressFn = (event) => {
      // 上传进度发生变化时调用param.progress
      param.progress(event.loaded / event.total * 100)
    }

    const errorFn = (response) => {
      // 上传发生错误时调用param.error
      param.error({
        msg: '图片上传失败!'
      })
    }

    xhr.upload.addEventListener("progress", progressFn, false)
    xhr.addEventListener("load", successFn, false)
    xhr.addEventListener("error", errorFn, false)
    xhr.addEventListener("abort", errorFn, false)

     fd.append('file', param.file)
     xhr.open('POST', serverURL, true)
     xhr.setRequestHeader('Authorization', Cookies.get('Authorization'))
     xhr.setRequestHeader('refreshToken', Cookies.get('refreshToken'))
     xhr.send(fd)
  }
  render () {

    const {datas: { editTeamShowPreview, editTeamShowSave, content }} = this.props.model
// 将HTML字符串转换为编辑器所需要的EditorState实例
    const editorState = BraftEditor.createEditorState(content)
    return (
      <div style={{backgroundColor: '#ffffff'}}>
        {(editTeamShowPreview || editTeamShowSave )? (
         ''
        ) : (
          <BraftEditor
            value={editorState}
            contentFormat = {'html'}
            onChange = {this.handleEditorChange.bind(this)}
            media={{uploadFn: this.myUploadFn}}
            contentStyle={{minHeight: 500, height: 1000, overflow: 'auto'}}
          />
        )}

      </div>
    )

  }

}
