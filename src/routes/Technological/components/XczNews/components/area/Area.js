// 地区页面

import React, { Component } from 'react'
import { connect } from 'dva'
import areaStyles from './area.less'
import { Select, Input, Spin } from 'antd'
import globalStyles from '@/globalset/css/globalClassName.less'
import SearchArticlesList from '../../common/SearchArticlesList'
import NoMatch from './NoMatch'

const { Option } = Select
const Search = Input.Search

@connect(({ xczNews = [] }) => ({
  xczNews
}))
export default class Area extends Component {
  constructor(props) {
    super(props)
    this.lastFetchId = 0
  }

  state = {
    click_more: false, // 是否显示展开更多城市列表 默认为flase
    click_more_text: false, // 控制文字展开还是显示全部内容 默认为false 展开全部内容
    select_active: false, // 控制选项的高亮效果
    fetching: false, // 是否正在查询
    timer: null
  }

  // handleProvinceChange 省级的选择
  handleProvinceChange(value) {
    const { dispatch } = this.props
    dispatch({
      type: 'xczNews/updateDatas',
      payload: {
        provinceValue: value,
        defaultProvinceValue: value,
        defaultCityValue: 'cityTown',
        area_ids: value,
        defaultArr: [],
        defaultSearchAreaVal: undefined,
        page_no: 1
      }
    })
    dispatch({
      type: 'xczNews/getAreasArticles',
      payload: {}
    })
  }

  // handleCityChange 市级的选择
  handleCityChange(value) {
    const { dispatch } = this.props
    dispatch({
      type: 'xczNews/updateDatas',
      payload: {
        cityValue: value,
        area_ids: value,
        defaultCityValue: value,
        defaultArr: [],
        defaultSearchAreaVal: undefined,
        page_no: 1
      }
    })
    dispatch({
      type: 'xczNews/getAreasArticles',
      payload: {}
    })
  }

  // handleClickMore 点击展开更多城市列表 以及显示或者收起文字内容
  handleClickMore() {
    const { click_more, click_more_text } = this.state
    this.setState({
      click_more: !click_more,
      click_more_text: !click_more_text
    })
  }

  // handleSelectCity 每一个省级地区的点击选择事件
  handleSelectProvinceCity(id) {
    // console.log(id)
    const { dispatch } = this.props
    dispatch({
      type: 'xczNews/updateDatas',
      payload: {
        area_ids: id,
        provinceValue: id,
        defaultProvinceValue: id,
        defaultCityValue: 'cityTown',
        defaultArr: [],
        defaultSearchAreaVal: undefined,
        page_no: 1
      }
    })
    dispatch({
      type: 'xczNews/getAreasArticles',
      payload: {}
    })
  }

  // handleSelectCity 每一个市级地区的点击选择事件
  handleSelectCity(id, parentId) {
    // console.log(parentId)
    const { dispatch } = this.props
    dispatch({
      type: 'xczNews/updateDatas',
      payload: {
        area_ids: id,
        cityValue: id,
        defaultCityValue: id,
        defaultProvinceValue: parentId,
        provinceValue: parentId,
        defaultArr: [],
        defaultSearchAreaVal: undefined,
        page_no: 1
      }
    })
    dispatch({
      type: 'xczNews/getAreasArticles',
      payload: {}
    })
  }

  // renderSimpleInfo 未展开更多列表
  rendereSimpleInfo() {
    const { xczNews } = this.props
    const { cityList = [], area_ids } = xczNews
    return (
      <div
        className={areaStyles.ul}
        style={{ maxHeight: 180, overflow: 'hidden' }}
      >
        {cityList &&
          cityList.map(item => {
            return (
              <div className={areaStyles.li}>
                <span className={areaStyles.province}>
                  <b
                    onClick={() => {
                      this.handleSelectProvinceCity(item.id)
                    }}
                    className={`${areaStyles.a} ${area_ids &&
                      item.id == area_ids &&
                      areaStyles.active}`}
                    id={item.id}
                  >
                    {item.name}
                  </b>
                </span>
                <span className={areaStyles.downtown}>
                  {item.child.map(key => {
                    return (
                      <b
                        onClick={() => {
                          this.handleSelectCity(key.id, key.parent_id)
                        }}
                        className={`${areaStyles.a} ${area_ids &&
                          key.id == area_ids &&
                          areaStyles.active}`}
                        id={key.id}
                      >
                        {key.name}
                      </b>
                    )
                  })}
                </span>
              </div>
            )
          })}
      </div>
    )
  }

