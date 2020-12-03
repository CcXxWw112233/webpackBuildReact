import React from 'react'
import indexStyle from './index.less'
import globalStyles from '../../../../globalset/css/globalClassName.less'
import { Icon, Menu, Dropdown, Tooltip, Collapse, Card } from 'antd'

export default class CollectionProject extends React.Component {
  render() {
    const taskMan = [1, 2, 3, 4, 5, 6, 7, 8]
    return (
      <Card style={{ position: 'relative', height: 'auto' }}>
        <div className={indexStyle.listOutmask}></div>
        <div className={indexStyle.listOut}>
          <div className={indexStyle.left}>
            <div className={indexStyle.top}>
              <span>[项目实例]关于切从未如此一目了然</span>
              <Icon
                className={indexStyle.star}
                type="star"
                style={{ margin: '4px 0 0 8px', color: '#FAAD14' }}
              />
            </div>
            <div className={indexStyle.bottom}>
              {taskMan.map((value, key) => {
                if (key < 7) {
                  return (
                    <img
                      src=""
                      key={key}
                      className={indexStyle.taskManImag}
                    ></img>
                  )
                }
              })}
              {taskMan.length > 7 ? (
                <div style={{ display: 'flex', fontSize: 12 }}>
                  <div className={indexStyle.manwrap}>
                    <Icon type="ellipsis" style={{ fontSize: 18 }} />
                  </div>
                  {taskMan.length}位任务执行人
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
          <div className={indexStyle.right}>
            <div className={indexStyle.rightItem}>
              <div>27</div>
              <div>剩余任务</div>
            </div>
            <div className={indexStyle.rightItem}>
              <div style={{ color: '#8c8c8c' }}>27</div>
              <div>已完成</div>
            </div>
            <div className={indexStyle.rightItem}>
              <div>27</div>
              <div>距离下一节点</div>
            </div>
          </div>
        </div>
      </Card>
    )
  }
}
