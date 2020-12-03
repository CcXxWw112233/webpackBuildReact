import React from 'react'

export default class TeamInfoDetail extends React.Component {
  styles() {
    const detailInfoOut = {
      width: '100%',
      backgroundColor: '#ffffff',
      paddingBottom: 60,
      height: 'auto',
      clear: 'both'
    }
    const detailInfo = {
      marginTop: 20,
      backgroundColor: '#ffffff',
      width: 800,
      textAlign: 'center',
      margin: '0 auto',
      height: 'auto',
      padding: '30px 0'
    }
    const detailInfo_top = {
      width: 200,
      height: 'auto',
      border: '1px solid rgba(217,217,217,1)',
      margin: '0 auto',
      borderRadius: 4
    }
    const detaiInfo_middle = {
      marginTop: 16,
      fontSize: 24
    }
    const detailInfo_bott = {
      marginTop: 20,
      fontSize: 14,
      textAlign: 'left'
    }

    return {
      detailInfoOut,
      detailInfo,
      detailInfo_top,
      detaiInfo_middle,
      detailInfo_bott
    }
  }
  render() {
    const {
      detailInfo_top,
      detaiInfo_middle,
      detailInfo_bott,
      detailInfo
    } = this.styles()
    const minHeight = document.body.clientHeight - 64
    const {
      datas: { detaiInfo = {} }
    } = this.props.model
    const { content, cover_img, name, summary } = detaiInfo
    return (
      <div
        style={{
          minHeight: minHeight,
          backgroundColor: '#ffffff',
          margin: 0,
          height: 'auto'
        }}
      >
        <div style={{ ...detailInfo }}>
          <img src={cover_img} style={{ ...detailInfo_top }} />
          <div style={{ ...detaiInfo_middle }}>{name}</div>
          <div
            style={{ ...detailInfo_bott }}
            dangerouslySetInnerHTML={{ __html: summary }}
          ></div>
        </div>

        <div
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ width: 1200, margin: '0 auto', overflow: 'hidden' }}
        ></div>
      </div>
    )
  }
}
