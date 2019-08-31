import React from 'react'
import TagDropDownStyles from './TagDropDown.less'
import TagDropDownItem from './TagDropDownItem.js'
import globalStyles from '../../../../../../../../globalset/css/globalClassName.less'


export default class TagDropDown extends React.Component {

  state = {
    resultArr: [],

  }
  componentWillMount() {
    this.setResultArr(this.props)
  }
  componentWillReceiveProps (nextProps) {
    this.setResultArr(nextProps)
  }

  setResultArr(props) {
    const { datas: { boardTagList =[] } } = props.model
    const { searchName='name', tagInputValue='' } = props
    this.setState({
      resultArr: this.fuzzyQuery(boardTagList, searchName, tagInputValue)
    })
  }

  fuzzyQuery = (list, searchName, keyWord) => {
    var arr = [];
    for (var i = 0; i < list.length; i++) {
      if(searchName) {
        if (list[i][searchName].indexOf(keyWord) !== -1) {
          arr.push(list[i]);
        }
      }else {
        if (list[i].indexOf(keyWord) !== -1) {
          arr.push(list[i]);
        }
      }
    }
    return arr;
  }

  toAdd() {
    const { tagInputValue, } = this.props
    this.props.tagDropItemClick({name: tagInputValue})
  }
  render() {
    const { tagInputValue, } = this.props
    const { resultArr } = this.state
    return (
      <div className={TagDropDownStyles.outercontainer}>
        <div className={TagDropDownStyles.dropOut} >
          <div className={TagDropDownStyles.dropItem} style={{display: `${tagInputValue?'flex': 'none'}`}}>
            <div className={TagDropDownStyles.dropItem_left}>
              {tagInputValue}
            </div>
            <div className={TagDropDownStyles.dropItem_right}>
              <div className={globalStyles.authTheme} onClick={this.toAdd.bind(this)}>&#xe70b;</div>
            </div>
          </div>

          {resultArr.map((value, key) => {
            return (
              <TagDropDownItem {...this.props} key={key} itemKey={key} itemValue={value} />
            )
          })}
        </div>
      </div>

    )
  }

}
