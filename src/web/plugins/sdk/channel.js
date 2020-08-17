export default class {
  constructor({ store }, api) {
    this.store = store
    this.api = api
  }

  async getUserChannels() {
    try {
      const {
        data: { result },
      } = await this.api.post('/api/metadata/user/channels', {
        token: this.store.state.auth.token,
      })

      return result
    } catch (err) {
      return { error: err.response.data.error }
    }
  }
}
