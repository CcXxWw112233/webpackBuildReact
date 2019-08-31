import indexStyles from './index.less'
import { Icon } from 'antd'

const Index = (props) => {
    const { is_realize } = props
    const checkClick = (e) => {
        e.stopPropagation()
    }
    return (
        <div className={`${ is_realize == '1' ? indexStyles.nomalCheckBoxActive: indexStyles.nomalCheckBox}`} 
        onMouseDown={checkClick}
        onMouseOver={checkClick}
        onClick={checkClick}>
             <Icon type="check" style={{color: '#FFFFFF', fontSize: 12, fontWeight: 'bold'}}/>
        </div>
    )
}

export default Index


