import React from 'react'
import { Input, Menu, Tooltip, Icon, Button, Popconfirm } from 'antd'
import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'

export default class LabelDataComponent extends React.Component {
  state = {
    // visible: false, // 控制下拉列表是否显示
    is_add_label: false, // 是否新建标签, 默认为 false, 不显示
    labelColorArr: [
      // 默认的标签颜色列表
      { label_color: '255,163,158' },
      { label_color: '255,213,145' },
      { label_color: '145,213,255' },
      { label_color: '211,173,247' },
      { label_color: '183,235,143' },
      { label_color: '255,65,65' },
      { label_color: '255,134,55' },
      { label_color: '62,130,255' },
      { label_color: '144,95,255' },
      { label_color: '100,161,108' }
    ]
  }

  // 初始化数据
  initSet = props => {
    const { keyWord } = this.state
    let selectedKeys = []
    const { listData = [], searchName, currentSelect = [] } = props
    if (!Array.isArray(currentSelect)) return false
    for (let val of currentSelect) {
      selectedKeys.push(val['label_id'])
    }
    this.setState(
      {
        selectedKeys
      },
      () => {
        this.setState({
          resultArr: this.fuzzyQuery(listData, searchName, keyWord)
        })
      }
    )
  }
  componentDidMount() {
    this.initSet(this.props)
  }
  componentWillReceiveProps(nextProps) {
    this.initSet(nextProps)
  }
  // 选中的回调
  handleMenuReallySelect = e => {
    this.setSelectKey(e, 'add')
  }

  // 取消选中的回调
  handleMenuReallyDeselect = e => {
    this.setSelectKey(e, 'remove')
  }

  setSelectKey(e, type) {
    const { key, selectedKeys } = e
    if (!key) {
      return false
    }
    this.setState(
      {
        selectedKeys
      },
      () => {
        const { listData = [], searchName } = this.props
        const { keyWord } = this.state
        this.setState({
          resultArr: this.fuzzyQuery(listData, searchName, keyWord)
        })
      }
    )
    this.props.handleChgSelectedLabel &&
      this.props.handleChgSelectedLabel({ selectedKeys, key, type })
  }

