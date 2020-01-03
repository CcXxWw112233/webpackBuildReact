import React from 'react'
// import MenuSearchStyles from './MenuSearch.less'
import { Icon, Input, Button, DatePicker, Menu, Spin } from 'antd'
import indexStyles from './menuseachNultiple.less'

// props => Inputlaceholder searchName listData  keyCode=>列表唯一标识字段，不能直接用map的key 。selectedKeys默认选中
// 父组件引用该子组件用法
//<UserSearchAndSelectMutiple
//  listData={users} //users为全部用户列表[{user_id: '', name: '',...}, ]
//  keyCode={'user_id'} //值关键字
//  searchName={'name'} //搜索关键字
//  currentSelect = {selectedUsers} //selectedUsers为已选择用户列表[{user_id: '', name: '',...}, ]
//  multipleSelectUserChange={() => this.multipleUserSelectUserChange()} //选择了某一项
// />

export default class AddMembersExecutor extends React.Component {
  state = {
    resultArr: [],
    keyWord: '',
    selectedKeys: []
  }
  componentWillMount() {
    const { keyWord } = this.state
    let selectedKeys = []
    const { listData = [], searchName, currentSelect = [] } = this.props
    for (let val of currentSelect) {
      selectedKeys.push(val['user_id'])
    }
    this.setState({
      selectedKeys
    }, () => {
      this.setState({
        resultArr: this.fuzzyQuery(listData, searchName, keyWord),
      })
    })
  }

