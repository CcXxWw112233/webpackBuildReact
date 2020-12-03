import React from 'react'
import { connect } from 'dva/index'
import Header from './Header'
import CreateTask from './TaskItemComponent/CreateTask'
import FileModule from './FileModule'
// import ProcessIndex from './Process'
import ProcessIndex from './WorkFlow'
import indexStyles from './index.less'
import { openImChatBoard } from '../../../../utils/businessFunction'
import { getQueryString } from '../../../../utils/util'

const ProjectDetail = props => {
  const { appsSelectKey, projectDetailInfoData = {} } = props

  const { board_id } = projectDetailInfoData
  if (board_id) {
    //当是查看项目而非查看项目内应用详情（任务文件流程）
    const {
      location: { search }
    } = props
    const card_id = getQueryString(search, 'card_id')
    const file_id = getQueryString(search, 'file_id')
    const flow_id = getQueryString(search, 'flow_id')
    const only_see_board_detail = !card_id && !file_id && !flow_id
    if (only_see_board_detail) {
      openImChatBoard({ board_id, autoOpenIm: true })
    }
  }

  const filterAppsModule = appsSelectKey => {
    let appFace = <div></div>
    /**
     * 检验是否有获取对应appData的权限
     * @param {String} key 传入对应的渲染app数据的key值
     * @return {Boolean} 该方法返回布尔类型的值
     */
    const checkIsHasPermissionInAppData = key => {
      let { app_data = [] } = projectDetailInfoData
      let flag
      let new_appData = [...app_data]
      // 如果说是一个空数组, 那么表示都没有权限
      if (new_appData && !new_appData.length) return false
      if (!Array.isArray(new_appData)) return false
      new_appData =
        new_appData &&
        new_appData.find(item => {
          if (item.key == key) {
            // 如果能够匹配对应的app那么就有权限
            flag = true
          } else {
            flag = false
          }
          return flag
        })
      return flag
    }

    switch (appsSelectKey) {
      case '2':
        appFace = checkIsHasPermissionInAppData('2') && <ProcessIndex />
        break
      case '3':
        appFace = checkIsHasPermissionInAppData('3') && <CreateTask />
        break
      case '4':
        appFace = checkIsHasPermissionInAppData('4') && <FileModule />
        break
      default:
        break
    }
    return appFace
  }
  return (
    <div
      style={{
        height: 'auto',
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        margin: '0 auto'
      }}
    >
      <div className={indexStyles.headerMaskDown}></div>
      <Header />
      <div style={{ padding: '0 20px' }}>{filterAppsModule(appsSelectKey)}</div>
    </div>
  )
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  projectDetail: {
    datas: { appsSelectKey, projectDetailInfoData = {} }
  }
}) {
  return { appsSelectKey, projectDetailInfoData }
}
export default connect(mapStateToProps)(ProjectDetail)
