import React, { Component } from 'react'
import Cookies from 'js-cookie'
import { MAP_URL } from '@/globalset/js/constant'
import { connect } from 'dva'
import globalStyles from '@/globalset/css/globalClassName.less'
import indexStyles from './index.less'
import { openImChatBoard } from '@/utils/businessFunction.js'

@connect(
  ({
    InvestmentMaps = [],
    technological: {
      datas: { currentSelectedProjectOrgIdByBoardId }
    },
    workbench: {
      datas: { projectList = [] }
    },
    simplemode: { simplemodeCurrentProject = {} },
    investmentMap: {
      datas: { mapOrganizationList }
    }
  }) => ({
    InvestmentMaps,
    mapOrganizationList,
    currentSelectedProjectOrgIdByBoardId,
    projectList,
    simplemodeCurrentProject
  })
)
export default class index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: document.querySelector('body').clientHeight,
      selectOrganizationVisible: false,
      orgId: localStorage.getItem('OrganizationId')
    }
  }
  componentDidMount() {
    window.addEventListener('resize', this.setHeight)
    const { dispatch } = this.props
    dispatch({
      type: 'investmentMap/getMapsQueryUser',
      payload: {}
    })
    window.addEventListener('message', this.listenMapBoardChange)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.setHeight)
    window.removeEventListener('message', this.listenMapBoardChange)
  }
  setHeight = () => {
    const height = document.querySelector('body').clientHeight
    this.setState({
      height
    })
  }
  // 监听地图项目变化
  listenMapBoardChange = event => {
    const { dispatch } = this.props
    const message = event.data
    const message_head = 'map_board_change_'
    if (!message || typeof message != 'string') {
      return
    }
    if (message.indexOf(message_head) != -1) {
      const board_id = message.replace(message_head, '')
      openImChatBoard({ board_id, autoOpenIm: true })
    } else if (message == 'map_board_create') {
      //创建项目后要拉取项目权限和全部项目信息
      dispatch({
        type: 'project/afterCreateBoardHandle',
        payload: {}
      })
    } else if (message == 'token_invalid') {
      window.location.hash = `#/login?redirect=${window.location.hash.replace(
        '#',
        ''
      )}`
    } else {
    }
  }
  seeInvestmentMaps(params) {
    this.props.dispatch({
      type: 'technological/updateDatas',
      payload: {
        currentSelectedProjectOrgIdByBoardId: params.id
      }
    })
    this.setState(
      {
        orgId: params.id
      },
      () => {
        this.setState({
          selectOrganizationVisible: true
        })
      }
    )
  }

  componentWillReceiveProps(nextProps) {
    // return
    // console.log(nextProps,'sssssssssssss_nect')
    const {
      currentSelectedProjectOrgIdByBoardId,
      simplemodeCurrentProject = {}
    } = nextProps
    if (
      currentSelectedProjectOrgIdByBoardId &&
      Object.keys(simplemodeCurrentProject) &&
      Object.keys(simplemodeCurrentProject).length
    ) {
      this.setState(
        {
          orgId: currentSelectedProjectOrgIdByBoardId
        },
        () => {
          this.setState({
            selectOrganizationVisible: true
          })
        }
      )
    } else {
      if (!currentSelectedProjectOrgIdByBoardId) {
        this.setState(
          {
            orgId: localStorage.getItem('OrganizationId')
          },
          () => {
            this.setState({
              selectOrganizationVisible: false
            })
          }
        )
      }
    }
  }

  /**
   * 获取对应的组织ID中的项目列表
   * @param {Array} arr1 对应的地图列表
   * @param {Array} arr2 对应的项目列表
   */
  getCorrespondingBoardListByOrgId = (arr1, arr2) => {
    let arr = arr1.reduce((acc, cur) => {
      let obj = {
        ...cur,
        data: []
      }
      arr2.forEach(i => i.org_id == cur.id && obj.data.push(i))
      acc.push(obj)
      return acc
    }, [])
    return arr
  }

  // 渲染地图列表
  renderMapOrganizationList = item => {
    let board_name = val => {
      return (
        <span
          key={val.board_id}
          id={val.board_id}
          className={indexStyles.board_name}
        >
          {val.board_name}
        </span>
      )
    }
    return (
      <div
        onClick={() => this.seeInvestmentMaps(item)}
        key={item.id}
        id={item.id}
        className={indexStyles.org_list}
      >
        <div className={indexStyles.org_left}>
          <div className={`${globalStyles.authTheme} ${indexStyles.boardIcon}`}>
            &#xe677;
          </div>
          <div className={indexStyles.watch_board}>查看地图</div>
        </div>
        <div className={indexStyles.org_right}>
          <div className={indexStyles.org_rTop}>{item.name}：</div>
          <div className={indexStyles.org_rBottom}>
            {item.data && item.data.length ? (
              item.data.map(val => {
                return board_name(val)
              })
            ) : (
              <span style={{ color: 'rgba(0,0,0,0.25)' }}>暂无项目</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { mapOrganizationList = [], projectList = [] } = this.props
    const { orgId } = this.state
    const accessToken = Cookies.get('Authorization')

    //全组织情况下, 如果只有一个组织有开通该功能, 则直接进入地图, 不需要选择组织页面
    const orgItem = mapOrganizationList && mapOrganizationList[0]
    const id = orgItem && orgItem.id
    const org_Id = mapOrganizationList.length > 1 ? orgId : id
    const src_url = `${MAP_URL}?token=${accessToken}&orgId=${org_Id}`
    const { user_set = {} } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    const { selectOrganizationVisible } = this.state
    const workbenchBoxContentElementInfo = document.getElementById(
      'container_workbenchBoxContent'
    )
    let contentHeight = workbenchBoxContentElementInfo
      ? workbenchBoxContentElementInfo.offsetHeight
      : 0

    let investmentMapsList = this.getCorrespondingBoardListByOrgId(
      mapOrganizationList,
      projectList
    )
    const iframe_rendering =
      user_set.current_org === '0' &&
      selectOrganizationVisible === false &&
      investmentMapsList &&
      investmentMapsList.length
    return (
      <div
        className={`${indexStyles.mapsContainer} ${globalStyles.global_vertical_scrollbar}`}
        style={{
          height: contentHeight + 'px',
          padding: `${iframe_rendering ? 48 : 4}px`
          //  overflowY: 'auto'
        }}
      >
        {iframe_rendering ? (
          <>
            {investmentMapsList.map(item => {
              return this.renderMapOrganizationList(item)
            })}
          </>
        ) : (
          !!org_Id && (
            <iframe
              src={src_url}
              webkitAllowFullScreen
              mozallowfullscreen
              allowFullScreen
              scrolling="no"
              frameborder="0"
              width="100%"
              height={'100%'}
            ></iframe>
          )
        )}
        {/* {user_set.current_org === '0' && selectOrganizationVisible === false && mapOrganizationList.length > 1 ? (
                    <div className={indexStyles.boardSelectWapperOut}>
                        <div className={indexStyles.boardSelectWapper}>
                            <div className={indexStyles.groupName}>请选择一个组织进行查看地图</div>
                            <div className={indexStyles.boardItemWapper}>
                                {
                                    mapOrganizationList && mapOrganizationList.map((value, key) => {
                                        return (
                                            <div key={key} className={indexStyles.boardItem} onClick={e => this.seeInvestmentMaps(value)}>
                                                <i className={`${globalStyles.authTheme} ${indexStyles.boardIcon}`}>&#xe677;</i>
                                                <span className={indexStyles.boardName}>{value.name}</span>
                                            </div>
                                        )
                                    })
                                }
                                                   
                            </div>
                        </div>
                    </div>
                ) : (
                        <iframe src={src_url} scrolling='no' frameborder="0" width='100%' height={'100%'}></iframe>
                    )} */}
      </div>
    )
  }
}
