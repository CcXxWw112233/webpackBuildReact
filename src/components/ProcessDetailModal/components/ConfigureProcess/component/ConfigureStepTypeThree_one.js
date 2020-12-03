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
import ConfigureRatingGuide from '../../../ConfigureRatingGuide'
import { cursorMoveEnd } from '../../handleOperateModal'

@connect(mapStateToProps)
export default class ConfigureStepTypeThree_one extends Component {
  constructor(props) {
    super(props)
    this.state = {
      localScoreList:
        props.itemValue && props.itemValue.score_items
          ? JSON.parse(JSON.stringify(props.itemValue.score_items || []))
          : [],
      local_enable_weight:
        props.itemValue && props.itemValue.enable_weight
          ? props.itemValue.enable_weight
          : '',
      score_items:
        props.itemValue && props.itemValue.score_items
          ? JSON.parse(JSON.stringify(props.itemValue.score_items || []))
          : [],
      is_add_description: false, // 是否是在添加说明 false 表示不在 true表示进入说明状态
      currentSelectItemIndex: '', // 当前选中的元素下标
      currentSelectItemDescription: '', // 当前选择的元素的描述内容
      popoverVisible: false, // 配置的气泡框是否可见 false 为不可见
      clientWidth: document.getElementById(`ratingItems_${props.itemKey}`)
        ? document.getElementById(`ratingItems_${props.itemKey}`).clientWidth
        : 420
    }
    this.resizeTTY = this.resizeTTY.bind(this)
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeTTY)
  }
  componentWillReceiveProps(nextProps) {
    if (!isObjectValueEqual(this.props, nextProps)) {
      this.setState({
        localScoreList:
          nextProps.itemValue && nextProps.itemValue.score_items
            ? JSON.parse(JSON.stringify(nextProps.itemValue.score_items || []))
            : [],
        score_items:
          nextProps.itemValue && nextProps.itemValue.score_items
            ? JSON.parse(JSON.stringify(nextProps.itemValue.score_items || []))
            : []
      })
    }
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

  initData = () => {
    const { localScoreList = [], score_items = [] } = this.state
    this.setState({
      is_add_description: false, // 是否是在添加说明 false 表示不在 true表示进入说明状态
      currentSelectItemIndex: '', // 当前选中的元素下标
      currentSelectItemDescription: '', // 当前选择的元素的描述内容
      localScoreList: JSON.parse(JSON.stringify(localScoreList || [])),
      score_items: JSON.parse(JSON.stringify(score_items || []))
    })
  }

  onVisibleChange = visible => {
    const {
      is_score_rating,
      score_items: scoreList = [],
      localScoreList = [],
      local_enable_weight
    } = this.state
    const { itemKey, parentKey, processEditDatas = [], itemValue } = this.props
    const { enable_weight } = itemValue
    if (!is_score_rating) {
      // 判断是否点击了确定
      if (visible == false) {
        this.setState({
          score_items: JSON.parse(JSON.stringify(localScoreList || []))
        })
        this.props.updateConfigureProcess &&
          this.props.updateConfigureProcess(
            { value: JSON.parse(JSON.stringify(localScoreList || [])) },
            'score_items'
          )
        if (local_enable_weight == '1') {
          this.setState({
            local_enable_weight: '0'
          })
          this.props.updateConfigureProcess &&
            this.props.updateConfigureProcess({ value: '0' }, 'enable_weight')
        }
      }
    }
    if (visible) {
      this.props.dispatch({
        type: 'publicProcessDetailModal/updateDatas',
        payload: {
          not_show_create_rating_guide: '1'
        }
      })
    }
    this.setState({
      popoverVisible: visible
    })
  }

  handleClickRatingItems = e => {
    e && e.stopPropagation()
    return
    console.log(this.state.popoverVisible, 'ssssssssssssssssssssssss_visible')
    if (this.state.popoverVisible) return
    // 保存一个点击的状态
    this.onVisibleChange(true)
    // this.setState({
    //   popoverVisible: true
    // })
  }

  // 关闭气泡事件
  handleClosePopoverVisible = () => {
    this.onVisibleChange(false)
    this.initData()
  }

  updateState = (data, index) => {
    const { value, key, isNotUpdateModelDatas } = data
    const { score_items = [] } = this.state
    let new_data = [...score_items]
    new_data[index][key] = value
    this.setState({
      score_items: new_data
    })
    if (!isNotUpdateModelDatas) {
      this.props.updateConfigureProcess &&
        this.props.updateConfigureProcess({ value: new_data }, 'score_items')
    }
  }

  // 是否开启权重
  handleWeightChange = checked => {
    const { score_items = [] } = this.state
    if (score_items && score_items.length <= 1) {
      return
    }
    let new_data = JSON.parse(JSON.stringify(score_items || []))
    new_data = new_data.map(item => {
      let new_item = { ...item }
      new_item = { ...item, max_score: '100', weight_ratio: '100' }
      return new_item
    })
    this.setState({
      local_enable_weight: checked ? '1' : '0'
    })
    if (checked) {
      this.setState({
        score_items: new_data
      })
      // this.props.updateConfigureProcess && this.props.updateConfigureProcess({value: new_data}, 'score_items')
    }
    // this.props.updateConfigureProcess && this.props.updateConfigureProcess({ value: checked ? '1' : '0' }, 'enable_weight')
  }

  titleResize = key => {
    if (
      !this.refs &&
      !Object.keys(this.refs).length &&
      !this.refs[`autoTitleTextArea_${key}`]
    )
      return
    //关键是先设置为auto，目的为了重设高度（如果字数减少）
    this.refs[`autoTitleTextArea_${key}`].style.height = this.refs[
      `autoTitleTextArea_${key}`
    ].scrollHeight
      ? this.refs[`autoTitleTextArea_${key}`].scrollHeight
      : '38px'

    // 如果高度不够，再重新设置
    if (
      this.refs[`autoTitleTextArea_${key}`].scrollHeight >=
      this.refs[`autoTitleTextArea_${key}`].offsetHeight
    ) {
      this.refs[`autoTitleTextArea_${key}`].style.height =
        this.refs[`autoTitleTextArea_${key}`].scrollHeight + 'px'
    }
  }

  gradeResize = key => {
    if (
      !this.refs &&
      !Object.keys(this.refs).length &&
      !this.refs[`autoGradeTextArea_${key}`]
    )
      return
    //关键是先设置为auto，目的为了重设高度（如果字数减少）
    this.refs[`autoGradeTextArea_${key}`].style.height = '38px'

    // 如果高度不够，再重新设置
    if (
      this.refs[`autoGradeTextArea_${key}`].scrollHeight >=
      this.refs[`autoGradeTextArea_${key}`].offsetHeight
    ) {
      this.refs[`autoGradeTextArea_${key}`].style.height =
        this.refs[`autoGradeTextArea_${key}`].scrollHeight + 'px'
    }
  }

  weightResize = key => {
    if (
      !this.refs &&
      !Object.keys(this.refs).length &&
      !this.refs[`autoWeightTextArea_${key}`]
    )
      return
    //关键是先设置为auto，目的为了重设高度（如果字数减少）
    this.refs[`autoWeightTextArea_${key}`].style.height = '38px'

    // 如果高度不够，再重新设置
    if (
      this.refs[`autoWeightTextArea_${key}`].scrollHeight >=
      this.refs[`autoWeightTextArea_${key}`].offsetHeight
    ) {
      this.refs[`autoWeightTextArea_${key}`].style.height =
        this.refs[`autoWeightTextArea_${key}`].scrollHeight + 'px'
    }
  }

  // 表示是标题的输入变化
  handleAutoTitleTextArea = (e, key, i) => {
    let val = e.target.value
    if (val.trimLR() == '') {
      this.updateState(
        { value: '', key: 'title', isNotUpdateModelDatas: true },
        i
      )
      return
    }
    this.updateState(
      { value: val, key: 'title', isNotUpdateModelDatas: true },
      i
    )
    if (this.refs && this.refs[`autoTitleTextArea_${key}`]) {
      this.titleResize(key)
    }
  }

  handleAutoTitleTextAreaBlur = (key, index) => {
    if (index || index == 0) {
      const { score_items = [] } = this.state
      let new_data = [...score_items]
      new_data = new_data.map((item, i) => {
        if (index == i) {
          let new_item = { ...item }
          new_item = { ...item, is_show_title_area: false }
          return new_item
        } else {
          return item
        }
      })
      this.setState({
        score_items: new_data
      })
    }
    if (this.refs && this.refs[`autoTitleTextArea_${key}`]) {
      this.titleResize(key)
    }
  }

  // changeTwoDecimal = (floatvar) => {
  //   let f_x
  //   f_x = parseFloat(floatvar);
  //   if (isNaN(f_x)) {
  //     return '';
  //   }
  //   f_x = Math.round(floatvar * 100) / 100;
  //   return f_x;
  // }

  // 表示是输入分值的内容变化
  handleAutoGradeTextAreaValue = (e, key, i) => {
    e && e.stopPropagation()
    let value = e.target.value
    const reg = /^([1-9]\d{0,2}(\.\d{2})?|1000)$/
    // /^([1-9]\d{0,2}?|1000)$/
    if (value == '' || value.trimLR() == '' || value > 1000) {
      this.updateState(
        { value: '', key: 'max_score', isNotUpdateModelDatas: true },
        i
      )
      return
    }
    if (value.indexOf('.') != -1 && value.indexOf('.') != 0) {
      // 表示存在小数点
      let str = value.split('.')
      if (str && str.length > 2) {
        // 表示禁止输入多个小数点
        value = value.substring(0, value.indexOf('.') + 3)
      } else if (isNaN(str[0])) {
        // 如果数字的前半段就是非数字 那么就取整
        value = parseInt(value)
      } else if (str[1] && str[1].length && isNaN(str[1])) {
        // 表示后半段中如果存在非数字那么取整
        value = parseInt(value)
      } else if (str[1] && str[1].length && str[1].length > 2) {
        // 表示如果小数点后半段位数大于2那么保留两位小数
        value = String(value).substring(0, String(value).indexOf('.') + 3)
      }
    } else {
      if (isNaN(value)) {
        this.updateState(
          { value: '', key: 'max_score', isNotUpdateModelDatas: true },
          i
        )
        return
      }
    }

    this.updateState(
      { value: String(value), key: 'max_score', isNotUpdateModelDatas: true },
      i
    )
    if (this.refs && this.refs[`autoGradeTextArea_${key}`]) {
      this.gradeResize(key)
    }
  }

  handleAutoGradeTextAreaBlur = (e, key, i) => {
    e && e.stopPropagation()
    return
    let value = e.target.value
    const reg = /^([1-9]\d{0,2}?|1000)$/
    if (reg.test(value) && value != '' && String(value).trimLR() != '') {
      this.updateState({ value: value, key: 'max_score' }, i)
    } else {
      this.updateState({ value: '', key: 'max_score' }, i)
    }
    if (this.refs && this.refs[`autoGradeTextArea_${key}`]) {
      this.gradeResize(key)
    }
  }

  handleAutoGradeTextAreaValue2 = (e, key, i) => {
    e && e.stopPropagation()
    let value = e.target.value
    const { score_items = [] } = this.state
    let new_data = JSON.parse(JSON.stringify(score_items || []))
    const reg = /^([1-9]\d{0,2}(\.\d{2})?|1000)$/
    // /^([1-9]\d{0,2}?|1000)$/
    if (value == '' || value.trimLR() == '' || value > 1000) {
      // this.updateState({ value: '', key: 'max_score', isNotUpdateModelDatas: true }, i)
      new_data = new_data.map(item => {
        let new_item = { ...item }
        new_item = { ...item, max_score: '' }
        return new_item
      })
      this.setState({
        score_items: new_data
      })
      return
    }
    if (value.indexOf('.') != -1 && value.indexOf('.') != 0) {
      // 表示存在小数点
      let str = value.split('.')
      if (str && str.length > 2) {
        // 表示禁止输入多个小数点
        value = value.substring(0, value.indexOf('.') + 3)
      } else if (isNaN(str[0])) {
        // 如果数字的前半段就是非数字 那么就取整
        value = parseInt(value)
      } else if (str[1] && str[1].length && isNaN(str[1])) {
        // 表示后半段中如果存在非数字那么取整
        value = parseInt(value)
      } else if (str[1] && str[1].length && str[1].length > 2) {
        // 表示如果小数点后半段位数大于2那么保留两位小数
        value = String(value).substring(0, String(value).indexOf('.') + 3)
      }
    } else {
      if (isNaN(value)) {
        // this.updateState({ value: '', key: 'max_score', isNotUpdateModelDatas: true }, i)
        new_data = new_data.map(item => {
          let new_item = { ...item }
          new_item = { ...item, max_score: '' }
          return new_item
        })
        this.setState({
          score_items: new_data
        })
        return
      }
    }
    new_data = new_data.map(item => {
      let new_item = { ...item }
      new_item = { ...item, max_score: value }
      return new_item
    })
    this.setState({
      score_items: new_data
    })
    // this.updateState({ value: String(value), key: 'max_score', isNotUpdateModelDatas: true }, i)

    if (this.refs && this.refs[`autoGradeTextArea_${key}`]) {
      this.gradeResize(key)
    }
  }

  // 表示是输入权重的内容变化
  handleChangeAutoWeightTextAreaValue = (e, key, i) => {
    e && e.stopPropagation()
    let value = e.target.value
    const reg = /^([0-9]\d{0,1}?|100)$/
    // /^([1-9]\d{0,2}?|1000)$/
    if (value == '' || value.trimLR() == '' || !reg.test(value)) {
      this.updateState(
        { value: '', key: 'weight_ratio', isNotUpdateModelDatas: true },
        i
      )
      return
    }
    this.updateState(
      { value: value, key: 'weight_ratio', isNotUpdateModelDatas: true },
      i
    )
    if (this.refs && this.refs[`autoWeightTextArea_${key}`]) {
      this.weightResize(key)
    }
  }

  handleChangeAutoWeightTextAreaBlur = (e, key, i) => {
    e && e.stopPropagation()
    return
    let value = e.target.value
    const reg = /^([1-9]\d{0,1}?|100)$/
    if (reg.test(value) && value != '' && String(value).trimLR() != '') {
      this.updateState({ value: value, key: 'weight_ratio' }, i)
    } else {
      this.updateState({ value: '', key: 'weight_ratio' }, i)
    }
    if (this.refs && this.refs[`autoWeightTextArea_${key}`]) {
      this.weightResize(key)
    }
  }

  handleAddTableItems = e => {
    e && e.stopPropagation()
    const { score_items = [] } = this.state
    let new_data = [...score_items]
    let obj = {
      key: new_data.length.toString(),
      title: '评分项',
      weight_ratio: '100',
      max_score: '100',
      description: ''
    }
    new_data.push(obj)
    this.setState({
      score_items: new_data
    })
    // this.props.updateConfigureProcess && this.props.updateConfigureProcess({ value: new_data }, 'score_items')
  }

  handleChangeMenuItem = (e, index) => {
    const { key, domEvent } = e
    domEvent.stopPropagation()
    switch (key) {
      case '1': // 表示添加说明
        this.handleAddDescription(index)
        break
      case '2': // 表示删除此项
        this.handleDeleteItem(index)
        break
      default:
        break
    }
  }

  // 添加说明
  handleAddDescription = key => {
    const { currentSelectItemIndex, score_items = [] } = this.state
    let gold_description =
      (score_items.find((item, index) => index == key) || {}).description || ''
    this.setState({
      is_add_description: true,
      currentSelectItemIndex: key, // 表示当前选中的元素下标
      currentSelectItemDescription: gold_description // 点击添加说明之后, 将当前的这个描述更新过来
    })
  }

  // 添加说明change事件
  handleChangeDescription = e => {
    e && e.stopPropagation()
    const { currentSelectItemIndex } = this.state
    if (e.target.value.trimLR() == '') {
      // this.updateState({ value: '', key: 'description', isNotUpdateModelDatas: true }, currentSelectItemIndex)
      this.setState({
        currentSelectItemDescription: ''
      })
      return
    }
    this.setState({
      currentSelectItemDescription: e.target.value
    })
    // this.updateState({ value: e.target.value, key: 'description', isNotUpdateModelDatas: true }, currentSelectItemIndex)
  }

  // 确认更新描述事件
  handleConfirmDescription = e => {
    e && e.stopPropagation()
    const { currentSelectItemIndex, currentSelectItemDescription } = this.state
    this.updateState(
      { value: currentSelectItemDescription, key: 'description' },
      currentSelectItemIndex
    )
    // 更新一个字段表示更新了
    // this.updateState({ value: true, key: 'is_update_description' }, currentSelectItemIndex)
    this.setState({
      is_add_description: false
    })
  }

  // 取消更新描述事件
  handleCancleDescription = e => {
    e && e.stopPropagation()
    const {
      currentSelectItemIndex,
      score_items = [],
      currentSelectItemDescription
    } = this.state
    // let gold_update = (score_items.find((item, index) => index == currentSelectItemIndex) || {}).is_update_description || ''
    let gold_description =
      (score_items.find((item, index) => index == currentSelectItemIndex) || {})
        .description || ''
    if (gold_description) {
      // 表示model中有描述
      this.updateState(
        {
          value: gold_description != '' ? gold_description : '',
          key: 'description'
        },
        currentSelectItemIndex
      )
    } else {
      // 表示model中没有描述, 那么就是清空呗
      this.updateState(
        { value: '', key: 'description' },
        currentSelectItemIndex
      )
    }
    // if (gold_update) { // 如果说是从已经更新过的说明中取消, 那么就是要恢复到上一个说明中

    //   this.updateState({ value: gold_description != '' ? gold_description : '', key: 'description' }, currentSelectItemIndex)
    // } else {
    //   this.updateState({ value: '', key: 'description' }, currentSelectItemIndex)
    // }

    this.setState({
      is_add_description: false
    })
  }

  // 删除选项
  handleDeleteItem = index => {
    const { score_items = [] } = this.state
    let new_data = [...score_items]
    for (let i = 0; i < new_data.length; i++) {
      if (i == index) {
        new_data.splice(index, 1) // 将使后面的元素依次前移，数组长度减1
        i-- // 如果不减，将漏掉一个元素
        break
      }
    }
    new_data = new_data.map((item, i) => {
      let new_item = { ...item, key: String(i) }
      return new_item
    })
    this.setState({
      score_items: new_data
    })
    this.props.updateConfigureProcess &&
      this.props.updateConfigureProcess({ value: new_data }, 'score_items')
    // 这是因为删除后 需要延时去更新状态
    let temp_index = index == new_data.length ? new_data.length - 1 : index
    setTimeout(() => {
      this.titleResize(temp_index)
    }, 200)
  }

  onFocus = (e, key, i) => {
    e && e.stopPropagation()
    e && e.preventDefault()
    if (this.refs && this.refs[`autoTitleTextArea_${key}`]) {
      this.titleResize(key)
    }
    let obj = this.refs && this.refs[`autoTitleTextArea_${key}`]
    cursorMoveEnd(obj)
    // this.handleAutoTitleTextAreaBlur(key)
  }

  // 确认事件
  handleComfirmScoreRating = e => {
    e && e.stopPropagation()
    const { score_items = [], local_enable_weight } = this.state
    const {
      itemValue: { enable_weight }
    } = this.props
    let new_data = [...score_items]
    new_data = new_data.map(item => {
      let new_item = { ...item }
      new_item = { ...item, weight_ratio: '100' }
      return new_item
    })
    this.setState(
      {
        is_score_rating: true,
        localScoreList: JSON.parse(JSON.stringify(score_items || []))
      },
      () => {
        this.onVisibleChange(false)
        this.setState({
          is_score_rating: false
        })
        this.props.updateConfigureProcess &&
          this.props.updateConfigureProcess(
            { value: JSON.parse(JSON.stringify(score_items || [])) },
            'score_items'
          )
        if (enable_weight != local_enable_weight) {
          this.props.updateConfigureProcess &&
            this.props.updateConfigureProcess(
              { value: local_enable_weight },
              'enable_weight'
            )
          if (local_enable_weight == '0') {
            this.setState({
              score_items: JSON.parse(JSON.stringify(new_data || [])),
              localScoreList: JSON.parse(JSON.stringify(new_data || []))
            })
            this.props.updateConfigureProcess &&
              this.props.updateConfigureProcess(
                { value: JSON.parse(JSON.stringify(new_data || [])) },
                'score_items'
              )
          }
        }
      }
    )
  }

  handleShowTitleArea = (e, key, index) => {
    e && e.stopPropagation()
    const { score_items = [] } = this.state
    let new_data = [...score_items]
    new_data = new_data.map((item, i) => {
      if (index == i) {
        let new_item = { ...item }
        new_item = { ...item, is_show_title_area: true }
        return new_item
      } else {
        return item
      }
    })
    this.setState(
      {
        score_items: new_data
      },
      () => {
        this.onFocus(e, key, index)
      }
    )
  }

  renderMoreSelect = index => {
    const { score_items = [] } = this.state
    let flag = score_items && score_items.length > '1'
    return (
      <Menu
        onClick={e => {
          this.handleChangeMenuItem(e, index)
        }}
      >
        <Menu.Item key="1">添加说明</Menu.Item>
        {flag && <Menu.Item key="2">删除此项</Menu.Item>}
      </Menu>
    )
  }

  // 渲染默认的table表格, 即没有开启权重评分
  renderDefaultTableContent = () => {
    const { score_items = [], currentSelectItemIndex } = this.state
    return (
      <table
        className={indexStyles.popover_tableContent}
        border={1}
        style={{ borderColor: '#E9E9E9' }}
        width="100%"
      >
        <tr
          style={{
            height: '38px',
            border: '1px solid #E9E9E9',
            textAlign: 'center',
            background: '#FAFAFA'
          }}
        >
          <th style={{ width: '260px' }}>标题</th>
          <th>
            最高分值
            <div style={{ color: 'rgba(0,0,0,0.25)', fontSize: '12px' }}>
              (最高1000分)
            </div>
          </th>
        </tr>
        {score_items &&
          score_items.map((item, index) => {
            const {
              key,
              max_score,
              title,
              id,
              is_show_title_area,
              description
            } = item
            return (
              <tr
                style={{
                  height: '38px',
                  border: '1px solid #E9E9E9',
                  textAlign: 'center'
                }}
              >
                <td style={{ width: '170px' }}>
                  {/* <div className={`${indexStyles.rating_editTable} ${globalStyles.global_vertical_scrollbar}`} contentEditable={true}></div> */}
                  {is_show_title_area ? (
                    <textarea
                      autoFocus={true}
                      onFocus={e => {
                        this.onFocus(e, key || id || index, index)
                      }}
                      maxLength={200}
                      value={title}
                      onBlur={e => {
                        this.handleAutoTitleTextAreaBlur(
                          key || id || index,
                          index
                        )
                      }}
                      onChange={e => {
                        this.handleAutoTitleTextArea(
                          e,
                          key || id || index,
                          index
                        )
                      }}
                      ref={`autoTitleTextArea_${key || id || index}`}
                    />
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around'
                      }}
                      onClick={e => {
                        this.handleShowTitleArea(e, key || id || index, index)
                      }}
                    >
                      <div className={indexStyles.show_title_area}>{title}</div>
                      {description && description != '' && (
                        <div
                          style={{ marginRight: '4px' }}
                          className={globalStyles.authTheme}
                        >
                          &#xe7f6;
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td style={{ position: 'relative', width: '90px' }}>
                  {/* <div className={indexStyles.rating_editTable} contentEditable={true}></div> */}
                  <textarea
                    value={max_score}
                    onBlur={e => {
                      this.handleAutoGradeTextAreaBlur(
                        e,
                        key || id || index,
                        index
                      )
                    }}
                    onChange={e => {
                      this.handleAutoGradeTextAreaValue(
                        e,
                        key || id || index,
                        index
                      )
                    }}
                    ref={`autoGradeTextArea_${key || id || index}`}
                  />
                  <Dropdown
                    overlay={this.renderMoreSelect(index)}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    trigger={['click']}
                  >
                    <div className={indexStyles.rating_moreBox}>
                      <span className={indexStyles.rating_more_icon}>
                        <span className={globalStyles.authTheme}>&#xe7fd;</span>
                      </span>
                    </div>
                  </Dropdown>
                </td>
              </tr>
            )
          })}
      </table>
    )
  }

  // 渲染具有权重的表格
  renderWeightTableContent = () => {
    const { score_items = [] } = this.state
    return (
      <table
        className={indexStyles.popover_tableContent}
        border={1}
        style={{ borderColor: '#E9E9E9' }}
        width="100%"
      >
        <tr
          style={{
            height: '38px',
            border: '1px solid #E9E9E9',
            textAlign: 'center',
            background: '#FAFAFA'
          }}
        >
          <th style={{ width: '170px' }}>标题</th>
          <th style={{ width: '90px' }}>
            权重占比%
            <div style={{ color: '#F5222D', fontSize: '12px' }}>
              {this.whetherTheAllWeightValueGreaterThanHundred()
                ? '(总和需等于100%)'
                : ''}
            </div>
          </th>
          <th style={{ width: '90px' }}>
            最高分值
            <div style={{ color: 'rgba(0,0,0,0.25)', fontSize: '12px' }}>
              (最高1000分)
            </div>
          </th>
        </tr>
        {score_items &&
          score_items.map((item, index) => {
            const {
              key,
              title,
              max_score,
              weight_ratio,
              id,
              is_show_title_area,
              description
            } = item
            return (
              <tr
                style={{
                  height: '38px',
                  border: '1px solid #E9E9E9',
                  textAlign: 'center'
                }}
              >
                <td style={{ width: '170px' }}>
                  {/* <div className={`${indexStyles.rating_editTable} ${globalStyles.global_vertical_scrollbar}`} contentEditable={true}></div> */}
                  {is_show_title_area ? (
                    <textarea
                      autoFocus={true}
                      onFocus={e => {
                        this.onFocus(e, key || id || index, index)
                      }}
                      maxLength={200}
                      value={title}
                      onBlur={e => {
                        this.handleAutoTitleTextAreaBlur(
                          key || id || index,
                          index
                        )
                      }}
                      onChange={e => {
                        this.handleAutoTitleTextArea(
                          e,
                          key || id || index,
                          index
                        )
                      }}
                      ref={`autoTitleTextArea_${key || id || index}`}
                    />
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around'
                      }}
                      onClick={e => {
                        this.handleShowTitleArea(e, key || id || index, index)
                      }}
                    >
                      <div
                        style={{ maxWidth: '140px' }}
                        className={indexStyles.show_title_area}
                      >
                        {title}
                      </div>
                      {description && description != '' && (
                        <div
                          style={{ marginRight: '4px' }}
                          className={globalStyles.authTheme}
                        >
                          &#xe7f6;
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td style={{ width: '90px' }}>
                  {/* <div className={`${indexStyles.rating_editTable} ${globalStyles.global_vertical_scrollbar}`} contentEditable={true}></div> */}
                  <textarea
                    value={weight_ratio}
                    onBlur={e => {
                      this.handleChangeAutoWeightTextAreaBlur(
                        e,
                        key || id || index,
                        index
                      )
                    }}
                    onChange={e => {
                      this.handleChangeAutoWeightTextAreaValue(
                        e,
                        key || id || index,
                        index
                      )
                    }}
                    ref={`autoWeightTextArea_${key || id || index}`}
                  />
                </td>
                <td style={{ position: 'relative', width: '90px' }}>
                  {/* <div className={indexStyles.rating_editTable} contentEditable={true}></div> */}
                  <textarea
                    value={max_score}
                    onChange={e => {
                      this.handleAutoGradeTextAreaValue2(
                        e,
                        key || id || index,
                        index
                      )
                    }}
                    ref={`autoGradeTextArea_${key || id || index}`}
                  />
                  <Dropdown
                    overlay={this.renderMoreSelect(index)}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    trigger={['click']}
                  >
                    <div className={indexStyles.rating_moreBox}>
                      <span className={indexStyles.rating_more_icon}>
                        <span className={globalStyles.authTheme}>&#xe7fd;</span>
                      </span>
                    </div>
                  </Dropdown>
                </td>
              </tr>
            )
          })}
      </table>
    )
  }

  // 判断是否有内容为空 true 表示存在内容为空
  whetherIsEmptyContent = () => {
    const { score_items = [] } = this.state
    let new_data = [...score_items]
    let flag
    new_data.find(item => {
      if (item.title == '' || item.max_score == '' || item.weight_ratio == '') {
        flag = true
      }
    })
    return flag
  }

  // 判断分数是否是在范围内
  whetherIsScoreValueAccordReg = () => {
    const { score_items = [] } = this.state
    let new_data = [...score_items]
    let flag
    const reg = /^([1-9]\d{0,2}(\.\d{1,2})?|1000)$/
    new_data.find(item => {
      if (!reg.test(item.max_score)) {
        flag = true
      }
    })
    return flag
  }

  // 判断所有内容的权重是否大于100 true 表示如果不等于100 禁用
  whetherTheAllWeightValueGreaterThanHundred = () => {
    const { score_items = [] } = this.state
    let new_data = [...score_items]
    let flag
    let compare_value = 100
    let total_value = new_data.reduce((acc, curr) => {
      let weight_ratio = curr.weight_ratio
      acc += Number(weight_ratio)
      return acc
    }, 0)
    if (total_value != compare_value) {
      flag = true
    }
    return flag
  }

  renderConfigurationScore = () => {
    const {
      itemValue: { enable_weight },
      itemKey
    } = this.props
    const {
      localScoreList = [],
      score_items = [],
      local_enable_weight
    } = this.state
    // let disabledFlag = isObjectValueEqual(localScoreList, score_items) || this.whetherIsEmptyContent() || (local_enable_weight == '1' && this.whetherTheAllWeightValueGreaterThanHundred()) || ((local_enable_weight == enable_weight) && this.whetherTheAllWeightValueGreaterThanHundred())
    let disabledFlag
    if (local_enable_weight == '0') {
      if (local_enable_weight != enable_weight) {
        if (
          isObjectValueEqual(localScoreList, score_items) ||
          this.whetherIsEmptyContent() ||
          this.whetherIsScoreValueAccordReg()
        ) {
          disabledFlag = false
        } else {
          disabledFlag = false
        }
      } else {
        if (
          isObjectValueEqual(localScoreList, score_items) ||
          this.whetherIsEmptyContent() ||
          this.whetherIsScoreValueAccordReg()
        ) {
          disabledFlag = true
        }
      }
    } else if (local_enable_weight == '1') {
      if (local_enable_weight != enable_weight) {
        if (
          this.whetherTheAllWeightValueGreaterThanHundred() ||
          isObjectValueEqual(localScoreList, score_items) ||
          this.whetherIsEmptyContent() ||
          this.whetherIsScoreValueAccordReg()
        ) {
          disabledFlag = true
        } else {
          disabledFlag = false
        }
      } else {
        if (
          this.whetherTheAllWeightValueGreaterThanHundred() ||
          isObjectValueEqual(localScoreList, score_items) ||
          this.whetherIsEmptyContent() ||
          this.whetherIsScoreValueAccordReg()
        ) {
          disabledFlag = true
        }
      }
    }

    return (
      <div className={indexStyles.popover_content}>
        <div
          style={{ minHeight: '352px' }}
          className={`${indexStyles.pop_elem} ${globalStyles.global_vertical_scrollbar}`}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: 'rgba(0,0,0,0.45)'
            }}
          >
            <span>评分内容：</span>
            <span style={{ display: 'inline-block' }}>
              <span style={{ verticalAlign: 'middle', position: 'relative' }}>
                权重评分
                <Tooltip
                  autoAdjustOverflow={false}
                  overlayStyle={{ minWidth: '228px' }}
                  title="2个以上评分时可以开启权重评分，设置评分值所在总分值中的占比（总占比之和须等于100%）"
                  placement="top"
                  getPopupContainer={() =>
                    document.getElementById(`popoverContainer_${itemKey}`)
                  }
                >
                  <span
                    style={{ fontSize: '16px', cursor: 'pointer' }}
                    className={globalStyles.authTheme}
                  >
                    &#xe845;&nbsp;&nbsp;
                  </span>
                </Tooltip>
                :&nbsp;&nbsp;&nbsp;
              </span>
              <span>
                <Switch
                  style={{
                    cursor:
                      score_items && score_items.length <= 1
                        ? 'not-allowed'
                        : 'pointer'
                  }}
                  size="small"
                  onChange={this.handleWeightChange}
                  checked={local_enable_weight == '1'}
                />
              </span>
            </span>
          </div>
          {local_enable_weight == '1'
            ? this.renderWeightTableContent()
            : this.renderDefaultTableContent()}
          {/* {this.renderDefaultTableContent()} */}
          {/* {this.renderWeightTableContent()} */}
          <Button
            onClick={this.handleAddTableItems}
            className={indexStyles.rating_button}
          >
            <span className={globalStyles.authTheme}>&#xe782;</span>
            <span>&nbsp;&nbsp;添加评分</span>
          </Button>
        </div>
        <div className={indexStyles.pop_btn}>
          <Button
            onClick={this.handleComfirmScoreRating}
            disabled={disabledFlag}
            type="primary"
            style={{ width: '100%' }}
          >
            确定
          </Button>
        </div>
      </div>
    )
  }

  // 添加说明
  renderAddDescription = () => {
    const {
      score_items = [],
      currentSelectItemIndex,
      currentSelectItemDescription
    } = this.state
    let gold_description =
      (score_items.find((item, index) => index == currentSelectItemIndex) || {})
        .description || ''
    return (
      <div
        className={indexStyles.popover_content}
        style={{ textAlign: 'center' }}
      >
        <Input.TextArea
          className={globalStyles.global_vertical_scrollbar}
          style={{ resize: 'none', width: '352px', minHeight: '332px' }}
          placeholder="添加说明"
          value={currentSelectItemDescription}
          onChange={this.handleChangeDescription}
          maxLength={200}
        />
        <div style={{ marginTop: '12px', textAlign: 'right' }}>
          <Button
            onClick={this.handleCancleDescription}
            style={{
              height: '32px',
              marginRight: '8px',
              border: '1px solid rgba(24,144,255,1)',
              color: '#1890FF'
            }}
          >
            取消
          </Button>
          <Button
            onClick={this.handleConfirmDescription}
            disabled={
              currentSelectItemDescription == gold_description ||
              currentSelectItemDescription == ''
            }
            type="primary"
            style={{ height: '32px' }}
          >
            确认
          </Button>
        </div>
      </div>
    )
  }

  // 渲染添加说明的头部
  renderAddDescriptionTitle = () => {
    const { score_items = [], currentSelectItemIndex } = this.state
    let gold_title =
      (score_items.find((item, index) => index == currentSelectItemIndex) || {})
        .title || ''
    return (
      <div className={indexStyles.popover_title} style={{ display: 'flex' }}>
        <span
          onClick={this.handleCancleDescription}
          className={`${indexStyles.back_icon} ${globalStyles.authTheme}`}
        >
          &#xe7ec;
        </span>
        <span
          style={{
            flex: '1',
            margin: '0 4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '360px',
            whiteSpace: 'nowrap'
          }}
        >
          {gold_title}
        </span>
        <span
          onClick={this.handleClosePopoverVisible}
          className={`${globalStyles.authTheme} ${indexStyles.rating_close}`}
        >
          &#xe7fe;
        </span>
      </div>
    )
  }

  // 渲染配置评分title
  renderConfigurationScoreTitile = () => {
    return (
      <div className={indexStyles.popover_title} style={{ display: 'flex' }}>
        <span style={{ flex: '1' }}>配置评分</span>
        <span
          onClick={this.handleClosePopoverVisible}
          className={`${globalStyles.authTheme} ${indexStyles.rating_close}`}
        >
          &#xe7fe;
        </span>
      </div>
    )
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
    const { enable_weight, score_display } = itemValue
    const {
      score_items = [],
      is_add_description,
      popoverVisible,
      clientWidth,
      local_enable_weight
    } = this.state
    let flag = this.whetherShowDiffWidth()
    let autoWidth = clientWidth
      ? clientWidth / score_items.length - 45 > 130
        ? 130
        : clientWidth / score_items.length - 45
      : 130
    return (
      <div>
        {/* 评分项 */}
        <div
          id={`popoverContainer_${itemKey}`}
          style={{ borderBottom: '1px solid rgba(0,0,0,0.09)' }}
        >
          <Popover
            // key={`${itemKey}-${itemValue}`}
            title={
              is_add_description
                ? this.renderAddDescriptionTitle()
                : this.renderConfigurationScoreTitile()
            }
            trigger="click"
            visible={this.state.popoverVisible}
            onClick={e => e.stopPropagation()}
            content={
              is_add_description
                ? this.renderAddDescription()
                : this.renderConfigurationScore()
            }
            getPopupContainer={triggerNode => triggerNode.parentNode}
            placement={'bottomRight'}
            zIndex={1010}
            className={indexStyles.popoverWrapper}
            autoAdjustOverflow={false}
            onVisibleChange={this.onVisibleChange}
          >
            <div
              id={`ratingItems_${itemKey}`}
              onClick={this.handleClickRatingItems}
              className={indexStyles.ratingItems}
              style={{
                background: popoverVisible ? '#E6F7FF' : 'rgba(0, 0, 0, 0.02)'
              }}
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
                          {local_enable_weight == '1' && (
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
                                className={
                                  globalStyles.global_vertical_scrollbar
                                }
                                style={{
                                  wordBreak: 'break-all',
                                  whiteSpace: 'pre-wrap',
                                  width: '175px',
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
              {/* {
              score_display == '1' && (
                <div style={{ color: 'rgba(0,0,0,0.45)', fontWeight: 500, position: 'absolute', bottom: '0' }}>
                  <span className={globalStyles.authTheme}>&#xe66c;</span>
                  <span>&nbsp;&nbsp;评分过程中各评分人的评分信息互相不可见</span>
                </div>
              )
            } */}
              {/* <div>
                <div id={`popoverContainer_${itemKey}`} onClick={(e) => e.stopPropagation()} className={indexStyles.popoverContainer} style={{ position: 'absolute', right: 0, top: 0 }}>

                  <span onClick={(e) => e && e.stopPropagation()} className={`${indexStyles.delet_iconCircle}`}>
                    <span style={{ color: '#1890FF' }} className={`${globalStyles.authTheme} ${indexStyles.deletet_icon}`}>&#xe78e;</span>
                  </span>

                </div>
              </div> */}
              <div>
                <ConfigureRatingGuide />
              </div>
            </div>
          </Popover>
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
