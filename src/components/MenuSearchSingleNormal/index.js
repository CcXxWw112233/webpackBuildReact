import React from 'react'
// import MenuSearchStyles from './MenuSearch.less'
import { Icon, Input, Button, DatePicker, Menu, Spin } from 'antd'

// props => Inputlaceholder searchName listData MenuSearchSingleClick
export default class MenuSearchSingleNormal extends React.Component{
   state = {
     resultArr: [],
     keyWord: '',
   }
  componentWillMount() {
    const { keyWord } = this.state
    const { listData, searchName } = this.props
    this.setState({
      resultArr: this.fuzzyQuery(listData, searchName, keyWord)
    })
  }
  componentWillReceiveProps (nextProps) {
    const { keyWord } = this.state
    const { listData, searchName } = nextProps
    this.setState({
      resultArr: this.fuzzyQuery(listData, searchName, keyWord)
    })
  }
  //模糊查询
  handleMenuReallyClick = (e) => {
    const { key } = e
    if(!key) {
      return false
    }
    const { listData} = this.props
    const data = listData[Number(key)]
    //此处为启动流程界面查询逻辑(查询模板信息)
    if(this.props.MenuSearchSingleClick && typeof this.props.MenuSearchSingleClick === 'function'){
      this.props.MenuSearchSingleClick(data)
    }
  }
  fuzzyQuery = (list, searchName, keyWord) => {
    var arr = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i][searchName].indexOf(keyWord) !== -1) {
        arr.push(list[i]);
      }
    }
    return arr;
  }
  onChange = (e) => {
    const { listData, searchName } = this.props
    const keyWord = e.target.value
    const resultArr = this.fuzzyQuery(listData, searchName, keyWord)
    this.setState({
      keyWord,
      resultArr
    })
  }
  render(){
    const { keyWord, resultArr } = this.state
    const { Inputlaceholder='搜索', searchName, menuSearchSingleSpinning } = this.props

    return (
      <Spin spinning={menuSearchSingleSpinning} size={'small'}>
        <Menu style={{padding: 8}} onClick={this.handleMenuReallyClick.bind(this)}>
        <Input placeholder={Inputlaceholder} value={keyWord} onChange={this.onChange.bind(this)} style={{marginBottom: 10}}/>
        {
          resultArr.map((value, key) => {
            const { template_name, template_id, template_no } = value
            return (
              <Menu.Item style={{height: 32, lineHeight: '32px'}} key={key} >
                {value[searchName]}
              </Menu.Item>
            )
          })
        }
      </Menu>
      </Spin>
  )
  }

}


