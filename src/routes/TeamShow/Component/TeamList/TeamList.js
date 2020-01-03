import React from 'react'
import indexStyles from './index.less'
import { Icon, Button, Pagination } from 'antd'
import TeamListTypeOne from './TeamListTypeOne'
import TeamListTypeTwo from './TeamListTypeTwo'
import { PAGINATION_PAGE_SIZE } from '../../../../globalset/js/constant'

export default class TeamList extends React.Component{
  state={
    showType: '1', //表现形式1 ， 2

  }
  setShowType(showType) {
    this.setState({
      showType
    })
  }
  gotoEditTeamShow() {
    this.props.routingJump('/technological/teamShow/editTeamShow')
  }
  pageNoChange(pageNo) {
    const { datas: {teamShowTypeId} } = this.props.model

    this.props.updateDatas({
      currentPageNo: pageNo
    })
    this.props.getTeamShowList({
      show_type_id: teamShowTypeId || undefined,
      current: pageNo,
      size: PAGINATION_PAGE_SIZE,
    })
  }
  render(){
    const { showType } = this.state
    const { datas: {teamShowList=[], total, currentPageNo} } = this.props.model
    return(
      <div className={indexStyles.teamListOut}>
        <div className={indexStyles.head}>
          <div className={indexStyles.head_left}>
             <Button style={{fontSize: 14, }} size={'small'} onClick={this.gotoEditTeamShow.bind(this)}>发布管理</Button>
          </div>

          <div className={indexStyles.head_right}>
            <div style={{marginRight: 16, }}>
              默认排序 <Icon type="down" style={{fontSize: 14, color: '#595959'}}/>
            </div>
            <Icon onClick={this.setShowType.bind(this, '1')} type="appstore-o" style={{fontSize: 16, marginRight: 16, color: showType === '1' ? '#262626':'#8c8c8c'}}/><Icon type="bars" onClick={this.setShowType.bind(this, '2')} style={{fontSize: 18, color: showType === '2' ? '#262626':'#8c8c8c'}} />
          </div>
        </div>
        <div className={showType === '1' ? indexStyles.teamList_list_1 : indexStyles.teamList_list_2}>
          {teamShowList.map((value, key ) => (
            showType === '1' ? (
              <TeamListTypeOne itemValue={value} itemKey={key} key={key} {...this.props}/>
            ): (
              <TeamListTypeTwo itemValue={value} itemKey={key} key={key} {...this.props}/>
            )
          ))}
        </div>
        <div style={{marginTop: 40, display: teamShowList.length? 'none': 'block', fontSize: 16, color: '#8c8c8c' }} >没有记录哦~</div>
        <div style={{marginTop: 40, display: teamShowList.length? 'block': 'none' }} >
          <Pagination
            total={Number(total)}
            pageSize={PAGINATION_PAGE_SIZE}
            current={currentPageNo}
            onChange = {this.pageNoChange.bind(this)}
          />
        </div>
      </div>
    )
  }

}
