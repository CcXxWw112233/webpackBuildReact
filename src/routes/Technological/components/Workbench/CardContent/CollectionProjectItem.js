import React from 'react'
import indexstyles from '../index.less'
import { Icon } from 'antd'
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import { timestampToTimeNormal } from '../../../../../utils/util'
import Cookies from 'js-cookie'

let is_starinit = null
export default class CollectionProjectItem extends React.Component {
  state = {
    ShowAddMenberModalVisibile: false,
    starOpacity: 1,
    isInitEntry: true,
    isCollection: false,
    isSoundsEvrybody: false,
    ellipsisShow: false, //是否出现...菜单
    dropdownVisibleChangeValue: false, //是否出现...菜单辅助判断标志
  }
  starClick(id, e) {
    e.stopPropagation();
    const { itemDetailInfo = {}} = this.props
    const { is_star } = itemDetailInfo
    this.setState({
      isInitEntry: false,
    }, function () {
      this.setState({
        isCollection: is_starinit === '1' ? false : this.state.isInitEntry ? false : !this.state.isCollection,
        starOpacity: 1
      }, function () {
        if(this.state.isCollection) {
          this.props.collectionProject(id)
        }else{
          this.props.cancelCollection(id)
        }
      })
    })
  }
  starMouseOver() {
    if(this.state.starType === 'star'){
      return false
    }
    this.setState({
      starType: 'star-o',
      starOpacity: 1
    })
  }
  starMouseLeave() {
    if(this.state.starType === 'star'){
      return false
    }
    this.setState({
      starType: 'star-o',
      starOpacity: 0.6
    })
  }

  gotoProjectDetail(id) {
    Cookies.set('board_id', id, {expires: 30, path: ''})
    this.props.routingJump('/technological/projectDetail')
  }

  render() {
    const { itemValue = {}, itemKey } = this.props
    const { starOpacity, isInitEntry, isCollection } = this.state
    const { id, name, is_star, user_count, is_create, residue_quantity =0, realize_quantity=0 } = itemValue // data为项目参与人信息

    is_starinit = is_star
    const cancelStarProjet = (
      <i className={globalStyles.authTheme}
         // onMouseOver={this.starMouseOver.bind(this)}
         // onMouseLeave={this.starMouseLeave.bind(this)}
         // onClick={this.starClick.bind(this, board_id)}
         style={{opacity: starOpacity, color: '#FAAD14 ', fontSize: 16}}>&#xe70e;</i>
    )
    const starProject = (
      <i className={globalStyles.authTheme}
         // onMouseOver={this.starMouseOver.bind(this)}
         // onMouseLeave={this.starMouseLeave.bind(this)}
         // onClick={this.starClick.bind(this, board_id)}
         style={{opacity: starOpacity, color: '#FAAD14 ', fontSize: 16}}>&#xe6f8;</i>
    )

    return (
      <div className={indexstyles.collectionProjectItem} onClick={this.gotoProjectDetail.bind(this, id)}>
        <div className={indexstyles.left}>
          <div className={indexstyles.top}>
            <div>{name}</div>
            <div className={indexstyles.star}>
              {/*{isInitEntry ? (is_star === '1'? (starProject):(cancelStarProjet)):(isCollection? (starProject):(cancelStarProjet))}*/}
              {starProject}
            </div>
          </div>
          <div className={indexstyles.bott}>
            <div>剩余任务 {residue_quantity}</div>
            <div>已完成 {realize_quantity}</div>
            {/*<div>剩余任务 33</div>*/}
          </div>
        </div>
        <div className={indexstyles.right}>
          <Icon type="right" style={{fontSize: 16}}/>
        </div>
      </div>
    )
  }
}
