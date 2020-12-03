export const NoteIcon = props => {
  let canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')
  canvas.width = 24
  canvas.height = 24
  ctx.beginPath()
  ctx.fillStyle = props.fillStyle || '#93D276'
  ctx.moveTo(0, 0)
  ctx.lineTo(24, 0)
  ctx.lineTo(24, 16)
  ctx.lineTo(16, 24)
  ctx.lineTo(0, 24)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.moveTo(24 - 8, 16)
  ctx.lineTo(24, 16)
  ctx.lineTo(24 - 8, 24)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  // 设置字体
  ctx.font = '14px bold 黑体'
  // 设置颜色
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  // 设置水平对齐方式
  ctx.textAlign = 'center'
  // 设置垂直对齐方式
  ctx.textBaseline = 'middle'
  ctx.fillText(props.text || 1, 24 / 2, 24 / 2)
  let url = canvas.toDataURL()
  canvas = null
  ctx = null
  return url
}
