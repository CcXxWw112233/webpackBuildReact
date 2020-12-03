import React from 'react'
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/index.css'
import styles from './index.less'

import { Button } from 'antd'
import { REQUEST_DOMAIN_FILE } from '@/globalset/js/constant'
import Cookies from 'js-cookie'
import PreviewFileModalRichText from './PreviewFileModalRichText'

/**富文本组件 */
export default class RichTextEditor extends React.Component {
  constructor(props) {
    super(props)
    const { value } = this.props
    // console.log("value", value);

    this.state = {
      isInEdit: false,
      editorState: BraftEditor.createEditorState(value),
      previewFileModalVisibile: false, //文件预览是否打开状态
      isUsable: true //任务附件是否可预览
    }
  }

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps
    const { value: oldValue } = this.props
    if (value !== oldValue) {
      this.setState({
        editorState: BraftEditor.createEditorState(value)
      })
    }
  }

  getEditorProps = () => {
    const editorState = this.state.editorState
    const { value } = this.props

    return {
      contentClassName: styles.editor_content,
      contentFormat: 'html',
      value: editorState,
      media: { uploadFn: this.myUploadFn },
      onChange: e => {
        this.setState({
          editorState: e
        })
      },
      fontSizes: [14],
      controls: [
        'text-color',
        'bold',
        'italic',
        'underline',
        'strike-through',
        'text-align',
        'list_ul',
        'list_ol',
        'blockquote',
        'split',
        'media'
      ]
    }
  }

  setIsInEdit = (isInEdit, e) => {
    e && e.stopPropagation()
    this.setState({
      isInEdit: isInEdit
      // editorState: ''
    })
  }

  saveHandle = e => {
    e.stopPropagation()
    const { dispatch } = this.props

    let { editorState } = this.state
    if (typeof editorState === 'object') {
      let brafitEditHtml = editorState.toHTML()
      this.props.saveBrafitEdit(brafitEditHtml)
    }
    this.setState({
      isInEdit: false
    })
  }

  myUploadFn = param => {
    const serverURL = `${REQUEST_DOMAIN_FILE}/upload`
    const xhr = new XMLHttpRequest()
    const fd = new FormData()

    const successFn = () => {
      // 假设服务端直接返回文件上传后的地址
      // 上传成功后调用param.success并传入上传后的文件地址
      if (xhr.status === 200 && this.isJSON(xhr.responseText)) {
        if (JSON.parse(xhr.responseText).code === '0') {
          param.success({
            url: JSON.parse(xhr.responseText).data
              ? JSON.parse(xhr.responseText).data.url
              : '',
            meta: {
              // id: 'xxx',
              // title: 'xxx',
              // alt: 'xxx',
              loop: false, // 指定音视频是否循环播放
              autoPlay: false, // 指定音视频是否自动播放
              controls: true // 指定音视频是否显示控制栏
              // poster: 'http://xxx/xx.png', // 指定视频播放器的封面
            }
          })
        } else {
          errorFn()
        }
      } else {
        errorFn()
      }
    }

    const progressFn = event => {
      // 上传进度发生变化时调用param.progress
      param.progress((event.loaded / event.total) * 100)
    }

    const errorFn = () => {
      // 上传发生错误时调用param.error
      param.error({
        msg: '图片上传失败!'
      })
    }

    xhr.upload.addEventListener('progress', progressFn, false)
    xhr.addEventListener('load', successFn, false)
    xhr.addEventListener('error', errorFn, false)
    xhr.addEventListener('abort', errorFn, false)

    fd.append('file', param.file)
    xhr.open('POST', serverURL, true)
    xhr.setRequestHeader('Authorization', Cookies.get('Authorization'))
    xhr.setRequestHeader('refreshToken', Cookies.get('refreshToken'))
    xhr.send(fd)
  }

  isJSON = str => {
    if (typeof str === 'string') {
      try {
        if (str.indexOf('{') > -1) {
          return true
        } else {
          return false
        }
      } catch (e) {
        return false
      }
    }
    return false
  }

  descriptionHTML(e) {
    if (e.target.nodeName.toUpperCase() === 'IMG') {
      const src = e.target.getAttribute('src')
      this.setState({
        previewFileType: 'img',
        previewFileSrc: src
      })
      this.setPreviewFileModalVisibile()
      e.stopPropagation()
    } else if (e.target.nodeName.toUpperCase() === 'VIDEO') {
      const src = e.target.getAttribute('src')
      // console.log(src)
      this.setState({
        previewFileType: 'video',
        previewFileSrc: src
      })
      this.setPreviewFileModalVisibile()
      e.stopPropagation()
    }
  }
  setPreviewFileModalVisibile() {
    this.setState({
      previewFileModalVisibile: !this.state.previewFileModalVisibile
    })
  }

  //任务附件预览黄
  setPreivewProp(data) {
    this.setState({
      ...data
    })
  }

  render() {
    const { visible, children } = this.props
    const { isInEdit } = this.state
    return (
      <>
        {!isInEdit || visible ? (
          <div
            onClick={e => {
              this.setIsInEdit(true, e)
            }}
          >
            <div
              className={styles.content}
              onClick={e => {
                this.descriptionHTML(e)
              }}
            >
              {children}
            </div>
          </div>
        ) : (
          <div>
            <div className={styles.editor_wrapper_default}>
              <BraftEditor {...this.getEditorProps()} />
            </div>
            <div className={styles.editor_footer_wrapper}>
              <a
                onClick={() => {
                  this.setIsInEdit(false)
                }}
              >
                取消
              </a>
              <Button
                size={'large'}
                type="primary"
                style={{ marginLeft: '16px' }}
                onClick={e => {
                  this.saveHandle(e)
                }}
              >
                保存
              </Button>
            </div>
          </div>
        )}

        {/*查看*/}
        <PreviewFileModalRichText
          isUsable={this.state.isUsable}
          setPreivewProp={this.setPreivewProp.bind(this)}
          previewFileType={this.state.previewFileType}
          previewFileSrc={this.state.previewFileSrc}
          modalVisible={this.state.previewFileModalVisibile}
          setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(
            this
          )}
        />
      </>
    )
  }

  handleChange = editorState => {
    this.setState({ editorState })
  }
}
