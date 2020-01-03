
import React from 'react'
import { Mention } from 'antd'
const { toString, toContentState, Nav } = Mention;

export default class MentionAssignees extends React.Component {
  state = {
    select: 1
  }
  mentionOnChange(contentState) {
    const str = toString(contentState)
    const { users = [] } = this.props
    //将选择的名称转化成id
    // let strNew = str.replace(/\s@/gim, ',').replace(/\s*/gim, '').replace(/@/, ',')
    let strNew = str.replace(/\s@/gim, ',').replace(/@/, ',').trim()

    let strNewArray = strNew.split(',')
    for (let i = 0; i < strNewArray.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (strNewArray[i] === users[j]['name']) {
          strNewArray[i] = users[j]['user_id']
          break
        }
      }
    }
    strNew = strNewArray.length ? `${strNewArray.join(',').replace(/,/gim, ' @')}` : ''
    this.props.mentionOnChange(toContentState(strNew))

    // this.props.mentionOnChange(contentState)

  }
  render() {
    const { defaultAssignees, suggestions } = this.props
    const { users = [] } = this.props

    let suggestionsNew = new Array(users.length - 1)
    for (let i = 0; i < users.length; i++) {
      suggestionsNew[i] = <Nav children={users[i].name} value={users[i].name} />
    }

    //解析从父组件传过来的 ‘@123 @234’格式的数据， @后面跟的是id。 转化数组，遍历得到id的名字，填入mention
    let defaultAssigneesNew = defaultAssignees.replace(/\s@/gim, ',').replace(/\s*/gim, '')
    let defaultAssigneesNewArray = defaultAssigneesNew.split(',')
    for (let i = 0; i < defaultAssigneesNewArray.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (defaultAssigneesNewArray[i] === users[j]['user_id']) {
          defaultAssigneesNewArray[i] = users[j]['name']
          break
        }
      }
    }
    defaultAssigneesNew = defaultAssigneesNewArray.length ? `${defaultAssigneesNewArray.join(',').replace(/,/gim, ' @')}` : ''

    return (
      <div>
        <Mention
          placeholder={'输入“@”选择'}
          style={{ width: '100%', height: 70 }}
          onChange={this.mentionOnChange.bind(this)}
          // defaultValue={toContentState(defaultAssignees)}
          suggestions={suggestions}
          defaultValue={toContentState(defaultAssigneesNew)}
        // suggestions={suggestionsNew}
        />
      </div>
    )

  }
}