  // renderAllInfo 展开全部列表
  renderAllInfo() {
    const { xczNews } = this.props
    const { cityList = [], area_ids } = xczNews
    return (
      <div className={areaStyles.ul}>
        {cityList &&
          cityList.map(item => {
            return (
              <div className={areaStyles.li}>
                <span className={areaStyles.province}>
                  <b
                    className={`${areaStyles.a} ${area_ids &&
                      item.id == area_ids &&
                      areaStyles.active}`}
                    onClick={() => {
                      this.handleSelectProvinceCity(item.id)
                    }}
                  >
                    {item.name}
                  </b>
                </span>
                <span className={areaStyles.downtown}>
                  {item.child.map(key => {
                    return (
                      <b
                        onClick={() => {
                          this.handleSelectCity(key.id, key.parent_id)
                        }}
                        className={`${areaStyles.a} ${area_ids &&
                          key.id == area_ids &&
                          areaStyles.active}`}
                        id={key.id}
                      >
                        {key.name}
                      </b>
                    )
                  })}
                </span>
              </div>
            )
          })}
      </div>
    )
  }

  // renderInfo
  renderInfo() {
    const { click_more } = this.state
    return click_more ? this.renderAllInfo() : this.rendereSimpleInfo()
  }

  //未展开更多列表的文字内容
  renderMoreSimple() {
    return (
      <>
        <span
          onClick={() => {
            this.handleClickMore()
          }}
        >
          展开城市列表
        </span>
        <div className={`${globalStyles.authTheme} ${areaStyles.down}`}>
          &#xe7ee;
        </div>
      </>
    )
  }

  // 展开更多城市列表，需要收起
  renderMoreBack() {
    return (
      <>
        <span
          onClick={() => {
            this.handleClickMore()
          }}
        >
          收起城市列表
        </span>
        <div className={`${globalStyles.authTheme} ${areaStyles.down}`}>
          &#xe7ed;
        </div>
      </>
    )
  }

  // renderMoreText
  renderMoreText() {
    const { click_more_text } = this.state
    return click_more_text ? this.renderMoreBack() : this.renderMoreSimple()
  }

  // 地区的搜索
  getAreaSearch(value) {
    const { dispatch } = this.props
    // console.log(value)
    dispatch({
      type: 'xczNews/updateDatas',
      payload: {
        areaSearchValue: value,
        isAreaSearch: false,
        page_no: 1
      }
    })
    dispatch({
      type: 'xczNews/getAreasSearch',
      payload: {}
    })
  }

  // onSearch
  handleAreaSearch(value) {
    const { dispatch } = this.props
    dispatch({
      type: 'xczNews/updateDatas',
      payload: {
        areaSearchValue: value,
        isAreaSearch: true,
        page_no: 1
      }
    })
    const { timer } = this.state
    if (timer) {
      clearTimeout(timer)
    }
    this.setState({
      timer: setTimeout(() => {
        this.getAreaSearch(value)
      }, 500)
    })
  }

  // areaChgVal 地区输入变化
  areaChangeValue(value) {
    // console.log(value)
    const { dispatch } = this.props
    dispatch({
      type: 'xczNews/updateDatas',
      payload: {
        areaSearchData: [],
        isAreaSearch: false,
        searchId: value,
        page_no: 1
      }
    })
  }

