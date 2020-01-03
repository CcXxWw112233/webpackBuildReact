import React from 'react'
import { Input, Select, Icon, Spin } from 'antd'
import indexstyles from './index.less'
import globalStyles from './../../../globalset/css/globalClassName.less'
import { INPUT_CHANGE_SEARCH_TIME } from '../../../globalset/js/constant'
import ConditionInput from './components/CondistionInput/index'
import {connect} from "dva/index";
const InputGroup = Input.Group;
const Option = Select.Option;

//此弹窗应用于各个业务弹窗，和右边圈子适配
const getEffectOrReducerByName = name => `globalSearch/${name}`
@connect(mapStateToProps)
export default class SearchArea extends React.Component {
  state = {
    searchTimer: null,
    show_match_conditions: false, //显示条件列表
    show_match_conditions_flag: false, //显示条件列表,作为flag用于input失焦和条件列表单个点击的时间差的校验
  }

  constructor() {
    super()
    this.search_input_ref = React.createRef()
    this.selectTypeChange = this.selectTypeChange.bind(this)
    this.inputChange = this.inputChange.bind(this)
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: getEffectOrReducerByName('getGlobalSearchTypeList'),
      payload: {
      }
    })
    dispatch({
      type: getEffectOrReducerByName('getFixedConditions'),
      payload: {

      }
    })
  }

  componentWillReceiveProps(nextProps) {

  }

  onCancel() {
    const { dispatch } = this.props
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        globalSearchModalVisible: false
      }
    })
  }

  selectTypeChange(value) {
    const { dispatch } = this.props
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        defaultSearchType: value,
        page_number: 1,
      }
    })
    dispatch({
      type: getEffectOrReducerByName('getGlobalSearchResultList'),
      payload: {}
    })
  }

  inputChange(e) {
    const that = this
    const value = e.target.value
    const { dispatch } = this.props
    //设置显示条件列表区域
    this.set_show_match_conditions(true)

    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        searchInputValue: value.replace(/\s/gim, ''),
        page_number: 1,
        // allTypeResultList: [],
        // sigleTypeResultList: []
      }
    })
    const { searchTimer } = this.state
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    this.setState({
      searchTimer: setTimeout(function () {
        dispatch({
          type: getEffectOrReducerByName('getMatchConditions'),
          payload: {}
        })
      }, INPUT_CHANGE_SEARCH_TIME)
    })
  }
  //输入框失焦
  inputBlur = e => {
    const that = this
    setTimeout(function () {
      const { show_match_conditions_flag } = that.state
      that.set_show_match_conditions(show_match_conditions_flag)
    }, 300)
  }
  inputFocus = e => {
    this.set_show_match_conditions(true)
  }
  inputOnPressEnter = e => {
    const value = e.target.value
    document.getElementById('globalSearch_input_').focus()
    this.set_show_match_conditions(false)
    const { dispatch } = this.props
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        searchInputValue: value.replace(/\s/gim, ''),
        page_number: 1,
      }
    })
    setTimeout(() => {
      this.getGlobalSearchResult()
    }, 300)
  }
  //搜索查询区域
  //选择条件
  set_show_match_conditions = (bool) => {
    this.setState({
      show_match_conditions: bool
    })
  }
  selectCondition = (val, e) => {
    e.stopPropagation()
    const that = this
    //用于做点击失焦中间时间差判断显示隐藏-------start
    this.setState({
      show_match_conditions_flag: true
    })
    setTimeout(() => {
      this.setState({
        show_match_conditions_flag: false
      })
    }, 300)
    this.set_show_match_conditions(true)
    //主动聚焦input
    document.getElementById('globalSearch_input_').focus()
    //用于做点击失焦中间时间差判断显示隐藏-------end

    const { id, value, full_name, name } = val
    const { selected_conditions = [], dispatch } = this.props
    const isAreadyHasItem = selected_conditions.find(item => item.id == id && item.value == value) //是否存在相同，存在就不添加
    !isAreadyHasItem && selected_conditions.push({ id, value, full_name, name })
    dispatch({
      type: 'globalSearch/updateDatas',
      payload: {
        selected_conditions,
        searchInputValue: '',
      }
    })
  }
  //搜索出来的条件列表
  renderMatchConditions = () => {
    const { match_conditions = [], spinning_conditions, selected_conditions } = this.props
    const { match_conditions_area_height = 40 } = this.state
    const isChooseItem = ({value, id}) => { //是否已选
      const flag = selected_conditions.find(item => item.value == value && item.id == id)
      return !!flag
    }
    const match_conditions_list = (
      match_conditions.map((val, key) => {
        const { id, value, conditions, name } = val
        return (
          <div className={indexstyles.match_conditions_item} key={`${id}_${value}`}>
            <div className={indexstyles.match_conditions_item_title}>{name}</div>
            <div className={indexstyles.match_conditions_item_detail}>
              {
                conditions.map((val2, key2) => {
                  const { full_name, name, id, value } = val2
                  return (
                    <div className={indexstyles.match_conditions_item_detail_item}
                         onClick={(e) => this.selectCondition(val2, e)}
                         key={`${id}_${value}`}>
                      <div className={`${globalStyles.authTheme} ${globalStyles.global_ellipsis} ${indexstyles.match_conditions_item_detail_item_name}`}>{name}</div>
                      {isChooseItem({value, id}) && (
                        <div className={`${globalStyles.authTheme} ${indexstyles.match_conditions_item_detail_item_check}`}>&#xe7fc;</div>
                      )}
                    </div>
                  )
                })
              }
            </div>
          </div>
        )
      })
    )

    return (
      <div style={{position: 'relative'}}>
        <div
          className={`${globalStyles.global_card} ${indexstyles.match_conditions_area} ${globalStyles.global_vertical_scrollbar}`}>
          <Spin tip="数据加载中" style={{marginTop: 60}} spinning={spinning_conditions}>
            <div className={`${indexstyles.match_conditions_area_spin}`} style={{top: match_conditions_area_height}}></div>
          </Spin>
          {match_conditions.length? (
            match_conditions_list
          ) : (
            <div className={indexstyles.match_conditions_area_nodata}>无数据，换个条件搜索吧</div>
          )}
        </div>
      </div>
    )
  }

  //整体查询输入区域
  renderInputSearch = () => {
    const { searchTypeList = [], defaultSearchType, searchInputValue } = this.props
    return (
      <div style={{paddingTop: 20}} >
        <InputGroup compact={true} size={'large'} style={{display: 'flex'}}>
          <Select value={defaultSearchType} size={'large'} onChange={this.selectTypeChange} style={{ width: '16%', fontSize: 14 }} suffixIcon={<Icon type="caret-down" />}>
            {searchTypeList.map((value, key) => {
              const { search_type, name } = value
              return (
                <Option value={search_type} key={key}>{name || ''}</Option>
              )
            })}
          </Select>
          {/*<ConditionInput*/}
            {/*style={{ width: '78%', fontSize: 14 }}*/}
            {/*value={searchInputValue}*/}
            {/*onChange={this.inputChange}*/}
            {/*placeholder={'请输入'}*/}
          {/*/>*/}
          <Input style={{ width: '84%', fontSize: 14, marginLeft: '-10px' }}
                 value={searchInputValue}
                 ref={this.search_input_ref}
                 id={'globalSearch_input_'}
                 onPressEnter={this.inputOnPressEnter}
                 onChange={this.inputChange}
                 onBlur={this.inputBlur}
                 onFocus={this.inputFocus}
                 placeholder={'请输入'} suffix={<div className={globalStyles.authTheme} style={{height: 40, width: 30, textAlign: 'right', lineHeight: '40px', cursor: 'pointer'}} onClick={this.getGlobalSearchResult}>&#xe611;</div>}/>
          {/*<div className={`${indexstyles.search_trigger}`} style={{width: '6%'}} onClick={this.getGlobalSearchResult}>*/}
            {/*<i className={globalStyles.authTheme}>&#xe611;</i>*/}
          {/*</div>*/}

        </InputGroup>
      </div>
    )
  }

  //查询结果
  getGlobalSearchResult = () => {
    const { dispatch } = this.props
    dispatch({
      type: getEffectOrReducerByName('getGlobalSearchResultList'),
      payload: {}
    })
  }

  //选择的条件列表
  renderSelectedConditions = () => {
    const { selected_conditions = [] } = this.props
    return (
      <div className={`${indexstyles.conditions}`}>
        {
          selected_conditions.map((val, key) => {
            const { id, name, full_name, value } = val
            //替换双引号避免dataset丢失数据
            return (
              <div
                onClick={() => this.delectSelectedCondition(key)}
                className={`${indexstyles.condition_item}`}
                key={`${id}_${full_name}`}>
                {full_name}
              </div>
            )
          })
        }
      </div>
    )
  }
  //删除某个条件
  delectSelectedCondition = (key) => {
    const { selected_conditions = [], dispatch } = this.props
    const arr = [...selected_conditions]
    arr.splice(key, 1)
    dispatch({
      type: 'globalSearch/updateDatas',
      payload: {
        selected_conditions: arr,
        page_number: 1,
      }
    })
    setTimeout(() => {
      dispatch({
        type: getEffectOrReducerByName('getGlobalSearchResultList'),
        payload: {
          // query_conditions: arr
        }
      })
    })
  }
  //固定条件点击
  fixedConditionSelect = (data = []) => {
    const { selected_conditions = [], dispatch } = this.props
    let arr = [...selected_conditions]
    data.map(item => {
      const { conditions = [] } = item
      arr = [].concat(arr, conditions)
    })
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        selected_conditions: arr,
        page_number: 1,
      }
    })
    setTimeout(() => {
      dispatch({
        type: getEffectOrReducerByName('getGlobalSearchResultList'),
        payload: {
          // query_conditions: arr
        }
      })
    }, 300)
  }
  //固定条件
  renderFixedConditions = () => {
    const { fixed_conditions = [] } = this.props
    return (
      <div className={indexstyles.fixed_conditions_area}>
        <div className={indexstyles.fixed_conditions_area_left}>
          {
            fixed_conditions.map((val) => {
              const { id, name, query_conditions } = val
              return (
                <div className={indexstyles.fixed_conditions_area_left_item} key={`${id}_${name}`} onClick={() => this.fixedConditionSelect(query_conditions)}>{name}</div>
              )
            })
          }
          {/*<div className={indexstyles.fixed_conditions_area_left_item}>最近添加的内容</div>*/}
        </div>
        {/*<div className={`${indexstyles.fixed_conditions_area_right} ${globalStyles.authTheme}`}>&#xe66f;</div>*/}
      </div>
    )
  }

  render() {
    const { selected_conditions = [], defaultSearchTypeNormal, defaultSearchType } = this.props
    const { show_match_conditions } = this.state
    return(
      <div className={`${indexstyles.searchAreaOut}`}>
        {this.renderInputSearch()}
        {show_match_conditions && this.renderMatchConditions()}

        {
          selected_conditions.length?(
            this.renderSelectedConditions()
          ): (
            (defaultSearchType == defaultSearchTypeNormal) && this.renderFixedConditions()
          )
        }
      </div>
    )
  }
}

function mapStateToProps({ globalSearch: { datas: {searchTypeList = [], defaultSearchType, defaultSearchTypeNormal,
  searchInputValue, globalSearchModalVisible, spinning, page_number, isInMatchCondition,
  match_conditions, selected_conditions, spinning_conditions, fixed_conditions
} } }) {
  return {
    searchTypeList, defaultSearchType, searchInputValue, globalSearchModalVisible, spinning, page_number, isInMatchCondition,
    match_conditions, selected_conditions, spinning_conditions, fixed_conditions, defaultSearchTypeNormal
  }
}
