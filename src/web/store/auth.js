const cookieparser = process.server ? require('cookieparser') : undefined

export const state = () => {
  return {
    token: null,
  }
}
export const mutations = {
  setAuth(state, auth) {
    state.token = auth
  },
}
export const actions = {
  nuxtServerInit({ commit }, { req }) {
    let token = null
    if (req.headers.cookie) {
      const parsed = cookieparser.parse(req.headers.cookie)
      try {
        token = JSON.parse(parsed.token)
      } catch (err) {
        // No valid cookie found
      }
    }
    commit('auth/setAuth', token)
  },
}
