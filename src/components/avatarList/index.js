import React from 'react'
import styles from './index.less';
import {
  Avatar,
  Icon,
  Tooltip
} from 'antd'

const AvatarList = (props) => {
  const { users = [], size = 'default' } = props
  const getSizeNum = () => {
    switch (size){
      case 'small':
        return 24
        break
      case 'default':
        return 32
        break
      case 'large':
        return 40
        break
      default:
        return 32
        break
    }
  }
  const size_num = getSizeNum()
  const avatar_list_item_style = {
    border: '1px solid #FFFFFF',
  }
  const more_style = {
    height: size_num,
    width: size_num,
    borderRadius: size_num,
  }
  return (
    <div className={styles.avatar_list}>
      {
        users.map((value, key) => {
          const { avatar, name, id, user_id } = value
          return key < 3 &&(
            <Avatar key={id || user_id} size={size} src={avatar} style={{...avatar_list_item_style, marginLeft: key == 0?0:-(size_num/2), }}>{name}</Avatar>
          )
        })
      }
      {
        users.length > 3 && (
          <div className={styles.more_number} style={{...more_style, marginLeft: -(size_num/2)}}>+{users.length - 3}</div>
        )
      }
    </div>
  )
}

export default AvatarList
