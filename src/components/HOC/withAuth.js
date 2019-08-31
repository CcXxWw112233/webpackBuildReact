import React, {Component} from 'react'
const withAuth = authValidFn => WrappedComponent => {
  return class extends Component {
    checkAuth = auth => {
      if(typeof auth === 'undefined') return false
      return authValidFn(auth)
    }
    render() {
      const {auth, displayWhenAuthFailed = null} = this.props
      const isAuthValid = this.checkAuth(auth)
      if(!isAuthValid) {
        return displayWhenAuthFailed
      }
      return <WrappedComponent {...this.props} />
    }
  }
}

export default withAuth