  // 模糊查询
  fuzzyQuery = (list, searchName, keyWord) => {
    let arr = []
    if (!!keyWord) {
      arr = list.filter(
        (item, index) => list[index][searchName].indexOf(keyWord) !== -1
      )
    } else {
      arr = list
    }
    // for (var i = 0; i < list.length; i++) {
    //   if (list[i][searchName].indexOf(keyWord) !== -1) {
    //     arr.push(list[i]);
    //   }
    // }
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

  // 搜索框chg事件
  onChange = e => {
    e && e.stopPropagation()
    const { listData = [], searchName } = this.props
    const keyWord = e.target.value
    const resultArr = this.fuzzyQuery(listData, searchName, keyWord)
    this.setState({
      keyWord,
      resultArr
    })
  }

  // 更新state中的数据
  updateStateDatas = () => {
    this.setState({
      is_add_label: false,
      labelColorArr: [
        // 默认的标签颜色列表
        { label_color: '255,163,158' },
        { label_color: '255,213,145' },
        { label_color: '145,213,255' },
        { label_color: '211,173,247' },
        { label_color: '183,235,143' },
        { label_color: '255,65,65' },
        { label_color: '255,134,55' },
        { label_color: '62,130,255' },
        { label_color: '144,95,255' },
        { label_color: '100,161,108' }
      ],
      inputValue: '',
      is_edit_label: false
    })
  }

  // 返回 事件, 需要清空默认数据
  handleBack = () => {
    this.updateStateDatas()
  }

  // 关闭回调
  handleClose = e => {
    // 延时清空数据
    setTimeout(() => {
      this.updateStateDatas()
    }, 500)
    this.props.handleClose && this.props.handleClose()
  }

  // 点击确定
  handleAddBoardTag = () => {
    const { inputValue, labelColorArr = [] } = this.state
    let tempItem = labelColorArr.find(item => item.is_selected_label == true)
    if (!tempItem) return false
    const color = tempItem.label_color
    this.props.handleAddBoardTag &&
      this.props.handleAddBoardTag({ name: inputValue, color: color })
    this.updateStateDatas()
  }

  // 更新标签
  handleUpdateBoardTag = e => {
    e && e.stopPropagation()
    const { inputValue, labelColorArr = [], selectedId } = this.state
    let tempItem = labelColorArr.find(item => item.is_selected_label == true)
    if (!tempItem) return false
    const color = tempItem.label_color
    this.props.handleUpdateBoardTag &&
      this.props.handleUpdateBoardTag({
        name: inputValue,
        color,
        label_id: selectedId
      })
    this.updateStateDatas()
  }

  // 删除标签
  handleRemoveBoardTag = e => {
    e && e.stopPropagation()
    const { selectedId } = this.state
    this.props.handleRemoveBoardTag &&
      this.props.handleRemoveBoardTag({ label_id: selectedId })
    this.updateStateDatas()
  }

  // 新建标签回调
  handleAddLabel = e => {
    e && e.stopPropagation()
    this.setState({
      is_add_label: true,
      is_edit_label: false
    })
  }

  /**
   * 标签的点击事件
   * @param {String} selectedColor 当前点击的对象选中的颜色
   */
  handleLabelCheck(selectedColor, e) {
    // console.log(e, 'ssssss')
    e && e.stopPropagation()
    const { labelColorArr = [] } = this.state
    let new_labelColorArr = [...labelColorArr]
    new_labelColorArr = new_labelColorArr.map(item => {
      if (item.label_color == selectedColor) {
        // 找到当前的点击对象
        if (item.is_selected_label) {
          // 如果已经点击了,那么再次点击则是取消
          let new_item = item
          new_item = { ...item, is_selected_label: false }
          return new_item
        } else {
          // 否则表示选择该标签
          let new_item = item
          new_item = { ...item, is_selected_label: true }
          return new_item
        }
      } else {
        // 排他处理
        let new_item = item
        new_item = { ...item, is_selected_label: false }
        return new_item
      }
    })
    this.setState({
      labelColorArr: new_labelColorArr,
      selectedColor: selectedColor
    })
  }

  // 编辑标签的回调
  handleEditLabel = (e, value) => {
    e && e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    const { name, color, id } = value
    this.handleLabelCheck(color)

    this.setState({
      is_add_label: true,
      is_edit_label: true,
      inputValue: name,
      selectedId: id
    })
  }

  // 输入框的chg事件
  handleChgValue = e => {
    e && e.stopPropagation()
    let val = e.target.value
    this.setState({
      inputValue: val
    })
  }

  // 默认的menu
  randerNormalMenu = () => {
    const { Inputlaceholder = '搜索' } = this.props
    const {
      selectedKeys = [],
      keyWord,
      boardTagList = [],
      resultArr = []
    } = this.state
    return (
      <div>
        <Menu
          getPopupContainer={triggerNode => triggerNode.parentNode}
          style={{
            padding: '8px 0px',
            boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.15)'
          }}
          selectedKeys={selectedKeys}
          onDeselect={this.handleMenuReallyDeselect.bind(this)}
          onSelect={this.handleMenuReallySelect.bind(this)}
          multiple={true}
        >
          <div
            style={{
              padding: '12px',
              paddingTop: '6px',
              boxSizing: 'border-box',
              borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <Input
              placeholder={Inputlaceholder}
              value={keyWord}
              onChange={this.onChange.bind(this)}
              autoFocus={true}
            />
          </div>
          <Menu
            className={globalStyles.global_vertical_scrollbar}
            style={{
              maxHeight: '248px',
              overflowY: 'auto',
              borderRight: 'none'
            }}
          >
            <Menu key="addLabel">
              <div
                style={{
                  padding: 0,
                  margin: 0,
                  height: '40px',
                  lineHeight: '40px',
                  cursor: 'pointer'
                }}
                onClick={this.handleAddLabel}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 20,
                      marginRight: 4,
                      color: 'rgb(73, 155, 230)'
                    }}
                  >
                    <Icon
                      type={'plus-circle'}
                      style={{
                        fontSize: 12,
                        marginLeft: 10,
                        color: 'rgb(73, 155, 230)'
                      }}
                    />
                  </div>
                  <span style={{ color: 'rgb(73, 155, 230)' }}>新建标签</span>
                </div>
              </div>
            </Menu>
            {resultArr &&
              resultArr.length &&
              resultArr.map(value => {
                const { id, name, color } = value
                return (
                  <Menu.Item key={id}>
                    <div className={indexStyles.label_item}>
                      <Tooltip title={name} placement="top">
                        <span
                          style={{ background: `rgba(${color}, 1)` }}
                          className={`${indexStyles.label_name}`}
                        >
                          {name}
                        </span>
                      </Tooltip>
                      <span>
                        <span
                          onClick={e => {
                            this.handleEditLabel(e, value)
                          }}
                          className={`${globalStyles.authTheme} ${indexStyles.edit_icon}`}
                        >
                          &#xe791;
                        </span>
                        <span
                          style={{
                            display:
                              selectedKeys.indexOf(id) != -1
                                ? 'inline-block'
                                : 'none'
                          }}
                        >
                          <Icon type="check" />
                        </span>
                      </span>
                    </div>
                  </Menu.Item>
                )
              })}
          </Menu>
        </Menu>
      </div>
    )
  }

