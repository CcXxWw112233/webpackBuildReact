import React, { Component } from 'react'
import { connect } from 'dva'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import Sheet from '../../../../Sheet'
import { getOnlineExcelDataWithProcess } from '../../../../../services/technological/workFlow'
import { isApiResponseOk } from '../../../../../utils/handleResponseData'
import PrivewTable from '../../../../previewTable/index'
@connect(mapStateToProps)
export default class ConfigureStepOne_six extends Component {
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

  // 删除对应字段的表项
  handleDelFormDataItem = e => {
    e && e.stopPropagation()
    const { processEditDatas = [], parentKey = 0, itemKey } = this.props
    const { forms = [] } = processEditDatas[parentKey]
    let new_form_data = [...forms]
    new_form_data.splice(itemKey, 1)
    this.props.updateConfigureProcess &&
      this.props.updateConfigureProcess({ value: new_form_data }, 'forms')
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
      itemKey,
      itemValue: { online_excel_id }
    } = this.props
    const { data = {} } = this.state
    return (
      <div key={online_excel_id || itemKey} className={indexStyles.text_form}>
        <p>
          在线表格
          <span style={{ marginLeft: 10 }}>
            <Sheet data={data.sheet_data} onMessage={this.updateSheetData} />
          </span>
        </p>
        <PrivewTable data={data.sheet_data} />
        <span
          style={{ zIndex: 6 }}
          onClick={this.handleDelFormDataItem}
          className={`${indexStyles.delet_iconCircle}`}
        >
          <span
            className={`${globalStyles.authTheme} ${indexStyles.deletet_icon}`}
          >
            &#xe720;
          </span>
        </span>
      </div>
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: { processEditDatas = [] }
}) {
  return { processEditDatas }
}
