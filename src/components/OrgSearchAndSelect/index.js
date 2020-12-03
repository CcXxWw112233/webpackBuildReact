import React from 'react'
// import MenuSearchStyles from './MenuSearch.less'
import { Icon, Input, Button, DatePicker, Menu, Spin } from 'antd'
import indexStyles from './menuseachNultiple.less'
import { connect } from 'dva'
// props => Inputlaceholder searchName currentUserOrganizes  keyCode=>列表唯一标识字段，不能直接用map的key 。selectedKeys默认选中
// 父组件引用该子组件用法
//<OrgSearchAndSelect
//  currentUserOrganizes={users} //users为全部用户列表[{id: '', name: '',...}, ]
//  keyCode={'id'} //值关键字
//  searchName={'name'} //搜索关键字
//  orgSelectedChange={() => this.orgSelectedChange()} //选择了某一项
// />
@connect(({ technological: { datas: { currentUserOrganizes = [] } } }) => ({
  currentUserOrganizes
}))
export default class OrgSearchAndSelect extends React.Component {
  state = {
    resultArr: [],
    keyWord: '',
    selectedKeys: []
  }
  componentWillMount() {
    const { keyWord } = this.state
    let selectedKeys = []
    const { currentUserOrganizes = [], searchName } = this.props
    this.setState({
      resultArr: this.fuzzyQuery(currentUserOrganizes, searchName, keyWord)
    })
  }

  //选择
  handleMenuReallySelect = e => {
    this.setSelectKey(e)
  }

  setSelectKey = (e, type) => {
    //type add/remove
    const { key, selectedKeys } = e
    const { currentUserOrganizes } = this.props
    if (!key) {
      return false
    }
    this.setState({
      selectedKeys
    })
    const org_name = (currentUserOrganizes.find(item => item.id == key) || {})
      .name
    this.props.orgSelectedChange &&
      this.props.orgSelectedChange({ org_id: key, org_name })
  }

  //模糊查询
  fuzzyQuery = (list, searchName, keyWord) => {
    var arr = []
    for (var i = 0; i < list.length; i++) {
      if (list[i][searchName].indexOf(keyWord) !== -1) {
        arr.push(list[i])
      }
    }

    //添加任务执行人后往前插入
    const { selectedKeys } = this.state
    for (let i = 0; i < arr.length; i++) {
      if (selectedKeys.indexOf(arr[i]['id']) != -1) {
        if (i > 0 && selectedKeys.indexOf(arr[i - 1]['id']) == -1) {
          const deItem = arr.splice(i, 1)
          arr.unshift(...deItem)
        }
      }
    }
    return arr
  }
  onChange = e => {
    const { currentUserOrganizes = [], searchName } = this.props
    const keyWord = e.target.value
    const resultArr = this.fuzzyQuery(currentUserOrganizes, searchName, keyWord)
    this.setState({
      keyWord,
      resultArr
    })
  }
  render() {
    const { keyWord, resultArr, selectedKeys = [] } = this.state
    const { Inputlaceholder = '搜索', keyCode } = this.props

    return (
      <Menu
        style={{
          padding: '8px 0px',
          boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.15)',
          maxWidth: 200
        }}
        selectedKeys={selectedKeys}
        onSelect={e => this.handleMenuReallySelect(e)}
      >
        <div style={{ margin: '0 10px 10px 10px' }}>
          <Input
            placeholder={Inputlaceholder}
            value={keyWord}
            onChange={this.onChange.bind(this)}
          />
        </div>

        {resultArr.map(value => {
          const { name, id } = value
          return (
            <Menu.Item
              className={indexStyles.menuItem}
              style={{
                height: 32,
                lineHeight: '32px',
                margin: 0,
                padding: '0 10px'
              }}
              key={id}
            >
              {name}
            </Menu.Item>
          )
        })}
      </Menu>
    )
  }
}

OrgSearchAndSelect.defaultProps = {
  keyCode: 'id', //值关键字
  searchName: 'name' //搜索关键字
}
