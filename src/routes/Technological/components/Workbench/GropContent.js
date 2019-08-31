import React from "react";
import indexStyles from "./index.less";
import { connect } from "dva/index";
import CardContent from "./CardContent";
import CardContentArticle from "./CardContent/CardContentArticle";
import {
  WE_APP_TYPE_KNOW_CITY,
  WE_APP_TYPE_KNOW_POLICY
} from "../../../../globalset/js/constant";
import CardContentFileModule from "./CardContentFileModule";
import EditTeamShow from "./EditTeamShow";
import Gantt from '../Gantt'

export default class GroupContent extends React.Component {
  render() {
    const {
      updateDatas,
      cardContentListProps,
      CreateTaskProps,
      FileModuleProps,
      model = {}
    } = this.props;
    const {
      datas: { boxList = [], cardGroupKey = 0, workbench_show_gantt_card = '0' }
    } = model;

    const container_0 = (
      <div className={indexStyles.cardItem}>
        <div
          className={indexStyles.cardItem_left}
          style={{ width: boxList.length > 1 ? "50%" : "100%" }}
        >
          {/*boxList.slice(0,Math.ceil(boxList.length / 2))*/}
          {boxList.map((value, key) => {
            const { code, name, id } = value;
            let flag = key % 2 == 0;

            let container = "";
            if ("EXCELLENT_CASE" === code || "POLICIES_REGULATIONS" === code) {
              //优秀案例或晓策志
              container = (
                <CardContentArticle
                  {...this.props}
                  title={name}
                  {...cardContentListProps}
                  updateDatas={updateDatas}
                  CardContentType={code}
                  boxId={id}
                  itemValue={value}
                  appType={
                    "EXCELLENT_CASE" === code
                      ? WE_APP_TYPE_KNOW_CITY
                      : WE_APP_TYPE_KNOW_POLICY
                  }
                />
              );
            } else {
              container = (
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
              );
            }
            return flag && <div key={id}>{container}</div>;
          })}
        </div>
        {boxList.length > 1 ? (
          <div className={indexStyles.cardItem_right}>
            {/*boxList.slice(Math.ceil(boxList.length / 2))*/}
            {boxList.map((value, key) => {
              const { code, name, id } = value;
              let flag = key % 2 != 0;

              let container = "";
              if (
                "EXCELLENT_CASE" === code ||
                "POLICIES_REGULATIONS" === code
              ) {
                //优秀案例或晓策志
                container = (
                  <CardContentArticle
                    {...this.props}
                    title={name}
                    {...cardContentListProps}
                    updateDatas={updateDatas}
                    CardContentType={code}
                    boxId={id}
                    itemValue={value}
                    appType={
                      "EXCELLENT_CASE" === code
                        ? WE_APP_TYPE_KNOW_CITY
                        : WE_APP_TYPE_KNOW_POLICY
                    }
                  />
                );
              } else {
                container = (
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
                );
              }
              return flag && <div key={id}>{container}</div>;
            })}
          </div>
        ) : (
          ""
        )}
      </div>
    );

    const container_1 = (
      <div className={indexStyles.cardItem} style={{ display: "block" }}>
        <CardContentFileModule
          {...this.props}
          title={"我上传的文档"}
          CardContentType={"MY_UPLOAD_FILE"}
          {...cardContentListProps}
          {...CreateTaskProps}
          {...FileModuleProps}
          updateDatas={updateDatas}
        />
        <CardContentFileModule
          {...this.props}
          title={"我收藏的文档"}
          CardContentType={"MY_STAR_FILE"}
          {...cardContentListProps}
          {...CreateTaskProps}
          {...FileModuleProps}
          updateDatas={updateDatas}
        />
      </div>
    );

    const container_2 = (
      <div style={{ maxHeight: 600, height: 600 }}>
        <iframe
          title='life-schedule'
          src={`http://www.new-di.com/other/LifeSchedule/index.html`}
          // src={`http://www.baidu.com`}
          frameBorder="0"
          width="100%"
          height="100%"
        />
      </div>
    );

    const container_3 = (
      <div>
        <EditTeamShow />
      </div>
    );

    const filterContain = cardGroupKey => {
      let container = <div />;
      switch (cardGroupKey) {
        case 0:
          container = container_0;
          break;
        case 1:
          container = container_1;
          break;
        case 2:
          container = container_2;
          break;
        case 3:
          container = container_3;
          break;
        default:
          break;
      }
      return container;
    };

    return (
      <div className={indexStyles.workbenchOut}>
        {workbench_show_gantt_card == '0'? (
          filterContain(cardGroupKey)
        ): (
          <Gantt is_need_calculate_left_dx />
        )}
      </div>
    );
  }
}
