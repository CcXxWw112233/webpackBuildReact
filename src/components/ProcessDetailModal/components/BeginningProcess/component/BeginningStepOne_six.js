import React, { Component } from 'react'
import { connect } from 'dva'
import indexStyles from '../index.less'
import { getOnlineExcelDataWithProcess } from '../../../../../services/technological/workFlow'
import { isApiResponseOk } from '../../../../../utils/handleResponseData'
import PrivewTable from '../../../../previewTable/index'
import Sheet from '../../../../Sheet'
@connect(mapStateToProps)
export default class BeginningStepOne_six extends Component {
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

  // 更新表格数据
  updateSheetData = data => {
    const { updateSheetList } = this.props
    this.setState({
      data: {
        id: this.state.data.id,
        sheet_data: data
      }
    })
    updateSheetList &&
      updateSheetList({ id: this.state.data.id, sheetData: data })
  }

  render() {
    const {
      itemValue: { online_excel_id }
    } = this.props
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
        <p>
          在线表格
          <span style={{ marginLeft: 10 }}>
            <Sheet data={data.sheet_data} onMessage={this.updateSheetData} />
          </span>
        </p>
        <PrivewTable data={data.sheet_data} />
      </div>
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: { processEditDatas = [] }
}) {
  return { processEditDatas }
}
