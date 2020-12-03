import React from 'react'
import indexStyles from './index.less'
import CardContent from './CardContent'
import Gantt from '../Gantt'

export default class GroupContent extends React.Component {
  filterContain = () => {
    const {
      updateDatas,
      cardContentListProps,
      CreateTaskProps,
      FileModuleProps,
      model = {}
    } = this.props
    const {
      datas: { boxList = [] }
    } = model
    const container_0 = (
      <div className={indexStyles.cardItem}>
        <div
          className={indexStyles.cardItem_left}
          style={{ width: boxList.length > 1 ? '50%' : '100%' }}
        >
          {/*boxList.slice(0,Math.ceil(boxList.length / 2))*/}
          {boxList.map((value, key) => {
            const { code, name, id } = value
            let flag = key % 2 == 0
            const container = (
              <CardContent
                {...this.props}
                title={name}
                itemValue={value}
                itemKey={key}
                {...cardContentListProps}
                {...CreateTaskProps}
                {...FileModuleProps}
                boxId={id}
                updateDatas={updateDatas}
                CardContentType={code}
              />
            )
            return flag && <div key={id}>{container}</div>
          })}
        </div>
        {boxList.length > 1 ? (
          <div className={indexStyles.cardItem_right}>
            {/*boxList.slice(Math.ceil(boxList.length / 2))*/}
            {boxList.map((value, key) => {
              const { code, name, id } = value
              let flag = key % 2 != 0

              const container = (
                <CardContent
                  {...this.props}
                  title={name}
                  itemValue={value}
                  itemKey={key}
                  {...cardContentListProps}
                  {...CreateTaskProps}
                  {...FileModuleProps}
                  boxId={id}
                  updateDatas={updateDatas}
                  CardContentType={code}
                />
              )
              return flag && <div key={id}>{container}</div>
            })}
          </div>
        ) : (
          ''
        )}
      </div>
    )
    return container_0
  }
  render() {
    const { model = {} } = this.props
    const {
      datas: { workbench_show_gantt_card = '0' }
    } = model

    return (
      <div className={indexStyles.workbenchOut}>
        {workbench_show_gantt_card == '0' ? (
          this.filterContain()
        ) : (
          <Gantt is_need_calculate_left_dx />
        )}
      </div>
    )
  }
}
