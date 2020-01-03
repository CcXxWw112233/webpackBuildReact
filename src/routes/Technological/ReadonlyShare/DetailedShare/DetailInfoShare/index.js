
import DetailInfoModal from './DetailInfoModal'

const DetailInfo = (props) => {

  const { modalVisible, dispatch, invitationType, invitationId, } = props
  return (
    <DetailInfoModal modalVisible={modalVisible} dispatch={dispatch} invitationType={invitationType} invitationId={invitationId} />
  )
}

export default DetailInfo
