const cookieparser = require('cookieparser')

export const actions = {
  nuxtServerInit({ commit }, { req }) {
    let token = null
    if (req.headers.cookie) {
      const parsed = cookieparser.parse(req.headers.cookie)
      token = parsed.token
    }

    if (token) {
      commit('auth/setAuth', token)
    }
  },
}
