import React from 'react'
import { Input, Popconfirm, Dropdown } from 'antd'
import TagDropDownStyles from './TagDropDown.less'
import globalStyles from '../../../../../../globalset/css/globalClassName.less'

export default class TagDropDownItem extends React.Component {

  state = {
    isInEdit: false,
    name: '',
    color: '',
    onMouse: false,
  }

  componentWillMount() {
    this.defaultSet(this.props)
  }
  componentWillReceiveProps (nextProps) {
    this.defaultSet(nextProps)
  }

  defaultSet(props) {
    const { itemValue: { name, color } } = props
    this.setState({
      name,
      color,
    })
  }

  changeName(e) {
    this.setState({
      name: e.target.value
    })
  }

  tagItemClick() {
    const { name, isInEdit, color } = this.state
    if(isInEdit) {
      return false
    }
    this.props.tagDropItemClick({name, color})
  }

  toTop(e) {
    e.stopPropagation();
    const { datas: { boardTagList=[] } } = this.props.model
    const { itemKey, itemValue = {} } = this.props
    const { id, board_id } = itemValue
    this.props.toTopBoardTag({label_id: id, board_id})
  }

  updateItem(data, key) {
    const { datas: { boardTagList=[] } } = this.props.model
    const { itemValue = {}, itemKey } = this.props
    const { id, board_id } = itemValue
    // boardTagList[itemKey][key] = data[key]
    // this.props.updateDatasTask({
    //   boardTagList
    // })
    this.props.updateBoardTag({...data, board_id, id})
  }
  toEdit(e) {
    e.stopPropagation();
    this.setState({
      isInEdit: true
    })
  }
  toCheckEdit(e) {
    e.stopPropagation();
    this.setState({
      isInEdit: false
    })
    this.updateItem({name: this.state.name}, 'name')
  }
  setColor(value, e) {
    e.stopPropagation();
    this.setState({
      color: value
    }, () => {
      this.updateItem({color: value}, 'color')
    })
  }

  setOnMouse(bool) {
    this.setState({
      onMouse: bool
    })
  }

  deleteConfirm(e) {
    e.stopPropagation();
    const { itemValue = {} } = this.props
    const { id } = itemValue
    this.props.deleteBoardTag({id})
  }

  deleteCancel(e) {
    e.stopPropagation();
  }

  stopPropagation(e){
    e.stopPropagation()
  }
  render() {
    const { datas: { boardTagList=[] } } = this.props.model

    const { isInEdit, onMouse, name, color } = this.state
    const { itemValue } = this.props
    const { id } = itemValue

    const colorArray = [
      '90,90,90',
      '245,34,45',
      '250,84,28',
      '250,140,22',
      '250,173,20',
      '250,219,20',
      '160,217,17',
      '82,196,26',
      '19,194,194',
      '24,144,255',
      '47,84,235',
      '114,46,209',
      '235,47,150'
    ]

    const selectColorNode = (
      <div className={TagDropDownStyles.selectColorOut}>
        {colorArray.map((value, key) => {
          return (
          <div onClick={this.setColor.bind(this, value)} key={key} style={{color: `rgba(${value})`, backgroundColor: `rgba(${value},0.1)`, border: `1px solid rgba(${value},1)`}}></div>
          )})
        }
      </div>
    )

    return (
      <div className={TagDropDownStyles.dropItem}
           onClick={this.tagItemClick.bind(this)}
           onMouseLeave={this.setOnMouse.bind(this, false)}
           onMouseOver={this.setOnMouse.bind(this, true)}
           style={{color: `rgba(${color})`, backgroundColor: `rgba(${color},0.1)`, border: `1px solid rgba(${color},${onMouse?'1':'0.6'})`}}>

        <div className={TagDropDownStyles.dropItem_left}>
          {!isInEdit? (
            name
          ): (
            <input value={name} style={{width: 194, height: 20, border: 'none', outline: 'none', padding: 4, color: `rgba(${color})`}} autoFocus maxLength={8} onChange={this.changeName.bind(this)} />
          )}
        </div>
        <div className={TagDropDownStyles.dropItem_right} style={{display: `${onMouse?'flex': 'none'}`}} onClick={this.stopPropagation.bind(this)} >
          {id != boardTagList[0]['id']? (
            <div className={globalStyles.authTheme} style={{display: `${!isInEdit?'block': 'none'}`}} onClick={this.toTop.bind(this)}>&#xe63d;</div>
          ) : ('')}

          <Dropdown overlay={selectColorNode} placement={'topCenter'}>
            <div className={globalStyles.authTheme} onClick={this.stopPropagation.bind(this)} style={{display: `${!isInEdit?'block': 'none'}`}} >&#xeae9;</div>
          </Dropdown>
          <div className={globalStyles.authTheme} style={{display: `${!isInEdit?'block': 'none'}`}} onClick={this.toEdit.bind(this)}>&#xe8e0;</div>
          <Popconfirm zIndex={2000} placement={'top'} autoAdjustOverflow title="确认删除该标签吗？" onConfirm={this.deleteConfirm.bind(this)} onCancel={this.deleteCancel.bind(this)} >
            <div className={globalStyles.authTheme} onClick={this.stopPropagation.bind(this)} style={{display: `${!isInEdit?'block': 'none'}`}}>&#xe70f;</div>
          </Popconfirm>
          {/*单独*/}
          <div className={globalStyles.authTheme} style={{display: `${!isInEdit?'none': 'block'}`}} onClick={this.toCheckEdit.bind(this)}>&#xe70b;</div>
        </div>


      </div>
    )
  }

}
