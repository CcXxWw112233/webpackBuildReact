import React from 'react'
import { Dropdown, Input, Icon, Cascader } from 'antd'
import { getRelationsSelectionSub, getRelationsSelectionPre } from '../../services/technological/task'

//需要传入的props
// link_id 关联者Id (任务Id，流程Id，流程某一步Id，文件Id。。。)
//link_local 关联者位置 （3任务 2流程 21单个流程 22模板单个流程 4文件）
// setIsInEditContentRelation(bool) 选择之后的回调
//board_id  当前查看项目的项目id
export default class RaletionDrop extends React.Component {
  state = {
    popupVisible: true,
    options: [],
    selected: []
  }

  componentWillMount() {
    const { relations_Prefix = [] } = this.props
    let options = []
    for (let val of relations_Prefix) {
      const obj = {
        value: val, //['board_id'],
        label: val['board_name'],
        isLeaf: false,
      }
      const children = []
      options.push(obj)
    }
    this.setState({
      options
    })
  }

  loadData = (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    const length = selectedOptions.length
    const that = this

    if (length == 1) {
      this.getRelationsSelectionPre({
        board_id: targetOption.value.board_id
      }, { target: targetOption })
    } else if (length == 2) {
      setTimeout(function () {
        const { selected } = that.state
        that.getRelationsSelectionSub({
          board_id: selected[0]['board_id'],
          app_key: selected[1]['app_key']
        }, { target: targetOption })
      }, 200)
    } else {
      setTimeout(function () {
        const { selected } = that.state
        that.getRelationsSelectionSub({
          board_id: selected[0]['board_id'],
          app_key: selected[1]['app_key'],
          parent_id: selected[selected.length - 1]['parent_id']
        }, { target: targetOption })
      }, 200)
    }

  }

  async getRelationsSelectionPre(data, { target }) {
    target.loading = true;
    const res = await getRelationsSelectionPre(data)
    target.loading = false;

    if (res.code == '0') {
      const children = []
      for (let val of res.data) {
        const obj = {
          label: val['app_name'],
          value: val, //['app_key'],
          isLeaf: false,
        }
        children.push(obj)
      }
      target.children = children
      this.setState({
        options: [...this.state.options],
      });
      // debugger
    } else {

    }
  }

  async getRelationsSelectionSub(data, { target }) {
    target.loading = true;
    const res = await getRelationsSelectionSub(data)
    target.loading = false;

    if (res.code == '0') {
      const children = []
      for (let val of res.data.parent_data) {
        const obj = {
          label: val['parent_name'],
          value: val, //val['parent_id'],
          isLeaf: false,
        }
        children.push(obj)
      }
      for (let val of res.data.content_data) {
        const obj = {
          label: val['content_name'],
          value: val, //val['content_id'],
        }
        children.push(obj)
      }

      target.children = children
      this.setState({
        options: [...this.state.options],
      });
    } else {

    }
  }

  onChange(value) {
    this.setState({
      selected: value || []
    })
  }

  onPopupVisibleChange = (bool) => {
    const that = this
    const { link_id, link_local, board_id } = this.props

    setTimeout(function () {
      const { selected } = that.state
      const selectedLength = selected.length

      if (!bool) {
        if (typeof selected != 'object' || !selectedLength) {
          that.props.setIsInEditContentRelation && that.props.setIsInEditContentRelation(bool)
          return false
        }

        const selectedLast = selected[selected.length - 1]
        const linked_board_id = selected[0]['board_id']
        const linked_app_key = selected[1] && selected[1]['app_key']
        let content_type = ''
        let parent_content_id = ''
        let parent_or_content_id = ''
        let linked_name = ''

        let obj = {
          link_id,
          link_local,
          board_id,
          linked_board_id
        }

        if (typeof selectedLast == 'object') {
          parent_or_content_id = selectedLast['content_id'] ? 'linked_content_id' : 'linked_parent_id'
          parent_content_id = selectedLast['content_id'] || selectedLast['parent_id']
          linked_name = selectedLast['content_name'] || selectedLast['parent_name']
        } else {
          parent_or_content_id = 'linked_parent_id'
        }

        if (selectedLength == 1) {
          obj.linked_name = selected[0]['board_name']
        } else if (selectedLength == 2) {
          obj.linked_name = `${selected[0]['board_name']}~${selected[1]['app_name']}`
          obj.linked_app_key = linked_app_key
        } else {
          obj = {
            link_id,
            link_local,
            board_id,
            linked_app_key,
            linked_board_id,
            [parent_or_content_id]: parent_content_id,
            linked_name,
          }
          // debugger
        }
        that.props.setIsInEditContentRelation && that.props.setIsInEditContentRelation(bool)
        that.props.addRelation && that.props.addRelation({ ...obj })
        // debugger
      }
    }, 200)

  }

  render() {
    const {
      popupVisible,
      options,
    } = this.state

    return (
      <div>
        <Cascader options={options}
          onChange={this.onChange.bind(this)}
          loadData={this.loadData.bind(this)}
          autoFocus
          popupVisible={popupVisible}
          changeOnSelect
          style={{ width: 300 }}
          placeholder={'请选择'}
          onPopupVisibleChange={this.onPopupVisibleChange.bind(this)}
        />
      </div>
    )
  }
}
