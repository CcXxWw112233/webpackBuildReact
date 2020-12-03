import DetailInfoModal from './DetailInfoModal'

const DetailInfo = props => {
  const {
    modalVisible,
    invitationType,
    invitationId,
    setProjectDetailInfoModalVisible
  } = props
  return (
    <DetailInfoModal
      modalVisible={modalVisible}
      setProjectDetailInfoModalVisible={setProjectDetailInfoModalVisible}
      invitationType={invitationType}
      invitationId={invitationId}
    />
  )
}

export default DetailInfo
