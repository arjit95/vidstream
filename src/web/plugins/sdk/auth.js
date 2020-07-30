export default class {
  constructor({ store }) {
    this.store = store
  }

  isLoggedIn() {
    return !!this.store.state.auth.token
  }
}
