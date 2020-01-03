import React from 'react'
import styles from './index.css';
import {
  Dropdown,
  Icon,
  Tooltip
} from 'antd'

const AvatarMore = ({datas}) => {
  const imgOrAvatar = (img) => {
    return img ? (
      <div>
        <img src={img} style={{width: 18, height: 18, borderRadius: 16, margin: '0 4px'}} />
      </div>
    ):(
      <div style={{lineHeight: '18px', height: 18, width: 16, borderRadius: 18, backgroundColor: '#e8e8e8', marginRight: 8, textAlign: 'center', margin: '0 8px', marginTop: 2, }}>
        <Icon type={'user'} style={{fontSize: 10, color: '#8c8c8c', }}/>
      </div>
    )
  }
  
  const filterAvatar = (arr) => {
    let temp = []
    for(let i = 0, len = arr.length; i < len; i += 4){
      temp.push(arr.slice(i, i+4))
    }
    return temp.reduce((r, c) => {
      return [
        ...r,
        ...(c.reduce((_r, _c, i) => {
          return [
            ..._r,
            ...(
                i === 3?
                [<Tooltip key={`Tool${_c.name}`} title={_c.name || _c.mobile || '佚名'}>{imgOrAvatar(_c.avatar)}</Tooltip>, <br key={`br${_c}`} />]:
                [<Tooltip key={`Tool${_c.name}`} title={_c.name || _c.mobile || '佚名'}>{imgOrAvatar(_c.avatar)}</Tooltip>]
              )
          ]  
        }, []))
      ]
    }, [])
  }
  
  const leftDatas = datas.reduce((r, c, i) => {
    return [
      ...r,
      ...(i <= 1? []: [c])
    ]
  }, [])
  
  const content = (
    <div style={{
      width: '100px',
      minHeight: '50px',
      display: 'flex',
      width: '100px',
      background: 'rgba(255,255,255,1)',
      boxShadow: '0px 2px 4px 0px rgba(0,0,0,0.15)',
      borderRadius: '4px'
    }}>
      {filterAvatar(leftDatas)}
    </div>
  )
  return (
    <Dropdown overlay={content}>
      <Icon type="ellipsis" style={{cursor: 'pointer'}}/>
    </Dropdown>
  )
}

export default AvatarMore