  // // 比较两个数组user_id
  // comparePropsList = (nextList, currList) => {
  //   if (nextList.length !== currList.length) {
  //     return false;
  //   }
  //   const isFindAllNextListInCurrList = () =>
  //     nextList.every(item => currList.find(i => i.user_id === item.user_id));
  //   if (!isFindAllNextListInCurrList()) {
  //     return false;
  //   }
  //   return true;
  // };

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps, 'ssssss')
    const { currentSelect } = nextProps
    let new_currentSelect = [...currentSelect]
    let temp_id = []
    new_currentSelect.map(item => {
      temp_id.push(item['user_id'])
    })
    this.setState({
      selectedKeys: temp_id
    })
  }
  //选择
  handleMenuReallySelect = (e) => {
    this.setSelectKey(e, 'add')
  }
  //移除
  handleMenuReallyDeselect(e) {
    this.setSelectKey(e, 'remove')
  }
  setSelectKey(e, type) { //type add/remove
    const { key, selectedKeys } = e
    // console.log(key, selectedKeys, 'ssssss')
    if (!key) {
      return false
    }
    this.setState({
      selectedKeys
    }, () => {
      const { listData = [], searchName } = this.props
      const { keyWord } = this.state
      this.setState({
        resultArr: this.fuzzyQuery(listData, searchName, keyWord),
      })
    })
    // debugger
    this.props.multipleSelectUserChange && this.props.multipleSelectUserChange({ selectedKeys, key, type })
  }
  onCheck() {
    if (this.props.onCheck && typeof this.props.onCheck === 'function') {
      this.props.onCheck(this.state.selectedKeys)
    }
  }


  //模糊查询
  fuzzyQuery = (list, searchName, keyWord) => {
    var arr = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i][searchName].indexOf(keyWord) !== -1) {
        arr.push(list[i]);
      }
    }

    //添加任务执行人后往前插入
    const { selectedKeys } = this.state
    const { rela_type } = this.props
    for (let i = 0; i < arr.length; i++) {
      // 添加的思路
      // if (selectedKeys.indexOf(arr[i]['user_id']) != -1) { // 如果说user_id存在
      //   if (i > 0 && arr[i - 1]['user_id'] == '0') { //如果点击的时候, 前面是全部成员, 没有执行人
      //     // 就将它从第一个后面插入
      //     console.log('进来了', 'ssss_第一个if')
      //     const deItem = arr.splice(i, 1)
      //     arr.splice(1, 0, ...deItem)
      //   } else if (i > 0 && (arr[i - 1]['user_id'] == '1' || arr[i - 1]['user_id'] == '2' || arr[i - 1]['user_id'] == '3')) { // 表示前面是执行人,推进人,负责人
      //     // 如果说点击的的时候,前面是执行人或者推进人或者是负责人, 那么将它从第二个插入
      //     console.log('进来了', 'ssss_第二个if')
      //     const deItem = arr.splice(i, 1)
      //     arr.splice(2, 0, ...deItem)
      //   } else if (i > 0 && selectedKeys.indexOf(arr[i - 1]['user_id']) == -1) { // 表示的是其他选项
      //     // 如果说点击的是其他的时候，需要判断是否有推进人,执行人,负责人

      //   }
      // }
      // 不存在执行人,推送人以及负责人的情况下
      if (rela_type != '1' && rela_type != '2' && rela_type != '3' && rela_type != '5') {
        // console.log(selectedKeys, 'ssssss')
        if (selectedKeys.indexOf(arr[i]['user_id']) != -1) { // 如果说 user_id 存在
          if (i > 0 && selectedKeys.indexOf(arr[i - 1]['user_id']) == -1) { // 如果说点击的前一个元素不存在
            const deItem = arr.splice(i, 1)
            arr.splice(1, 0, ...deItem)
          }
        }
      }

      if (selectedKeys.indexOf(arr[i]['user_id']) != -1) { // 如果说 user_id 存在
        if (i > 0 && arr[i - 1]['user_id'] == '0') { //如果点击的时候, 前面是全部成员, 没有执行人
          // 就将它从第一个后面插入
          // console.log('进来了', 'ssss_第一个if')
          const deItem = arr.splice(i, 1)
          arr.splice(1, 0, ...deItem)
        } else if (i > 0 && (arr[i - 1]['user_id'] == '1' || arr[i - 1]['user_id'] == '2' || arr[i - 1]['user_id'] == '3')) { // 表示前面是执行人,推进人,负责人
          // 如果说点击的的时候,前面是执行人或者推进人或者是负责人, 那么将它从第二个插入
          // console.log('进来了', 'ssss_第二个if')
          const deItem = arr.splice(i, 1)
          arr.splice(2, 0, ...deItem)
        } else if (i > 0 && selectedKeys.indexOf(arr[i - 1]['user_id']) == -1) { // 表示的是其他选项
          // 如果说点击的是其他的时候，需要判断是否有推进人,执行人,负责人
          const deItem = arr.splice(i, 1)
          arr.splice(2, 0, ...deItem)
        }
      }

      // 原来的
      // if (selectedKeys.indexOf(arr[i]['user_id']) != -1) {
      //   if(i>0 && selectedKeys.indexOf(arr[i-1]['user_id']) == -1){
      //     const deItem = arr.splice(i, 1)
      //     arr.unshift(...deItem)
      //   }
      // }
    }
    return arr;
  }
  onChange = (e) => {
    const { listData = [], searchName } = this.props
    const keyWord = e.target.value
    const resultArr = this.fuzzyQuery(listData, searchName, keyWord)
    this.setState({
      keyWord,
      resultArr
    })
  }
  render() {
    const { keyWord, resultArr, selectedKeys = [] } = this.state
    const { Inputlaceholder = '搜索', keyCode } = this.props
    // console.log({selectedKeys}, 'sssss') // currentSelect listData
    return (
      <Menu style={{ padding: '8px 0px', boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.15)', maxWidth: 200, }}
        selectedKeys={selectedKeys}
        onDeselect={this.handleMenuReallyDeselect.bind(this)}
        onSelect={this.handleMenuReallySelect.bind(this)} multiple >
        <div style={{ margin: '0 10px 10px 10px' }}>
          <Input placeholder={Inputlaceholder} value={keyWord} onChange={this.onChange.bind(this)} />
        </div>

        {
          resultArr.map((value, key) => {
            const { avatar, name, user_name, user_id } = value
            return (
              <Menu.Item className={indexStyles.menuItem} style={{ height: 32, lineHeight: '32px', margin: 0, padding: '0 10px', }} key={value[keyCode]} >

                <div className={indexStyles.menuItemDiv}>
                  <div style={{ display: 'flex', alignItems: 'center' }} key={user_id}>
                    {avatar ? (
                      <img style={{ width: 20, height: 20, borderRadius: 20, marginRight: 4 }} src={avatar} />
                    ) : (
                        <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 4, }}>
                          {
                            user_id == '0' ? (
                              // <Icon type={'user'} style={{ fontSize: 12, marginLeft: 10, color: '#8c8c8c' }} />
                              <Icon type="usergroup-delete" style={{ fontSize: 12, marginLeft: 10, color: '#8c8c8c' }} />
                            ) : (
                                <Icon type={'user'} style={{ fontSize: 12, marginLeft: 10, color: '#8c8c8c' }} />
                              )
                          }
                        </div>
                      )}
                    <div style={{ overflow: 'hidden', verticalAlign: ' middle', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90, marginRight: 8 }}>{name || user_name || '佚名'}</div>
                  </div>
                  <div style={{ display: selectedKeys.indexOf(user_id) != -1 ? 'block' : 'none' }}>
                    <Icon type="check" />
                  </div>
                </div>
              </Menu.Item>
            )
          })
        }
      </Menu>
    )
  }

}

