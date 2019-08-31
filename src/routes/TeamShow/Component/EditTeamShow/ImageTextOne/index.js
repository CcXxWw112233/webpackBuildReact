import React from 'react'
import { Button, Input, Upload, message } from 'antd'
import {REQUEST_DOMAIN, UPLOAD_FILE_SIZE} from "../../../../../../globalset/js/constant";
import Cookies from 'js-cookie'
import Detail from './Detail'
import { setUploadHeaderBaseInfo } from '@/utils/businessFunction'

const TextArea = Input.TextArea

export default class ImageTextOne extends React.Component {
  state = {
    logoUrl: '',
  }
  styles () {
    const { datas: {teamShowCertainOneShow = true}} = this.props.model
    const detailInfoOut = {
      width: '100%',
      backgroundColor: '#ffffff',
    }
    const detailInfo = {
      marginTop: 20,
      backgroundColor: '#ffffff',
      width: 800,
      textAlign: 'center',
      margin: '0 auto',
      height: 'auto',
      padding: '60px 0'
    }
    const detailInfo_top = {
      width: 200,
      height: 200,
      border: '1px solid rgba(217,217,217,1)',
      margin: '0 auto',
      borderRadius: 4,
    }
    const detaiInfo_middle = {
      marginTop: 16,
      fontSize: 24
    }
    const detailInfo_bott = {
      marginTop: 20,
      fontSize: 14,
      textAlign: 'left',
    }
    return {
      detailInfoOut, detailInfo, detailInfo_top, detaiInfo_middle, detailInfo_bott,

    }
  }
  render() {
    const that = this
    const { detailInfoOut, detailInfo, detailInfo_top, detaiInfo_middle, detailInfo_bott, } = this.styles()
    const { logoUrl } = this.state
    const uploadProps = {
      name: 'file',
      withCredentials: true,
      action: `${REQUEST_DOMAIN}/organization/logo_upload`,
      headers: {
        Authorization: Cookies.get('Authorization'),
        refreshToken: Cookies.get('refreshToken'),
        ...setUploadHeaderBaseInfo({}),
      },
      beforeUpload(e) {
        if(e.size == 0) {
          message.error(`不能上传空文件`)
          return false
        }else if(e.size > UPLOAD_FILE_SIZE * 1024 * 1024) {
          message.error(`上传文件不能文件超过${UPLOAD_FILE_SIZE}MB`)
          return false
        }
        let loading = message.loading('正在上传...', 0)
      },
      onChange({ file, fileList, event }) {
        // console.log(file)
        if (file.status === 'uploading') {
          that.setState({
            uploading: true
          })
        }
        if (file.status !== 'uploading') {
          that.setState({
            uploading: false
          })
        }
        if (file.status === 'done') {
          message.success(`上传成功。`);
          that.setState({
            uploading: false
          })
        } else if (file.status === 'error') {
          message.error(`上传失败。`);
          that.setState({
            uploading: false
          })
        }
        if (file.response && file.response.code === '0') {
          that.setState({
            logoUrl: file.response.data.logo
          })
        }
      },
    };

    return (
      <div style={{...detailInfoOut}}>

        <div style={{...detailInfo}}>
          <Upload {...uploadProps} showUploadList={false} accept={"image/jpg, image/jpeg,  image/png"}>
            {logoUrl?(
              <img src={logoUrl} style={{...detailInfo_top}}/>
            ) : (
              <div style={{...detailInfo_top}}></div>
            )}
          </Upload>
          <Detail {...this.props} />
          {/*<div style={{...detaiInfo_middle}}>{name}</div>*/}
          {/*<div style={{...detailInfo_bott}} dangerouslySetInnerHTML={{__html: description}}></div>*/}
        </div>
      </div>
    )
  }
}


