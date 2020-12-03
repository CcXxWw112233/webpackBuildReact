import react, { Component } from 'react'
import { Checkbox } from 'antd'
import globalStyles from '@/globalset/css/globalClassName.less'
import indexStyles from './index.less'

const CheckboxGroup = Checkbox.Group

class TemporaryFilePart extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { temporaryData, currentCheckedList } = this.props
    const isOperation = currentCheckedList && currentCheckedList.length
    return (
      <div className={indexStyles.temporaryFilePart}>
        <div className={indexStyles.headerContent}>
          <div className={indexStyles.header}>临时文件</div>
          {isOperation ? (
            <div className={indexStyles.operation}>
              <span onClick={() => this.props.transferToProject()}>
                <span className={globalStyles.authTheme}>&#xe6dd;</span>{' '}
                转存到项目
              </span>
              <span onClick={() => this.props.deleteProject()}>
                <span
                  className={globalStyles.authTheme}
                  style={{ paddingLeft: '26px' }}
                >
                  &#xe7c3;
                </span>{' '}
                删除
              </span>
            </div>
          ) : (
            <div className={indexStyles.operation}>
              <span className={globalStyles.authTheme}>&#xe6dd;</span>{' '}
              转存到项目
              <span
                className={globalStyles.authTheme}
                style={{ paddingLeft: '26px' }}
              >
                &#xe7c3;
              </span>{' '}
              删除
            </div>
          )}
        </div>
        <div className={indexStyles.temporaryList}>
          {temporaryData &&
            temporaryData.map(item => {
              return (
                <div key={item.id} className={indexStyles.itemList}>
                  <div
                    className={`${globalStyles.authTheme} ${indexStyles.fileIcon}`}
                  >
                    &#xe6b4;
                  </div>
                  <div className={indexStyles.fileName}>{item.fileName}</div>
                  {/* <div
                                        className={`${globalStyles.authTheme} ${indexStyles.checkboxStyle}`}
                                        onClick={this.props.changeChecked(item.id)}
                                    >
                                        {
                                            item.checked ?
                                            <span>&#xe700;</span>
                                            : 
                                            <span>&#xe700;</span>
                                        }
                                    </div> */}
                  <Checkbox
                    checked={item.checked}
                    onChange={() => this.props.onChangeCheckboxGroup(item.id)}
                  >
                    {/* Checkbox */}
                  </Checkbox>
                </div>
              )
            })}
        </div>
      </div>
    )
  }
}

export default TemporaryFilePart
