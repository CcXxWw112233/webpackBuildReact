import React from 'react'
import { Modal, Form, Button, Input, message, Select, Spin } from 'antd'
import indexstyles from './index.less'
import { INPUT_CHANGE_SEARCH_TIME } from '../../../../../globalset/js/constant'
import globalStyles from './../../../../../globalset/css/globalClassName.less'
// import debounce from 'lodash/debounce';
import { connect } from 'dva/index'

const FormItem = Form.Item
const TextArea = Input.TextArea
const InputGroup = Input.Group
const Option = Select.Option

const splitStingQuot = '_%_@%@_%_'

function getDisplayName(ele) {
  if (typeof ele.type === 'string') {
    return ele.type
  }
  return ele.type.name || ele.type.displayName || 'No Name'
}

function getAttrs(attrs) {
  return Object.keys(attrs)
    .map(attr => (attr === 'children' ? '' : `${attr}="${attrs[attr]}"`))
    .join('')
}

function transfer(ele) {
  if (typeof ele === 'string' || typeof ele === 'number') {
    return ele
  }

  const props = ele.props || {}
  const children = React.Children.toArray(props.children || [])

  const html = children.map(transfer)
  const tag = getDisplayName(ele)

  return `<${tag} ${getAttrs(props)}>${html.join('')}</${tag}>`
}

