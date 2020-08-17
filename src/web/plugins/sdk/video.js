export default class {
  constructor({ store }, api) {
    this.store = store
    this.api = api
  }

  async getInfo(videoId) {
    try {
      const result = await this.api.post(
        `/api/metadata/video/info/${videoId}`,
        {
          token: this.store.state.auth.token,
        }
      )

      return result
    } catch (err) {
      return { error: err.response.data.error }
    }
  }
}
