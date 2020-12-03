import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'

const Index = props => {
  const { is_realize, styles = {}, card_type } = props
  const checkClick = e => {
    // e.stopPropagation()
  }
  return (
    <div
      className={`${indexStyles.out}`}
      onMouseDown={e => e.preventDefault()}
      onMouseMove={e => e.preventDefault()}
      onMouseOver={e => e.preventDefault()}
      style={{ ...styles }}
      onClick={checkClick}
    >
      {card_type == '1' ? ( //0任务 1 会议
        <i
          className={`${globalStyles.authTheme}`}
          style={{
            color: is_realize == '1' ? 'rgba(0,0,0,.15)' : 'rgba(0,0,0,.35)',
            fontSize: 18,
            display: 'inline-block',
            marginTop: -4
          }}
        >
          &#xe709;
        </i>
      ) : is_realize == '1' ? (
        <i className={`${globalStyles.authTheme}`}>&#xe662;</i>
      ) : (
        <i className={`${globalStyles.authTheme}`}>&#xe661;</i>
      )}
    </div>
  )
}

export default Index
