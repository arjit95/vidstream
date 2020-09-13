export default class {
  constructor({ store }, apollo, api) {
    this.store = store
    this.apollo = apollo
    this.api = api
  }

  async uploadVideo(payload) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }

    try {
      await this.api.post('/api/upload/video', payload, config)
      this.apollo.cache.reset()
      return { error: null }
    } catch (err) {
      return { error: err.response.data.error }
    }
  }
}
