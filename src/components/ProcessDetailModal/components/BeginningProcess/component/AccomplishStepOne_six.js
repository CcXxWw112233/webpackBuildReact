import React, { Component } from 'react'
import indexStyles from '../index.less'
import { getOnlineExcelDataWithProcess } from '../../../../../services/technological/workFlow'
import { isApiResponseOk } from '../../../../../utils/handleResponseData'
import PreviewTable from '../../../../previewTable/index'

export default class AccomplishStepOne_six extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.sheet = null
  }

  getOnlineExcelDataWithProcess = props => {
    const {
      itemValue: { online_excel_id }
    } = props
    getOnlineExcelDataWithProcess({ id: online_excel_id }).then(res => {
      if (isApiResponseOk(res)) {
        this.setState({
          data: res.data
        })
      }
    })
  }

  componentDidMount() {
    this.getOnlineExcelDataWithProcess(this.props)
  }

  render() {
    const { itemValue } = this.props
    const { online_excel_id } = itemValue
    const { data = [] } = this.state
    return (
      <div
        key={online_excel_id}
        style={{
          background: 'rgba(0,0,0,0.02)',
          border: '1px solid rgba(0,0,0,0.15)'
        }}
        className={indexStyles.text_form}
      >
        <p>在线表格</p>
        <PreviewTable leadingOutVisible={true} data={data.sheet_data} />
      </div>
    )
  }
}
