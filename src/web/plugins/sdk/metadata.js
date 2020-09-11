import ChannelsQuery from '~/plugins/sdk/queries/metadata/channels'
import VideosQuery from '~/plugins/sdk/queries/metadata/videos'
import UserQuery from '~/plugins/sdk/queries/metadata/user'

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
        query: ChannelsQuery,
        variables: payload,
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data.channels
    } catch (error) {
      return { error }
    }
  }

  async getUserVideos(channelId, username) {
    try {
      const response = await this.api.query({
        query: VideosQuery,
        variables: { channelId, username },
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data.videos
    } catch (error) {
      return { error }
    }
  }

  async getUser(username) {
    try {
      const response = await this.api.query({
        query: UserQuery,
        variables: { username },
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data.user
    } catch (error) {
      return { error }
    }
  }
}