  // 新建标签的menu
  randerAddLabelsMenu = () => {
    const {
      inputValue,
      labelColorArr = [],
      is_edit_label,
      selectedColor
    } = this.state
    const is_selected_label =
      labelColorArr &&
      labelColorArr.length &&
      labelColorArr.find(item => item.is_selected_label == true) &&
      inputValue &&
      inputValue != ''

    return (
      <div style={{ position: 'relative', maxWidth: '248px' }}>
        <Menu
          getPopupContainer={triggerNode => triggerNode.parentNode}
          style={{
            padding: '8px 0px',
            boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.15)',
            width: '248px'
          }}
          // selectedKeys={[selectedValue]}
          // onClick={this.handleMenuClick}
          multiple={false}
        >
          <div
            style={{
              display: 'flex',
              padding: '12px 16px',
              alignItems: 'center',
              marginBottom: '12px'
            }}
          >
            <span
              onClick={this.handleBack}
              className={`${globalStyles.authTheme} ${indexStyles.back_icon}`}
            >
              &#xe7ec;
            </span>
            <span className={indexStyles.label_title}>
              {is_edit_label ? '编辑标签' : '新建标签'}
            </span>
            <span
              onClick={this.handleClose}
              className={`${globalStyles.authTheme} ${indexStyles.close_icon}`}
            >
              &#xe7fe;
            </span>
          </div>

          <Menu
            style={{
              minHeight: '134px',
              borderTop: '1px solid rgba(0,0,0,0.09)',
              borderBottom: '1px solid rgba(0,0,0,0.09)',
              padding: '12px 24px'
            }}
          >
            <div className={indexStyles.input}>
              <input
                placeholder="标签名称"
                value={inputValue}
                onChange={this.handleChgValue}
                maxLength={30}
                autoFocus={true}
              />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'space-between'
              }}
            >
              {labelColorArr.map(item => {
                const { label_color } = item
                return (
                  <span
                    onClick={e => {
                      this.handleLabelCheck(label_color, e)
                    }}
                    key={label_color}
                    className={indexStyles.circle}
                    style={{ background: `rgba(${label_color},1)` }}
                  >
                    <span
                      style={{
                        display: item.is_selected_label ? 'block' : 'none'
                      }}
                      className={`${globalStyles.authTheme} ${indexStyles.check_icon}`}
                    >
                      &#xe7fc;
                    </span>
                  </span>
                )
              })}
            </div>
          </Menu>
          <Menu>
            {is_edit_label ? (
              <div
                style={{
                  textAlign: 'center',
                  height: '58px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-around'
                }}
              >
                <Popconfirm
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  onConfirm={this.handleRemoveBoardTag}
                  title={'确认在所有事项中删除该标签吗?'}
                >
                  <Button
                    style={{
                      border: `1px solid rgba(255,120,117,1)`,
                      color: '#FF7875',
                      width: '106px'
                    }}
                  >
                    删除
                  </Button>
                </Popconfirm>
                <Button
                  style={{ width: '106px' }}
                  disabled={is_selected_label ? false : true}
                  onClick={this.handleUpdateBoardTag}
                  type="primary"
                >
                  确认
                </Button>
              </div>
            ) : (
              <div
                style={{ textAlign: 'center', height: '58px', padding: '12px' }}
              >
                <Button
                  disabled={is_selected_label ? false : true}
                  onClick={this.handleAddBoardTag}
                  style={{ width: '100%' }}
                  type="primary"
                >
                  确认
                </Button>
              </div>
            )}
          </Menu>
        </Menu>
      </div>
    )
  }

  render() {
    const { children } = this.props
    const { is_add_label, visible } = this.state

    return (
      <div style={{ position: 'relative' }}>
        {is_add_label ? this.randerAddLabelsMenu() : this.randerNormalMenu()}
      </div>
      // <div style={{ position: 'relative' }}
      //   // onClick={this.handleVisibleChange}
      // >

      //   <Dropdown
      //     visible={visible}
      //     trigger={['click']}
      //     getPopupContainer={triggerNode => triggerNode.parentNode}
      //     overlayClassName={indexStyles.labelDataWrapper}
      //     overlay={is_add_label ? this.randerAddLabelsMenu() : this.randerNormalMenu()}
      //     onVisibleChange={(visible) => { this.handleVisibleChange(visible) }}
      //   >
      //     <div>
      //       {children}
      //     </div>
      //   </Dropdown>
      // </div>
    )
  }
}

LabelDataComponent.defaultProps = {
  board_id: '', // 当前的项目ID
  searchName: '', // 当前需要搜索的名字
  currentSelect: [], // 当前的选择对象
  listData: [], // 当前列表数据
  handleAddBoardTag: function() {}, // 添加项目标签的回调
  handleUpdateBoardTag: function() {}, // 更新项目标签的回调
  handleRemoveBoardTag: function() {}, // 移除项目标签的回调
  handleChgSelectedLabel: function() {}, // 暴露的下拉选择的回调
  handleClose: function() {} // 关闭回调
}
