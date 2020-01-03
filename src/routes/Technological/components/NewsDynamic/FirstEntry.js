import React from 'react';
import { Card } from 'antd'
import FirstEntryStyle from './FirstEntry.less'
import QueueAnim from 'rc-queue-anim'


export default class FirstEntry extends React.Component {

  render() {
    return (
      <div className={FirstEntryStyle.out}>
        <div className={FirstEntryStyle.title}>欢迎使用动态面板</div>
        <div className={FirstEntryStyle.description}>这里可以汇集你参与的所有项目、任务、审批的最新变化，不错过及时跟进每一个重要的细节，例如最新的评论、刚提交的资料或刚更新的截止时间、项目进度等等。</div>
        <div style={{height: 30}}></div>
        <div className={FirstEntryStyle.card}>
          <div className={FirstEntryStyle.top}>
            <div className={FirstEntryStyle.left}>
              <div className={FirstEntryStyle.l_l}></div>
              <div className={FirstEntryStyle.l_r}></div>
            </div>
            <div className={FirstEntryStyle.right}>
              <div className={FirstEntryStyle.r_i}></div>
            </div>
          </div>
          <div className={FirstEntryStyle.bott}>
            <div className={FirstEntryStyle.left}></div>
            <div className={FirstEntryStyle.right}></div>
          </div>
        </div>
        <div className={FirstEntryStyle.card}>
          <div className={FirstEntryStyle.top}>
            <div className={FirstEntryStyle.left}>
              <div className={FirstEntryStyle.l_l}></div>
              <div className={FirstEntryStyle.l_r}></div>
            </div>
            <div className={FirstEntryStyle.right}>
              <div className={FirstEntryStyle.r_i}></div>
            </div>
          </div>
          <div className={FirstEntryStyle.bott}>
            <div className={FirstEntryStyle.left}></div>
            <div className={FirstEntryStyle.right}></div>
          </div>
        </div>
        <div className={FirstEntryStyle.card}>
          <div className={FirstEntryStyle.top}>
            <div className={FirstEntryStyle.left}>
              <div className={FirstEntryStyle.l_l}></div>
              <div className={FirstEntryStyle.l_r}></div>
            </div>
            <div className={FirstEntryStyle.right}>
              <div className={FirstEntryStyle.r_i}></div>
            </div>
          </div>
          <div className={FirstEntryStyle.bott}>
            <div className={FirstEntryStyle.left}></div>
            <div className={FirstEntryStyle.right}></div>
          </div>
        </div>
      </div>
    )
  }
}




