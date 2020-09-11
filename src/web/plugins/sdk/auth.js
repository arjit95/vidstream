import RegisterMutation from '~/plugins/sdk/queries/auth/register'
import LoginQuery from '~/plugins/sdk/queries/auth/login'
import RefreshQuery from '~/plugins/sdk/queries/auth/refresh'

export default class {
  constructor({ store }, apollo, api) {
    this.store = store
    this.apollo = apollo
    this.api = api
  }

  /**
   * Persist user info in vuex state
   * @param {object} data
   * @property {string} data.token
   * @property {string} data.name
   * @property {string} data.username
   */
  setUserInfo(data) {
    const { token, expiry, username, name } = data
    this.store.commit('auth/setAuth', { token, expiry })

    // Do not store empty metadata
    if (username && name) {
      this.store.commit('app/setUserInfo', { username, name, isLoggedIn: true })
    }
  }

  async logout() {
    await this.api.get('/api/auth/logout')
    this.store.commit('auth/setAuth', {
      token: null,
      expiry: null,
      isLoggedIn: false,
    })

    this.store.commit('app/removeUserInfo')
  }

  async refresh() {
    try {
      const oldToken = this.store.state.auth.token || 'invalidToken'
      const response = await this.apollo.query({
        query: RefreshQuery,
        variables: { token: oldToken },
        client: 'auth',
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      this.setUserInfo(response.data.refresh)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  async login({ username, password }) {
    try {
      const response = await this.apollo.query({
        query: LoginQuery,
        variables: { username, password },
        client: 'auth',
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      this.setUserInfo(response.data.login)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  async register({ username, password, email }) {
    try {
      const response = await await this.apollo.mutate({
        mutation: RegisterMutation,
        variables: { username, password, email },
        client: 'auth',
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      this.setUserInfo(response.data.register)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  isLoggedIn() {
    return !!this.store.state.auth.token
  }
}
