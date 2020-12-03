import React, { Component } from 'react'
import { connect } from 'dva'
import { Input, Breadcrumb, Icon } from 'antd'
import styles from './CommunicationFirstScreenHeader.less'
import { currentNounPlanFilterName } from '../../../../../../../utils/businessFunction'
import { PROJECTS } from '../../../../../../../globalset/js/constant'
// import { setTimeout } from 'core-js';

const { Search } = Input
const BreadcrumbItem = Breadcrumb.Item
// @connect(mapStateToProps)
// @connect()

export default class CommunicationFirstScreenHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searchValue: '' // 搜索框输入值
    }
  }

  // 分割符
  showSeparator = () => <Icon type="caret-right" />

  // 改变面包屑路径
  chooseBreadItem = item => {
    this.props.setBreadPaths && this.props.setBreadPaths({ path_item: item })
  }

  // 获取焦点时触发
  selectOnblur = () => {}

  // onChange
  inputOnChange = e => {
    // console.log('value', e.target.value);
    const currentValue = e.target.value
    const isShow = currentValue !== '' ? true : false
    this.props.isShowSearchOperationDetail(isShow, currentValue)
  }

  // 获取input search焦点
  inputOnFocus = () => {
    // console.log('获取焦点了');
  }

  // 失去input search焦点
  inputOnBlur = () => {
    // console.log('失去焦点了');
  }

  // 搜索
  onSearch = () => {
    this.props.searchCommunicationFilelist()
  }

  render() {
    const {
      bread_paths,
      currentSelectBoardId,
      currentItemLayerId,
      currentSearchValue,
      descriptionTitle,
      disabled
    } = this.props
    return (
      <div className={styles.communicationFirstScreenHeader}>
        {/* 面包屑 */}
        <div className={styles.breadPath} style={{ cursor: 'pointer' }}>
          {bread_paths && bread_paths.length ? (
            <div style={{ marginTop: -9 }}>
              <Breadcrumb
                // separator={this.showSeparator()}
                style={{
                  display: 'flex',
                  fontSize: 18
                }}
              >
                <BreadcrumbItem
                  key={'allFiles'}
                  onClick={() => this.props.goAllFileStatus()}
                >
                  全部{descriptionTitle || '文件'}
                </BreadcrumbItem>
                {bread_paths.map((item, index) => {
                  const { id, folder_id, board_name, folder_name, type } = item
                  return (
                    <BreadcrumbItem
                      key={id || folder_id}
                      onClick={() => this.chooseBreadItem(item)}
                    >
                      <span
                        title={board_name || folder_name}
                        style={{
                          color: 'rgba(0,0,0,.65)',
                          display: 'inline-block',
                          maxWidth: 100,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {board_name || folder_name}
                      </span>
                    </BreadcrumbItem>
                  )
                })}
              </Breadcrumb>
            </div>
          ) : (
            <div className={styles.projectName}>
              {`${currentNounPlanFilterName(PROJECTS)}`}
              {descriptionTitle || '文件'}
            </div>
          )}
        </div>

        {/* 搜索 */}
        <div className={styles.rightSearch}>
          <Search
            style={{ width: '100%', resize: 'none' }}
            // autoFocus={true}
            autosize={true}
            disabled={disabled}
            // onChange={(e) => { this.inputOnChange(e) }}
            onChange={this.inputOnChange.bind(this)}
            onBlur={() => {
              this.inputOnBlur()
            }}
            onFocus={() => {
              this.inputOnFocus()
            }}
            // onClick={(e) => { this.handleStopPro(e) }}
            // onKeyDown={(e) => { this.handleKeyDown(list, file_id, e) }}
            // maxLength={50}
            onSearch={() => this.onSearch()}
            value={currentSearchValue}
            allowClear={true}
            // onSearch={(inputValue) => this.onSearch(inputValue, onSearchButton)}
          />
        </div>
      </div>
    )
  }
}
