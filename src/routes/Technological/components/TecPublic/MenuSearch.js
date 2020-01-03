import React from 'react'
import MenuSearchStyles from './MenuSearch.less'
import { Icon, Input, Button, DatePicker, Menu } from 'antd'
import { processEditDatasConstant, processEditDatasRecordsConstant, processEditDatasItemOneConstant, processEditDatasRecordsItemOneConstant } from '../ProjectDetail/Process/constant'


export default class MenuSearch extends React.Component{
  state = {
    resultArr: [],
    keyWord: ''
  }
  state = {
    resultArr: [],
    keyWord: ''
  }
  componentWillMount() {
    const { keyWord } = this.state
    const { datas: { processList = [] } } = this.props.model
    this.setState({
      resultArr: this.fuzzyQuery(processList, keyWord)
    })
  }
  componentWillReceiveProps (nextProps) {
    const { keyWord } = this.state
    const { datas: { processList = [] } } = nextProps.model
    this.setState({
      resultArr: this.fuzzyQuery(processList, keyWord)
    })
  }
  //模糊查询
  fuzzyQuery = (list, keyWord) => {
    var arr = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].name.indexOf(keyWord) !== -1) {
        arr.push(list[i]);
      }
    }
    return arr;
  }
  onChange = (e) => {
    const { datas: { processList = [] } } = this.props.model
    const keyWord = e.target.value
    const resultArr = this.fuzzyQuery(processList, keyWord)
    this.setState({
      keyWord,
      resultArr
    })
  }

  menuClick = ({ item, key, selectedKeys }) => {
    if(key) {
      // this.props.getProcessInfo({id: key})
      // this.props.updateDatasProcess({currentProcessInstanceId: key})
      this.props.changeFlowIdToUrl({id: key, currentProcessInstanceId: key})
    }
  }
  addProcess = () => {
    this.props.updateDatasProcess({
      processInfo: {},
      processPageFlagStep: '1',
      node_type: '1', //节点类型
      processCurrentEditStep: 0, //编辑第几步，默认 0
      processEditDatas: JSON.parse(JSON.stringify(processEditDatasConstant)), //json数组，每添加一步编辑内容往里面put进去一个obj,刚开始默认含有一个里程碑的
      processEditDatasRecords: JSON.parse(JSON.stringify(processEditDatasRecordsConstant)) //每一步的每一个类型，记录，数组的全部数据step * type
    })
    this.props.updateDatasProcess({currentProcessInstanceId: ''})
  }
  render() {
    const {datas: { processList = [], currentProcessInstanceId}} = this.props.model
    const { keyWord, resultArr } = this.state

    return (
      <Menu style={{padding: 8}} onClick={this.menuClick.bind(this)} selectedKeys={[currentProcessInstanceId]}>
        <Input placeholder={'搜索流程'} value={keyWord} onChange={this.onChange.bind(this)}/>
        {
          resultArr.map((val, key) => {
            const { name, id } = val
            return (
              <Menu.Item style={{height: 32, lineHeight: '32px'}} key={id}>
                {name}
              </Menu.Item>
            )
          })
        }
        <div onClick={this.addProcess.bind(this)} style={{minWidth: 160, height: 32, borderTop: '1px solid #f2f2f2', lineHeight: '32px', cursor: 'pointer', margin: '0 auto', textAlign: 'center'}}>
          <Icon type={'plus'}/>
        </div>
      </Menu>
    )
  }

}

