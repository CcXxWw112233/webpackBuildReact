import React from "react";
import dva, { connect } from "dva/index"
import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { Icon, message, Tooltip, Button } from 'antd';
import { isColor } from '@/utils/util'

const WorkbenchBoxSelect = (props) => {
  const { dispatch, workbenchBoxList = [], myWorkbenchBoxList = [] } = props;
  const closeBoxManage = () => {
    props.setHomeVisible({
      simpleHeaderVisiable: true,
      myWorkbenchBoxsVisiable: true,
      wallpaperSelectVisiable: true,
      workbenchBoxSelectVisiable: false,
      createProjectVisiable: false,
    });
  }
  const selectOrCancelCurrWorkbenchBox = (e, data) => {
    e.stopPropagation();
    // if (data.status == 0 && !data.isSelected) {
    //   message.warn("功能开发中，请耐心等待");
    //   return;
    // }
    const { id } = data;
    if (!data.isSelected) {
      dispatch({
        type: 'simplemode/myboxSet',
        payload: { id }
      });
    } else {
      dispatch({
        type: 'simplemode/myboxCancel',
        payload: { id }
      });
    }

  }

  const { allWallpaperList = [], currentUserWallpaperContent, userInfo = {} } = props;
  const { wallpaper = '' } = userInfo;
  const wallpaperContent = currentUserWallpaperContent ? currentUserWallpaperContent : wallpaper;
  let bgStyle = {}
  if (isColor(wallpaperContent)) {
    bgStyle = { backgroundColor: wallpaperContent };
  } else {
    bgStyle = { backgroundImage: `url(${wallpaperContent})` };
  }

  const renderBoxItem = (boxItem, isSelected) => {
    return (
      <div key={boxItem.id} className={indexStyles.workbenchBox} onClick={(e) => { selectOrCancelCurrWorkbenchBox(e, { id: boxItem.id, isSelected: isSelected, status: boxItem.status }) }} disabled={boxItem.status == 0 ? true : false}>
        <i dangerouslySetInnerHTML={{ __html: boxItem.icon }} className={`${globalStyles.authTheme} ${indexStyles.workbenchBox_icon}`} ></i><br />
        <span className={indexStyles.workbenchBox_title}>{boxItem.name}</span>
        {isSelected && (
          <span>
            <div className={indexStyles.workbenchBoxSelected}><Icon type="check-circle" theme="filled" style={{ fontSize: '24px' }} /></div>
            <div className={indexStyles.workbenchBoxSelectedBg}></div>
          </span>
        )}

        {!isSelected &&
          <div className={indexStyles.workbenchBoxSelectHover}></div>
        }

      </div>
    )
  }
  return (
    <div onClick={(e) => { closeBoxManage(e) }}>
      <div className={indexStyles.selectWorkbenchBoxWapperModalBg} style={bgStyle}></div>
      <div className={indexStyles.selectWorkbenchBoxWapperModal}>
        <div style={{ paddingLeft: '96px', paddingTop: '44px' }}>
          <div className={indexStyles.backBtn}><Icon type="left" />返回</div>
        </div>
        <div className={indexStyles.workbenchBoxWapper}>
          {
            workbenchBoxList.map((boxItem, key) => {
              let isSelected = myWorkbenchBoxList.filter(item => item.id == boxItem.id).length > 0 ? true : false;
              //console.log("8888", isSelected);
              return (
                boxItem.status == 0 ? (
                  <Tooltip title="功能开发中，请耐心等待">
                    {renderBoxItem(boxItem, isSelected)}
                  </Tooltip>
                ) :
                  renderBoxItem(boxItem, isSelected)
              )
            })
          }

        </div>
        <div className={indexStyles.footer}>
          <div className={indexStyles.operationTip}>点击空白处或按“ESC“键返回</div>
        </div>
      </div>
    </div>
  );
}
export default connect(({
  simplemode: { workbenchBoxList, myWorkbenchBoxList, currentUserWallpaperContent },
  technological: {
    datas: { userInfo }
  } }) => ({ workbenchBoxList, myWorkbenchBoxList, currentUserWallpaperContent, userInfo }))(WorkbenchBoxSelect)
