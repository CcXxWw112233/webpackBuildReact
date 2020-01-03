import React from 'react'
// import MenuSearchStyles from './MenuSearch.less'
import { Icon, Input, Button, DatePicker, Menu, Spin, } from 'antd'
import indexStyles from './index.less'

// props => Inputlaceholder searchName listData  keyCode=>列表唯一标识字段，不能直接用map的key 。selectedKeys默认选中
//父组件设置方法， Dropdown visible设置为dropDonwVisible
// onVisibleChange(e,a){
//   this.setState({
//     dropDonwVisible: e
//   })
// }
export default class MenuSearchMultiple extends React.Component{
   state = {
     resultArr: [],
     keyWord: '',
     selectedKeys: [],
     isCanSelectAll: true
   }
  componentWillMount() {
    const { keyWord } = this.state
    const { listData, searchName, selectedKeys = [] } = this.props
    this.setState({
      resultArr: this.fuzzyQuery(listData, searchName, keyWord),
      selectedKeys
    })
  }
  componentWillReceiveProps (nextProps) {
    // const { keyWord } = this.state
    // const { listData,searchName } = nextProps
    // this.setState({
    //   resultArr: this.fuzzyQuery(listData, searchName, keyWord)
    // })
  }
  //模糊查询
  handleMenuReallySelect = (e) => {
    this.setSelectKey(e)
  }
  handleMenuReallyDeselect(e) {
    this.setSelectKey(e)
  }
  setSelectKey(e) {
    const { key, selectedKeys } = e
    if(!key) {
      return false
    }
    this.setState({
      selectedKeys
    })
  }
  onCheck() {
     if(this.props.onCheck && typeof this.props.onCheck === 'function' ) {
       this.props.onCheck(this.state.selectedKeys)
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
  selectAll(type) {
    const { isCanSelectAll } = this.state
    if(isCanSelectAll) {
      const { resultArr = []} = this.state
      const { keyCode } = this.props
      const selectedKeys = []
      for(let i = 0; i < resultArr.length; i++) {
        selectedKeys.push(resultArr[i][keyCode])
      }
      this.setState({
        selectedKeys: selectedKeys
      })
    } else {
      this.setState({
        selectedKeys: []
      })
    }

    this.setState({
      isCanSelectAll: !isCanSelectAll
    })
  }
  render(){
    const { keyWord, resultArr, selectedKeys=[], isCanSelectAll } = this.state
    const { Inputlaceholder='搜索', searchName, menuSearchSingleSpinning, keyCode } = this.props

    return (
      <Spin spinning={menuSearchSingleSpinning} size={'small'}>
        <Menu style={{padding: 8}}
              selectedKeys={selectedKeys}
              onDeselect={this.handleMenuReallyDeselect.bind(this)}
              onSelect={this.handleMenuReallySelect.bind(this)} multiple >

        <Input placeholder={Inputlaceholder} value={keyWord} onChange={this.onChange.bind(this)} style={{marginBottom: 10}}/>
        {
          resultArr.map((value, key) => {
            return (
              <Menu.Item style={{height: 32, lineHeight: '32px'}} key={value[keyCode]} >
                {value[searchName]}
              </Menu.Item>
            )
          })
        }

          {/*<div className={indexStyles.checkOk} onClick={this.onCheck.bind(this)}>确定</div>*/}

          <div className={indexStyles.checkOk} >
            <Button size={'small'} onClick={this.selectAll.bind(this)} >
              {isCanSelectAll?'全选':'取消全选'}
            </Button>
            <Button type={'primary'} onClick={this.onCheck.bind(this)} size={'small'} style={{marginLeft: 16}}>
              确定
            </Button>
          </div>
      </Menu>
      </Spin>
  )
  }

}


