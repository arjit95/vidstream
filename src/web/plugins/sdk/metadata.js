import ChannelQuery from '~/plugins/sdk/queries/metadata/channels'

export default class {
  constructor({ store }, api) {
    this.store = store
    this.api = api
  }

  async getUserChannels(username) {
    try {
      const payload = username
        ? { username }
        : { username: this.store.state.app.userInfo.username }

      const response = await this.api.query({
        query: ChannelQuery,
        variables: payload,
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data
    } catch (error) {
      return { error }
    }
  }

  async getUserVideos(channelId, username) {
    try {
      let channels

      if (channelId) {
        channels = Array.isArray(channelId) ? channelId : [channelId]
      } else {
        channels = await this.getUserChannels(username)
        if (channels.error) {
          return channels
        }
        channels = channels.map(({ id }) => id)
      }

      const data = await this.api.post('/api/metadata/user/videos', {
        token: this.store.state.auth.token,
        channels,
      })

      return data
    } catch (error) {
      return { error }
    }
  }
}
