import React, { Component } from 'react'
import {
  Dropdown,
  Icon,
  Radio,
  Tooltip,
  Popover,
  Switch,
  Select,
  InputNumber,
  Button,
  Input,
  Menu
} from 'antd'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'
import { isObjectValueEqual } from '../../../../../utils/util'

@connect(mapStateToProps)
export default class EditStepTypeThree_one extends Component {
  constructor(props) {
    super(props)
    let temp_items = []
    if (props.itemValue && props.itemValue.score_items) {
      temp_items =
        props.itemValue.score_items.filter(item => item.is_total != '1') || []
    }
    this.state = {
      score_items:
        props.itemValue && props.itemValue.score_items
          ? JSON.parse(JSON.stringify(temp_items || []))
          : [],
      clientWidth: document.getElementById(`ratingItems_${props.itemKey}`)
        ? document.getElementById(`ratingItems_${props.itemKey}`).clientWidth
        : 420
    }
    this.resizeTTY = this.resizeTTY.bind(this)
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeTTY)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeTTY)
  }
  resizeTTY = () => {
    const { itemKey } = this.props
    const clientWidth = document.getElementById(`ratingItems_${itemKey}`)
      ? document.getElementById(`ratingItems_${itemKey}`).clientWidth - 200
      : 420
    this.setState({
      clientWidth
    })
  }

  whetherShowDiffWidth = () => {
    const { score_items = [] } = this.state
    let flag = false
    for (let i = 0; i < score_items.length; i++) {
      if (i % 4 == 0 || i % 2 == 0) {
        flag = true
        break
      }
    }
    return flag
  }

  render() {
    const {
      itemValue,
      processEditDatas = [],
      itemKey,
      projectDetailInfoData: { data = [], board_id, org_id }
    } = this.props
    const { enable_weight, score_node_set = {} } = itemValue
    const { score_display } = score_node_set
    const { score_items = [], clientWidth } = this.state
    let flag = this.whetherShowDiffWidth()
    let autoWidth = clientWidth ? clientWidth / 4 - 45 : 130
    return (
      <div>
        {/* 评分项 */}
        <div
          style={{
            borderTop: '1px solid rgba(0,0,0,0.09)',
            marginTop: '16px',
            padding: '16px 14px'
          }}
        >
          <div
            id={`ratingItems_${itemKey}`}
            className={indexStyles.ratingItems}
            style={{ paddingBottom: score_display == '0' ? '56px' : '16px' }}
          >
            {score_items &&
              score_items.map((item, index) => {
                const { title, description, max_score, weight_ratio } = item
                return (
                  <div
                    key={item}
                    className={`${indexStyles.rating_itemsValue} ${
                      flag && score_items.length > 1
                        ? indexStyles.rating_active_width
                        : indexStyles.rating_normal_width
                    }`}
                  >
                    <p>
                      <span
                        style={{
                          position: 'relative',
                          marginRight: '9px',
                          cursor: 'pointer',
                          display: 'flex',
                          flex: 1
                        }}
                      >
                        <Tooltip
                          title={title}
                          placement="top"
                          getPopupContainer={triggerNode =>
                            triggerNode.parentNode
                          }
                        >
                          <span style={{ display: 'flex' }}>
                            <span
                              style={{
                                marginRight: '9px',
                                display: 'inline-block',
                                maxWidth:
                                  clientWidth &&
                                  !(flag && score_items.length > 1)
                                    ? clientWidth + 'px'
                                    : autoWidth,
                                minWidth: '50px',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                verticalAlign: 'middle'
                              }}
                            >
                              {title}
                            </span>
                            <span>:</span>
                          </span>
                        </Tooltip>
                        {enable_weight == '1' && (
                          <Tooltip
                            overlayStyle={{ minWidth: '116px' }}
                            title={`权重占比: ${weight_ratio}%`}
                            placement="top"
                            getPopupContainer={triggerNode =>
                              triggerNode.parentNode
                            }
                          >
                            <span className={indexStyles.rating_weight}>
                              &nbsp;&nbsp;{`*${weight_ratio}%`}
                            </span>
                          </Tooltip>
                        )}
                      </span>
                      {description != '' ? (
                        <Popover
                          autoAdjustOverflow={false}
                          title={
                            <div
                              style={{
                                margin: '0 4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '130px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {title}
                            </div>
                          }
                          content={
                            <div
                              className={globalStyles.global_vertical_scrollbar}
                              style={{
                                wordBreak: 'break-all',
                                whiteSpace: 'pre-wrap',
                                width: '210px',
                                maxHeight: '205px',
                                overflowY: 'auto'
                              }}
                            >
                              {description}
                            </div>
                          }
                          placement="top"
                          getPopupContainer={() =>
                            document.getElementById(`ratingItems_${itemKey}`)
                          }
                        >
                          <span
                            style={{ color: '#1890FF', cursor: 'pointer' }}
                            className={globalStyles.authTheme}
                          >
                            &#xe845;
                          </span>
                        </Popover>
                      ) : (
                        ''
                      )}
                    </p>
                    <div className={indexStyles.rating_grade}>
                      <span>
                        最高
                        <span className={indexStyles.rating_grade_value}>
                          {max_score}
                        </span>
                        分
                      </span>
                    </div>
                  </div>
                )
              })}
            {score_display == '0' && (
              <div
                style={{
                  color: 'rgba(0,0,0,0.45)',
                  fontWeight: 500,
                  position: 'absolute',
                  bottom: '16px'
                }}
              >
                <span className={globalStyles.authTheme}>&#xe66c;</span>
                <span>&nbsp;&nbsp;评分过程中各评分人的评分信息互相不可见</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: { processEditDatas = [] },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  }
}) {
  return { processEditDatas, projectDetailInfoData }
}
