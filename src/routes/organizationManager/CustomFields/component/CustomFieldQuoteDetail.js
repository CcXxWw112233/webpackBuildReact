import React, { Component } from 'react'
import { Modal, Menu } from 'antd'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { currentNounPlanFilterName } from '../../../../utils/businessFunction'
import { PROJECTS, TASKS } from '../../../../globalset/js/constant'
import EmptyImg from '@/assets/projectDetail/process/Empty@2x.png'
import { connect } from 'dva'
import { getUserAllOrgsBoardList } from '../../../../services/technological'
import { isApiResponseOk } from '../../../../utils/handleResponseData'
@connect()
export default class CustomFieldQuoteDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    getUserAllOrgsBoardList().then(res => {
      if (isApiResponseOk(res)) {
        this.setState({
          allOrgBoardTreeList: res.data
        })
      }
    })
  }

  onCancel = () => {
    const { quoteList = [] } = this.props
    if (!!(quoteList && quoteList.length)) {
      this.setState({
        currentSelectedCode: quoteList[0].field_quote_code
      })
    }
    this.props.updateState && this.props.updateState()
  }

  renderTitle = () => {
    return <div className={indexStyles.custom_quote_title}>字段引用详情</div>
  }

  renderTips = code => {
    let dec = ''
    let icon = ''
    switch (code) {
      case 'BOARD':
        dec = `${currentNounPlanFilterName(PROJECTS)}`
        icon = <>&#xe684;</>
        break
      case 'CARD':
        dec = `${currentNounPlanFilterName(TASKS)}`
        icon = <>&#xe66a;</>
        break
      default:
        break
    }
    return { dec, icon }
  }

  handleMenu = e => {
    const { domEvent, key } = e
    this.setState({
      currentSelectedCode: key
    })
  }

  // 查询对应项目列表中的项目名称
  getBoardName = board_id => {
    const { allOrgBoardTreeList = [] } = this.state
    let org_id = localStorage.getItem('OrganizationId')
    let { board_list = [] } =
      allOrgBoardTreeList.find(item => item.org_id == org_id) || {}
    let { board_name } =
      board_list.find(item => item.board_id == board_id) || {}
    return board_name
  }

  // 获取当前查询引用详情的内容
  getFieldCodeContent = currentSelectedCode => {
    const { quoteList = [] } = this.props
    const current_content =
      !!(quoteList && quoteList.length) &&
      (quoteList.find(item => item.field_quote_code == currentSelectedCode) ||
        quoteList[0])
    return current_content || {}
  }

  renderMenu = (data = [], field_quote_code) => {
    return (
      <div className={indexStyles.custom_quote_c_right}>
        {!!(data && data.length) &&
          data.map(item => {
            const { board_id = '' } = item
            return (
              <div key={item.id} className={indexStyles.custom_quote_cr_item}>
                <span className={globalStyles.authTheme}>
                  {this.renderTips(field_quote_code).icon}
                </span>
                <span>
                  {item.name}
                  {board_id && (
                    <span
                      style={{ color: 'rgba(0,0,0,0.45)', marginLeft: '5px' }}
                    >
                      # {this.getBoardName(board_id)}
                    </span>
                  )}
                </span>
              </div>
            )
          })}
      </div>
    )
  }

  renderContent = () => {
    const { quoteList = [] } = this.props
    const { currentSelectedCode } = this.state
    const { quotes = [], field_quote_code } = this.getFieldCodeContent(
      currentSelectedCode
    )
    return (
      <>
        {!!(quoteList && quoteList.length) ? (
          <div className={indexStyles.custom_quote_content}>
            <div className={indexStyles.custom_quote_c_left}>
              <Menu
                onClick={e => {
                  this.handleMenu(e)
                }}
                defaultSelectedKeys={[quoteList[0].field_quote_code]}
                style={{ width: '136px', height: '626px' }}
              >
                {quoteList.map(item => {
                  return (
                    <Menu.Item key={item.field_quote_code}>
                      <span className={globalStyles.authTheme}>
                        {' '}
                        <span style={{ fontSize: '16px', marginRight: '5px' }}>
                          {this.renderTips(item.field_quote_code).icon}
                        </span>
                        {this.renderTips(item.field_quote_code).dec}·
                        {(item.quotes && item.quotes.length) || ''}
                      </span>
                    </Menu.Item>
                  )
                })}
              </Menu>
            </div>
            {this.renderMenu(quotes, field_quote_code)}
          </div>
        ) : (
          <div className={indexStyles.custom_noData}>
            <div>
              <img
                style={{ width: '94px', height: '62px' }}
                src={EmptyImg}
                alt=""
              />
            </div>
            <div style={{ color: 'rgba(0,0,0,0.45)' }}>暂无数据</div>
          </div>
        )}
      </>
    )
  }

  render() {
    const { visible } = this.props
    return (
      <div>
        <Modal
          width={614}
          visible={visible}
          title={null}
          footer={null}
          destroyOnClose={true}
          maskClosable={false}
          getContainer={() =>
            document.getElementById('org_managementContainer')
          }
          onCancel={this.onCancel}
          style={{ width: '614px' }}
          maskStyle={{ backgroundColor: 'rgba(0,0,0,.3)' }}
        >
          <div>
            <div>{this.renderTitle()}</div>
            <div>{this.renderContent()}</div>
          </div>
        </Modal>
      </div>
    )
  }
}
