import { Card, Icon, Dropdown } from 'antd'
import indexstyles from './index.less'
import TaskItem from './../../Technological/components/Workbench/HeaderComponent/TaskItem'
import ProcessItem from './../../Technological/components/Workbench/HeaderComponent/ProcessItem'
import FileItem from './../../Technological/components/Workbench/HeaderComponent/FileItem'
import MeetingItem from "./../../Technological/components/Workbench/HeaderComponent/MeetingItem";
import ProjectCountItem from './../../Technological/components/Workbench/HeaderComponent/ProjectCountItem'
import MapItem from './../../Technological/components/Workbench/HeaderComponent/MapItem'
import React from 'react'
import CollectionProjectItem from './../../Technological/components/Workbench/HeaderComponent/CollectionProjectItem'
import MyCircleItem from './../../Technological/components/Workbench/HeaderComponent/MyCircleItem'
import MyShowItem from './../../Technological/components/Workbench/HeaderComponent/MyShowItem'
import ArticleItem from './../../Technological/components/Workbench/HeaderComponent/ArticleItem'
import SchoolWork from './../../Technological/components/Workbench/HeaderComponent/SchoolWork'
import TeachingEffect from './../../Technological/components/Workbench/HeaderComponent/TeachingEffect'

export default class CardContentNormal extends React.Component{

  render(){
    const { code } = this.props
    const filterItem = (code) => {
      let contanner = (<div></div>)
      switch (code) {
        //设计师
        case 'RESPONSIBLE_TASK':
          contanner = (
            <TaskItem />
          )
          break
        case 'EXAMINE_PROGRESS': //待处理的流程
          contanner = (
            <ProcessItem />
          )
          break
        case 'MY_DOCUMENT':
          contanner = (
            <FileItem />
          )
          break
        case 'MEETIMG_ARRANGEMENT':
          contanner = (
            <MeetingItem />
          )
          break
        case 'PROJECT_STATISTICS':
          contanner = (
            <ProjectCountItem />
          )
          break
        case 'YINYI_MAP':
          contanner = (
            <MapItem />
          )
          break
        //=====
        case 'EXCELLENT_CASE':
          contanner = (
            <ArticleItem />
          )
          break
        case 'POLICIES_REGULATIONS':
          contanner = (
            <ArticleItem />
          )
          break
        case 'MY_SHOW':
          contanner = (
            <MyShowItem />
          )
          break
        case 'MY_CIRCLE':
          contanner = (
            <MyCircleItem />
          )
          break
        case 'PROJECT_TRCKING':
          contanner = (
            <CollectionProjectItem />
          )
          break
        //老师
        case 'MY_SCHEDULING': //我的排课 --会议
          contanner = (
            <MeetingItem />
          )
          break
        case 'JOURNEY': //行程安排 --会议
          contanner = (
            <MeetingItem />
          )
          break
        case 'TO_DO': //代办事项 --任务
          contanner = (
            <TaskItem />
          )
          break
        case 'SCHOOLWORK_CORRECTION': //作业批改
          contanner = (
            <SchoolWork />
          )
          break
        case 'TEACHING_EFFECT': //教学计划
          contanner = (
            <TeachingEffect />
          )
          break
        default:
          break
      }
      return contanner
    }
    return (
      <div className={indexstyles.cardDetail}>
        <div className={indexstyles.contentTitle}>
          <div>{'我的项目'}</div>
          {'YINYI_MAP' === code || 'TEAM_SHOW' === code? (''): (
            <div>
              <Icon type="ellipsis" style={{color: '#8c8c8c', fontSize: 20}} />
            </div>
          )}
        </div>
        <div className={indexstyles.contentBody}>
          {filterItem(code)}
        </div>

      </div>
    )
  }


}

