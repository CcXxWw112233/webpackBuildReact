
import React from 'react'
import { Breadcrumb, Icon } from 'antd'
import indexStyles from './index.less'
import { connect } from 'dva';

@connect(mapStateToProps)
export default class BreadCrumbFileNav extends React.Component {
  fileNavClick(data) {
    const { value: { file_id, file_name }, key } = data
    const { breadcrumbList = [] } = this.props
    const new_breadcrumbList = [...breadcrumbList]
    new_breadcrumbList.splice(key + 1, breadcrumbList.length - key - 1) //删除当前点击后面的元素下标

    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        breadcrumbList: new_breadcrumbList,
        currentParrentDirectoryId: file_id,
        isInAddDirectory: false
      }
    })
    dispatch({
      type: 'projectDetailFile/getFileList',
      payload: {
        folder_id: file_id
      }
    })
  }
  render() {
    const { breadcrumbList = [] } = this.props
    const { showBackBtn = false, showBackBtnTitle, fileModuleBack = () => { } } = this.props;

    return (
      <div className={indexStyles.BreadCrumbFileNavOut}>
        {
          showBackBtn && <div className={indexStyles.backBtn} onClick={fileModuleBack}><Icon type="left" />&nbsp;项目列表</div>
        }

        {breadcrumbList.length > 1 && (
          <div className={indexStyles.BreadCrumbFileNavContent}>

            <Breadcrumb
              separator=">"
            >
              {breadcrumbList.map((value, key) => {
                return (
                  <Breadcrumb.Item key={key} onClick={this.fileNavClick.bind(this, { value, key })}>{value && value.file_name}</Breadcrumb.Item>
                )
              })}
            </Breadcrumb>
          </div>
        )}
      </div>
    )
  }

}
function mapStateToProps({
  projectDetailFile: {
    datas: {
      breadcrumbList = [],
    }
  },
}) {
  return {
    breadcrumbList,
  }
}