//应用与
@connect(mapStateToProps)
export default class CondistionInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      match_conditions_area_height: 40, //搜索框高度，也当作条件列表距离搜索框底部高度
      searchTimer: null,
      show_match_conditions: false, //显示条件列表
      show_match_conditions_flag: false //显示条件列表,作为flag用于input失焦和条件列表单个点击的时间差的校验
    }
    this.conditaion_area_input_ref = React.createRef()
  }

  componentDidMount() {
    this.set_match_conditions_area_height()
  }

  //设置//搜索框高度，也当作条件列表距离搜索框底部高度
  set_match_conditions_area_height = () => {
    const target = this.conditaion_area_input_ref
    const { current } = target
    const { clientHeight } = current
    this.setState({
      match_conditions_area_height: clientHeight
    })
  }

  //设置输出框的内容
  set_conditions_content = () => {
    const target = this.conditaion_area_input_ref
    const {
      current: { innerHTML = '' }
    } = target
    this.parseContent(innerHTML)
  }
  //设置是否显示条件
  set_show_match_conditions = bool => {
    this.setState({
      show_match_conditions: bool
    })
  }
  //解析框内的内容
  parseContent = innerHTML => {
    if (!!!innerHTML) {
      this.handleSearchValueChange(innerHTML, true)
      return
    }
    const { dispatch, searchInputValue } = this.props
    const id = 'conditions_content_'
    const ele = document.createElement('div')
    ele.id = id
    ele.innerHTML = innerHTML
    if (!ele.childNodes[0]) {
      return
    }
    const nodeList = ele.childNodes[0].childNodes
    if (!nodeList.length) {
      //未选条件,已输入
      this.handleSearchValueChange(innerHTML)
    }
    let selected_conditons_arr = []
    //解析出来所选择的条件和输入的文本
    for (let i = 0; i < nodeList.length; i++) {
      const node = nodeList[i]
      if (node['nodeName'].toLowerCase() == 'div') {
        //选择的条件块
        let val = node['dataset']['value']
        const re = new RegExp(splitStingQuot, 'gim')
        //解析出来data-set的数据
        val = val.replace(re, '"')
        selected_conditons_arr.push(JSON.parse(val))
      } else if (
        node['nodeName'].indexOf('text') != -1 &&
        i == nodeList.length - 1
      ) {
        //输入的文本,且是在最后面输入
        const textContent = node['textContent']
        if (textContent != searchInputValue) {
          this.handleSearchValueChange(textContent)
        }
      }
    }
    //更新选择条件
    //去重（字符串化再回溯）
    dispatch({
      type: 'globalSearch/updateDatas',
      payload: {
        selected_conditions: selected_conditons_arr
      }
    })
  }
  //搜索框最后输入的内容变化处理
  handleSearchValueChange = (textContent = '', initial) => {
    const { dispatch } = this.props
    dispatch({
      type: 'globalSearch/updateDatas',
      payload: {
        searchInputValue: textContent
          .replace(/\s/gim, '')
          .replace(/&nbsp;/gim, '')
      }
    })
    this.searchConditioins()
    this.set_show_match_conditions(true)
  }
  //查询条件列表
  searchConditioins = () => {
    const { searchTimer } = this.state
    const { dispatch } = this.props
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    this.setState({
      searchTimer: setTimeout(function() {
        dispatch({
          type: 'globalSearch/getMatchConditions',
          payload: {}
        })
      }, INPUT_CHANGE_SEARCH_TIME)
    })
  }
  //输入框变化
  onInput = e => {
    this.set_match_conditions_area_height()
    this.set_conditions_content()
  }
  //输入框失焦
  onBlur = e => {
    const that = this
    setTimeout(function() {
      const { show_match_conditions_flag } = that.state
      that.set_show_match_conditions(show_match_conditions_flag)
    }, 300)
  }
  onFocus = e => {
    this.set_show_match_conditions(true)
  }
  //选择条件
  selectCondition = (val, e) => {
    e.stopPropagation()
    const that = this
    //用于做点击失焦中间时间差判断显示隐藏-------
    this.setState({
      show_match_conditions_flag: true
    })
    setTimeout(() => {
      this.setState({
        show_match_conditions_flag: false
      })
    }, 300)
    this.set_show_match_conditions(true)
    //用于做点击失焦中间时间差判断显示隐藏-------end

    const { id, value, full_name, name } = val
    const { selected_conditions = [], dispatch } = this.props
    selected_conditions.push({ id, value, full_name, name })
    dispatch({
      type: 'globalSearch/updateDatas',
      payload: {
        selected_conditions,
        searchInputValue: ''
      }
    })
    this.dynamicRenderEditContent(selected_conditions)
  }

  //搜索出来的条件列表
  renderMatchConditions = () => {
    const { match_conditions = [], spinning_conditions } = this.props
    const { match_conditions_area_height = 40 } = this.state
    const match_conditions_list = match_conditions.map((val, key) => {
      const { id, value, conditions, name } = val
      return (
        <div
          className={indexstyles.match_conditions_item}
          key={`${id}_${value}`}
        >
          <div className={indexstyles.match_conditions_item_title}>{name}</div>
          <div className={indexstyles.match_conditions_item_detail}>
            {conditions.map((val2, key2) => {
              const { full_name, name, id, value } = val2
              return (
                <div
                  className={indexstyles.match_conditions_item_detail_item}
                  onClick={e => this.selectCondition(val2, e)}
                  key={`${id}_${value}`}
                >
                  {name}
                </div>
              )
            })}
          </div>
        </div>
      )
    })

    return (
      <div style={{ position: 'relative' }}>
        <div
          style={{ top: match_conditions_area_height }}
          className={`${globalStyles.global_card} ${indexstyles.match_conditions_area} ${globalStyles.global_vertical_scrollbar}`}
        >
          <Spin
            tip="数据加载中"
            style={{ marginTop: 60 }}
            spinning={spinning_conditions}
          >
            <div
              className={`${indexstyles.match_conditions_area_spin}`}
              style={{ top: match_conditions_area_height }}
            ></div>
          </Spin>
          {match_conditions.length ? (
            match_conditions_list
          ) : (
            <div className={indexstyles.match_conditions_area_nodata}>
              无数据，换个条件搜索吧
            </div>
          )}
        </div>
      </div>
    )
  }

  //动态渲染输入框
  dynamicRenderEditContent = () => {
    const target = document.getElementById('conditaion_area_input_ref')
    target.innerHTML = transfer(this.renderEditContent())
    this.set_match_conditions_area_height()
    this.parseContent(target.innerHTML)
  }

  //选择的条件列表
  renderEditContent = () => {
    const { selected_conditions = [] } = this.props

    const itemStyle = `background-color: red;color: #ffffff;height: 24px; background:rgba(89,89,89,1);
                 display: inline-block; height: 24px;line-height: 24px; padding: 0 6px;color: #FFFFFF;
                  font-size: 12px; border-radius: 4px;margin-right: 6px; margin-bottom: 6px;`
    return (
      <div className={`${indexstyles.conditions}`}>
        {selected_conditions.map((val, key) => {
          const { id, name, full_name, value } = val
          const string = JSON.stringify(val)
          let data_string = JSON.stringify(val)
          //替换双引号避免dataset丢失数据
          data_string = data_string.replace(/\"/gim, splitStingQuot)
          return (
            <div
              contenteditable="false"
              data-value={data_string}
              className={`${indexstyles.condition_item}`}
              style={itemStyle}
              key={`${id}_${full_name}`}
            >
              {full_name}
            </div>
          )
        })}
      </div>
    )
  }

  render() {
    const { style, selected_conditions = [], searchInputValue } = this.props
    const { show_match_conditions } = this.state
    return (
      <div style={style} className={indexstyles.search_out_right}>
        <div
          contentEditable="true"
          suppressContentEditableWarning="true"
          placeholder="请输入"
          id={'conditaion_area_input_ref'}
          ref={this.conditaion_area_input_ref}
          className={`${indexstyles.input_out}`}
          onInput={this.onInput}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
        >
          {/*{this.renderEditContent()}*/}
        </div>

        {show_match_conditions && this.renderMatchConditions()}
      </div>
    )
  }
}
function mapStateToProps({
  globalSearch: {
    datas: {
      match_conditions,
      selected_conditions,
      searchInputValue,
      spinning_conditions
    }
  }
}) {
  return {
    match_conditions,
    selected_conditions,
    searchInputValue,
    spinning_conditions
  }
}
