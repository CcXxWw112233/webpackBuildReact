import React, { Component } from 'react'
import indexStyles from '../index.less'
import { getOnlineExcelDataWithProcess } from '../../../../../services/technological/workFlow'
import { isApiResponseOk } from '../../../../../utils/handleResponseData'
import PreviewTable from '../../../../previewTable/index'

export default class EditStepTypeOne_six extends Component {
  constructor(props) {
    super(props)
    this.state = {}
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
      <div key={online_excel_id} className={indexStyles.text_form}>
        <p>在线表格</p>
        <PreviewTable data={data.sheet_data || []} />
      </div>
    )
  }
}
