
const girl_friends = []
for (let i = 0; i < 100000; i++) {
    const info = {
        name: `小丽_${i}`,
        no: i
    }
    girl_friends.push(info)
}
function userInfo(state = {}) {
    return {
        name: 'cxw',
        girl_friends,
    }
}

export default {
    userInfo
}