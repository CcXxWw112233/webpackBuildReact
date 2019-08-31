import React from 'react'
import EditCardDropStyle from './index.less'
import { Icon, Menu, Dropdown, Tooltip, Card, Input, Checkbox } from 'antd'
import CardContentNormal from './CardContentNormal'

export default class EditCardDropItem extends React.Component {
  state ={
    bottVisible: '1', //1默认 2展开 3关闭
    checked: false,
    disabled: false,
  }

  componentWillMount(){ // 进来之后设置选中
    const { itemValue, visibleEdit } = this.props
    const { isSelect } =itemValue
    this.setState({
      checked: isSelect,
    })
    const { bottVisible } = this.state
    if(visibleEdit && bottVisible === '3') {
      this.setState({
        bottVisible: '1'
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    const { itemValue, visibleEdit } = nextProps
    const { isSelect } =itemValue
    this.setState({
      checked: isSelect
    })
    const { bottVisible } = this.state
    if(visibleEdit && bottVisible === '3') {
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

  CheckChange({id, itemKey}, e) {
    const checked = e.target.checked
    const { datas: { boxUsableList = [] } } = this.props.model
    this.setState({
      checked,
      disabled: true
    }, () => {
      //请求之前全部禁用
      this.props.updateDatas({
        boxCheckDisabled: true,
      })
      const newChecked = this.state.checked
      const calback = ()=> {
        // this.setState({
        //   disabled: false
        // })
        this.props.updateDatas({
          boxCheckDisabled: false
        })
      }
      if(newChecked) { //添加选中
        this.props.addBox({box_type_ids: id, itemKey, calback })
      }else { //取消选择
        this.props.deleteBox({box_type_id: id, itemKey, calback })
      }
    })
  }

  render() {
    const { bottVisible, checked, disabled } = this.state
    const { datas: { boxCheckDisabled = false }} = this.props.model

    const { itemValue, itemKey } = this.props
    const { name, isSelect, code, id } =itemValue

    return (
      <div className={`${EditCardDropStyle.card_set_item} ${bottVisible !== '1' ? (bottVisible === '2' ? EditCardDropStyle.showBott2 : EditCardDropStyle.hideBott2): EditCardDropStyle.hideinit}`}>
        <div className={EditCardDropStyle.card_set_item_top}>
          <div className={EditCardDropStyle.check}>
            <Checkbox disabled={boxCheckDisabled} checked={checked} onChange={this.CheckChange.bind(this, {id, itemKey})} />
          </div>
          <div className={EditCardDropStyle.name}>{name}</div>
          <div className={`${EditCardDropStyle.turn} ${bottVisible!=='1'?(bottVisible === '2'?EditCardDropStyle.upDown_up: EditCardDropStyle.upDown_down): ''}`}>
            <Icon type="down" onClick={this.setBottVisible.bind(this)} />
          </div>
        </div>
        <div className={`${EditCardDropStyle.card_set_item_bott} ${bottVisible !== '1' ? (bottVisible === '2' ? EditCardDropStyle.showBott : EditCardDropStyle.hideBott) : EditCardDropStyle.noDoc}`} >
          <CardContentNormal {...this.props} />
        </div>
      </div>

    )
  }
}
