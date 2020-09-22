export default class {
  constructor({ store }, apollo, api) {
    this.store = store
    this.apollo = apollo
    this.api = api
  }

  async upload(url, payload) {
    try {
      const headers = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }

      await this.api.post(url, payload, headers)
      return { error: null }
    } catch (err) {
      return { error: err.response?.data.error || err.error }
    }
  }

  uploadVideo(payload) {
    return this.upload('/api/upload/video', payload)
  }

  uploadUserProfile(payload) {
    return this.upload('/api/upload/user/profile', payload)
  }

  uploadUserBanner(payload) {
    return this.upload('/api/upload/user/profile/banner', payload)
  }

  uploadChannelProfile(payload) {
    return this.upload('/api/upload/user/channel', payload)
  }

  uploadChannelBanner(payload) {
    return this.upload('/api/upload/user/channel/banner', payload)
  }
}
