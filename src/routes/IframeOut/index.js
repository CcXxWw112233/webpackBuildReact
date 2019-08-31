import React from 'react';
import { connect } from 'dva';
import 'moment/locale/zh-cn';
import { message, Button } from 'antd'
import { getFilePDFInfo } from '../../services/technological/file'
import QueryString from 'querystring'
import indexStyles from './index.less'

const getEffectOrReducerByName = name => `iframeOut/${name}`
class IframeOut extends React.Component{
  state = {
    iframeSrc: '',
    downloadSrc: '',
    operateType: ''
  }
  componentWillMount() {
    const paramString = window.location.href.split('?')[1] || '{}'
    const param = QueryString.parse(paramString) || {}
    const { operateType, id } = param
    //debugger
    this.setState({
      operateType
    })
    if(operateType == 'openPDF') {
      this.getFilePDFInfo({id})
    }
  }
  async getFilePDFInfo(params) {
    const res = await getFilePDFInfo(params)
    if(res.code == '0') {
      const iframeSrc = res.data.edit_url
      const downloadSrc = res.data.download_annotation_url
      this.setState({
        iframeSrc,
        downloadSrc
      })
    }else {
      message.warn('打开pdf文件失败，请重试。')
    }
  }
  downloadPdf() {
    const { downloadSrc } = this.state
    window.open(downloadSrc)
  }
  render() {
    const { iframeSrc, downloadSrc, operateType } = this.state

    return (
      <div style={{width: '100%', height: '100%'}}>
        <iframe
          src={iframeSrc}
          frameBorder="0"
          width="100%"
          height="100%"
        ></iframe>
        {operateType == 'openPDF' && downloadSrc && (
          <Button type={'primary'} className={indexStyles.downloadBotton} onClick={this.downloadPdf.bind(this)}>
            下载
          </Button>
        )}

      </div>
    );
  }
};

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ modal, iframeOut, loading }) {
  return { modal, model: iframeOut, loading }
}
export default connect(mapStateToProps)(IframeOut)
