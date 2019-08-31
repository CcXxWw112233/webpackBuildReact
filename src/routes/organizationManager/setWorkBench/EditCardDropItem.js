import React from 'react'
import EditCardDropStyle from './index.less'
import { Icon, Menu, Dropdown, Tooltip, Card, Input, Checkbox } from 'antd'
import CardContentNormal from './CardContentNormal'

export default class EditCardDropItem extends React.Component {
  state ={
    bottVisible: '1', //1默认 2展开 3关闭
    checked: false,
  }
  componentWillMount(){ // 进来之后设置选中
    const { already_has_boxs=[], itemValue, parentKey, collapseStatus} = this.props
    const { id } = itemValue
    let flag= false
    for(let val of already_has_boxs) {
      if(id === val) {
        flag = true
        break
      }
    }
    this.setState({
      checked: flag
    })

    const { bottVisible } = this.state
    if(collapseStatus && bottVisible === '3') {
      this.setState({
        bottVisible: '1'
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    const { already_has_boxs=[], itemValue, parentKey, collapseStatus } = nextProps
    const { id } = itemValue
    let flag= false
    for(let val of already_has_boxs) {
      if(id === val) {
        flag = true
        break
      }
    }
    this.setState({
      checked: flag
    })
    const { bottVisible } = this.state
    if(collapseStatus && bottVisible === '3') {
      this.setState({
        bottVisible: '1'
      })
    }
  }
  setBottVisible(state) {
    const { bottVisible } = this.state
    this.setState({
      bottVisible: bottVisible === '1'? '2':( bottVisible==='2'?'3':'2')
    })
  }

  CheckChange({id, parentKey}, e) {
     const checked = e.target.checked
     const { datas: { orgnization_role_data = [] } } = this.props.model
     this.setState({
       checked
     }, () => {
       const newChecked = this.state.checked
       if(newChecked) { //添加选中
         if(orgnization_role_data[parentKey]['already_has_boxs'].indexOf(id) == -1) {
           orgnization_role_data[parentKey]['already_has_boxs'].push(id)
         }
       }else { //取消选择
         const idIndex = orgnization_role_data[parentKey]['already_has_boxs'].indexOf(id)
         orgnization_role_data[parentKey]['already_has_boxs'].splice(idIndex, 1)
       }
       this.props.updateDatas({
         orgnization_role_data
       })
     })
  }
  render() {
    const { bottVisible, checked } = this.state
    const { already_has_boxs=[], itemValue, parentKey } = this.props
    const { code, name, id } = itemValue

    return (
      <div className={`${EditCardDropStyle.card_set_item} ${bottVisible !== '1' ? (bottVisible === '2' ? EditCardDropStyle.showBott2 : EditCardDropStyle.hideBott2): EditCardDropStyle.hideinit}`}>
        <div className={EditCardDropStyle.card_set_item_top}>
          <div className={EditCardDropStyle.check}>
            <Checkbox checked={checked} onChange={this.CheckChange.bind(this, {id, parentKey})} />
          </div>
          <div className={EditCardDropStyle.name}>{name}</div>
          <div className={`${EditCardDropStyle.turn} ${bottVisible!=='1'?(bottVisible === '2'?EditCardDropStyle.upDown_up: EditCardDropStyle.upDown_down): ''}`}>
            <Icon type="down" onClick={this.setBottVisible.bind(this)} />
          </div>
        </div>
        <div className={`${EditCardDropStyle.card_set_item_bott} ${bottVisible !== '1' ? (bottVisible === '2' ? EditCardDropStyle.showBott : EditCardDropStyle.hideBott) : EditCardDropStyle.noDoc}`} >
          <CardContentNormal {...this.props} code={code}/>
        </div>
      </div>

    )
  }
}
