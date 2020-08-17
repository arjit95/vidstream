export default class {
  constructor({ store }, api) {
    this.store = store
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
      return { error: null }
    } catch (err) {
      return { error: err.response.data.error }
    }
  }
}