  // 选项的点击
  areaSelectOption(deep, id, parentId) {
    // console.log(deep, id)
    const { dispatch } = this.props
    // console.log(1111)
    if (deep == 1) {
      dispatch({
        type: 'xczNews/updateDatas',
        payload: {
          provinceValue: id,
          defaultProvinceValue: id,
          area_ids: id,
          defaultArr: [],
          defaultCityValue: 'cityTown',
          defaultSearchAreaVal: undefined,
          page_no: 1
        }
      })
    } else {
      dispatch({
        type: 'xczNews/updateDatas',
        payload: {
          cityValue: id,
          defaultCityValue: id,
          provinceValue: parentId,
          defaultProvinceValue: parentId,
          area_ids: id,
          defaultArr: [],
          defaultSearchAreaVal: undefined,
          page_no: 1
        }
      })
    }
    dispatch({
      type: 'xczNews/getAreasArticles',
      payload: {}
    })
  }

  // handleCityLocation 地区的定位
  handleCityLocation() {
    const { dispatch } = this.props
    dispatch({
      type: 'xczNews/getAreasLocation',
      payload: {}
    })
    dispatch({
      type: 'xczNews/updateDatas',
      payload: {}
    })
  }

  render() {
    const { xczNews, location } = this.props
    const {
      cityList = [],
      provinceData = [],
      cityData = {},
      provinceValue,
      cityValue,
      defaultCityValue,
      defaultProvinceValue,
      defaultSearchAreaVal,
      areaSearchData = [],
      areaSearchValue,
      isAreaSearch,
      searchId
    } = xczNews
    let cityValueArr = cityData && cityData[provinceValue]
    let select_city_key = Object.keys(cityData) // 拿到所有省级的id,
    // console.log(select_city_key)

    return (
      <React.Fragment>
        <div className={areaStyles['city_list']}>
          <div className={areaStyles.wrapper} style={{ position: 'relative' }}>
            <div className={areaStyles.choose}>
              <Select
                value={defaultProvinceValue}
                // defaultValue={defaultProvinceValue}
                onChange={value => {
                  this.handleProvinceChange(value)
                }}
              >
                <Option value="province" key="province">
                  全国
                </Option>
                {provinceData &&
                  provinceData.length &&
                  provinceData.map(item => {
                    return (
                      <Option value={item.id} key={item.id}>
                        {item.name}
                      </Option>
                    )
                  })}
              </Select>
              <Select
                value={defaultCityValue}
                onChange={value => {
                  this.handleCityChange(value)
                }}
                disabled={
                  provinceValue && provinceValue != 'province' ? false : true
                }
              >
                <Option value="cityTown" key="cityTown" disabled>
                  城市
                </Option>
                {select_city_key.indexOf(provinceValue) !== -1 ? (
                  cityValueArr.map(item => {
                    return (
                      <Option value={item.id} key={item.id}>
                        {item.name}
                      </Option>
                    )
                  })
                ) : (
                  <Option value="cityTown" key="cityTown" disabled>
                    --
                  </Option>
                )}
              </Select>
              <span
                onClick={() => {
                  this.handleCityLocation()
                }}
                className={`${globalStyles.authTheme} ${areaStyles.position}`}
              >
                &#xe669;
              </span>
            </div>
            <Select
              showArrow={false}
              showSearch={true}
              value={defaultSearchAreaVal}
              placeholder="搜索地区"
              notFoundContent={
                isAreaSearch ? <Spin size="small" /> : <NoMatch />
              }
              filterOption={false}
              style={{ width: 148, cursor: 'auto' }}
              onSearch={value => {
                this.handleAreaSearch(value)
              }}
              onChange={value => {
                this.areaChangeValue(value)
              }}
            >
              {areaSearchData.map(item => {
                return (
                  <Option
                    onClick={() => {
                      this.areaSelectOption(
                        item.deep,
                        item.id,
                        item.parent_id,
                        item.name
                      )
                    }}
                    value={item.id}
                    key={item.id}
                  >
                    {item.name}
                  </Option>
                )
              })}
            </Select>
            <div className={`${globalStyles.authTheme} ${areaStyles.search}`}>
              &#xe611;
            </div>
          </div>
          <div className={areaStyles.areas}>{this.renderInfo()}</div>
          <div className={areaStyles.mask}>{this.renderMoreText()}</div>
        </div>

        {/* 文章详情 */}
        <SearchArticlesList {...{ location }} />
      </React.Fragment>
    )
  }
}
