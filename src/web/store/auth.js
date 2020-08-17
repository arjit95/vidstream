const Cookies = process.client ? require('js-cookie') : undefined

export const state = () => {
  return {
    token: null,
  }
}
export const mutations = {
  setAuth(state, token) {
    state.token = token
    if (typeof Cookies !== 'undefined') {
      Cookies.set('token', token)
    }
  },
}
