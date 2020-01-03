import detailInfoStyle from './index.less';
import React from 'react';
import{Icon, Tooltip} from 'antd'
import globalStyles from './../../globalset/css/globalClassName.less'

const NoPermissionUserCard = ({avatar, full_name}) => {
  return (
    <div className={detailInfoStyle.manImageDropdown}>
      <div className={detailInfoStyle.manImageDropdown_top}>
        <div className={detailInfoStyle.left}>
          {avatar ? (
            <img src={avatar} alt="" />
          ) : (
            <div
              style={{
                backgroundColor: '#f2f2f2',
                textAlign: 'center',
                width: 32,
                height: 32,
                borderRadius: 32
              }}
            >
              <Icon
                type={'user'}
                style={{ color: '#8c8c8c', fontSize: 20, marginTop: 6 }}
              />
            </div>
          )}
        </div>
        <div className={detailInfoStyle.right}>
          <div className={detailInfoStyle.name}>{full_name || ''}</div>
          <Tooltip title="该功能即将上线">
            <div className={detailInfoStyle.percent}>
              <div style={{ width: '0' }} />
              <div style={{ width: '0' }} />
              <div style={{ width: '100%' }} />
            </div>
          </Tooltip>
        </div>
      </div>
      <div className={detailInfoStyle.noPermissionPrompt__wrapper}>
            <div className={detailInfoStyle.noPermissionPrompt__icon}><i className={globalStyles.authTheme}>&#xe86a;</i></div>
            <div className={detailInfoStyle.noPermissionPrompt__text}>暂无权限查看</div>
      </div>
    </div>
  );
};

export default NoPermissionUserCard;
