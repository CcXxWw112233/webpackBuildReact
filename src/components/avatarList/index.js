import React from 'react'
import styles from './index.less';
import {
  Avatar,
  Icon,
  Tooltip
} from 'antd'

export default class AvatarList extends React.Component {
  constructor(props) {
    super(props)
    this.avatar_ref = React.createRef()
  }
  getSizeNum = () => {
    const { size = 'default' } = this.props //
    let size_num = 32
    switch (size) {
      case 'small':
        size_num = 24
        break
      case 'default':
        size_num = 32
        break
      case 'large':
        size_num = 40
        break
      default:
        size_num = size
        break
    }
    return size_num
  }
  avatar_list_item_style = () => {
    return {
      border: '1px solid #FFFFFF',
    }
  }
  more_style = () => {
    const size_num = this.getSizeNum()
    return {
      height: size_num,
      width: size_num,
      borderRadius: size_num,
      lineHeight: `${this.getSizeNum() - 2}px`
    }
  }
  renderAvatar = ({ avatar, name, key }) => {
    const { targetclassname } = this.props
    const content_style = { ...this.avatar_list_item_style(), ...this.more_style(), marginLeft: key == 0 ? 0 : -(this.getSizeNum() / 2), }
    const img = (
      <img
        data-targetclassname={targetclassname}
        src={avatar}
        className={styles.img_avatar}
        style={{ ...content_style }}
      />
    )
    const name_content = (
      <div
        data-targetclassname={targetclassname}
        className={styles.img_avatar}
        style={{ ...content_style }} >
        {name}
      </div>
    )
    if (!!avatar) {
      return img
    } else {
      return name_content
    }
  }
  render() {
    const { users = [], targetclassname } = this.props
    return (
      <div className={styles.avatar_list}>
        {
          users.map((value, key) => {
            const { avatar, name, id, user_id } = value
            return key < 3 && (
              <React.Fragment key={id || user_id}>
                {this.renderAvatar({ avatar, name, key })}
              </React.Fragment>
              // <Avatar
              //   ref={this.avatar_ref}
              //   onMouseDown={(e) => e.preventDefault()}
              //   onMouseMove={(e) => e.preventDefault()}
              //   onMouseOver={(e) => e.preventDefault()}
              //   key={id || user_id}
              //   size={size}
              //   src={avatar}
              //   style={{ ...this.avatar_list_item_style(), marginLeft: key == 0 ? 0 : -(this.getSizeNum() / 2), }}>
              //   {name}
              // </Avatar>
            )
          })
        }
        {
          users.length > 3 && (
            <div
              data-targetclassname={targetclassname}
              className={styles.more_number} style={{ ...this.more_style(), marginLeft: -(this.getSizeNum() / 2) }}>+{users.length - 3}</div>
          )
        }
      </div>
    )
  }
}

AvatarList.defaultProps = {
  users: [],
  size: 'default', // defaut / small / large / typeOf size == 'number 
  targetclassname: ''
}