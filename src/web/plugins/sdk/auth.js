export default class {
  constructor({ store }, api) {
    this.store = store
    this.api = api
  }

  async login({ username, password }) {
    try {
      const response = await this.api.post('/api/auth/login/local', {
        username,
        password,
      })

      this.store.commit('auth/setAuth', response.data.token)
      return { error: null }
    } catch (err) {
      return { error: err.response.data.error }
    }
  }

  async register({ username, password, email }) {
    try {
      const response = await this.api.post('/api/auth/register/local', {
        username,
        password,
        email,
      })

      if (response.status === 200) {
        this.store.commit('auth/setAuth', response.data.token)
        return { error: null }
      }
    } catch (err) {
      return { error: err.response.data.error }
    }
  }

  isLoggedIn() {
    return !!this.store.state.auth.token
  }
}
