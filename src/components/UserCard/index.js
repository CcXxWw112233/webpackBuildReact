import Ract from 'react'
import detailInfoStyle from './index.less'
import { Icon, Tooltip } from 'antd'

const UserCard = ({ avatar, name, role_name, email, mobile }) => {
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
          <div className={detailInfoStyle.name}>{name || '佚名'}</div>
          <Tooltip title="该功能即将上线">
            <div className={detailInfoStyle.percent}>
              <div style={{ width: '0' }}></div>
              <div style={{ width: '0' }}></div>
              <div style={{ width: '100%' }}></div>
            </div>
          </Tooltip>
        </div>
      </div>
      <div className={detailInfoStyle.manImageDropdown_middle}>
        {/* <div className={detailInfoStyle.detailItem}>
          <div>姓名：</div>
          <div>{name}</div>
        </div> */}
        <div className={detailInfoStyle.detailItem}>
          <div>职位：</div>
          <div>{role_name ? role_name : '无'}</div>
        </div>
        <div className={detailInfoStyle.detailItem}>
          <div>邮箱：</div>
          <div>{email}</div>
        </div>
        <div className={detailInfoStyle.detailItem}>
          <div>手机：</div>
          <div>{mobile}</div>
        </div>
        {/* <div className={detailInfoStyle.detailItem}>
          <div>微信：</div>
          <div>{we_chat || '无'}</div>
        </div> */}
      </div>
      {/*<div className={detailInfoStyle.manImageDropdown_bott}>*/}
      {/*<img src="" />*/}
      {/*</div>*/}
    </div>
  )
}

export default UserCard
