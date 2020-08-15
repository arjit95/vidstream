export default class {
  constructor({ store, $axios }) {
    this.store = store
    this.$axios = $axios
  }

  login({ username, password }) {
    return this.$axios.post('/api/auth/login/local', {
      username,
      password,
    })
  }

  register({ username, password, email }) {
    return this.$axios.post('/api/auth/register/local', {
      username,
      password,
      email,
    })
  }

  isLoggedIn() {
    return !!this.store.state.auth.token
  }
}
