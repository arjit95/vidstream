import ChannelsQuery from '~/plugins/sdk/queries/metadata/channels'
import VideosQuery from '~/plugins/sdk/queries/metadata/videos'
import UserQuery from '~/plugins/sdk/queries/metadata/user'
import ChannelQuery from '~/plugins/sdk/queries/metadata/channel'
import SubscriptionsQuery from '~/plugins/sdk/queries/metadata/subscriptions'
import RecentVideosQuery from '~/plugins/sdk/queries/metadata/recents'
import TrendingVideosQuery from '~/plugins/sdk/queries/metadata/trending'
import AddSubscription from '~/plugins/sdk/queries/metadata/addSubscription'
import RemoveSubscription from '~/plugins/sdk/queries/metadata/removeSubscription'
import IsSubscribed from '~/plugins/sdk/queries/metadata/isSubscribed'

export default class {
  constructor({ store }, api) {
    this.store = store
    this.api = api
  }

  async isSubscribed(id) {
    try {
      const response = await this.api.query({
        query: IsSubscribed,
        variables: { id, pagination: { take: 1, skip: 0 } },
        context: {
          headers: {
            Authorization: `Bearer ${this.store.state.auth.token}`,
          },
        },
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data.getSubscriptions.total > 0
    } catch (error) {
      return { error }
    }
  }

  async removeSubscription(id) {
    try {
      const response = await this.api.mutate({
        mutation: RemoveSubscription,
        variables: { id },
        context: {
          headers: {
            Authorization: `Bearer ${this.store.state.auth.token}`,
          },
        },
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      this.api.cache.reset()
      return response.data.removeSubscription
    } catch (error) {
      return { error }
    }
  }

  async addSubscription(id) {
    try {
      const response = await this.api.mutate({
        mutation: AddSubscription,
        variables: { id },
        context: {
          headers: {
            Authorization: `Bearer ${this.store.state.auth.token}`,
          },
        },
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      this.api.cache.reset()
      return response.data.addSubscription
    } catch (error) {
      return { error }
    }
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

  async getChannel(id) {
    try {
      const response = await this.api.query({
        query: ChannelQuery,
        variables: { id },
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data.channel
    } catch (error) {
      return { error }
    }
  }

  async getUserVideos(channelId, username) {
    try {
      const response = await this.api.query({
        query: VideosQuery,
        variables: { channel_id: channelId, username },
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data.videos
    } catch (error) {
      return { error }
    }
  }

  async getRecentVideos(query = RecentVideosQuery, key = 'recentVideos') {
    try {
      const response = await this.api.query({
        query,
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data[key]
    } catch (error) {
      return { error }
    }
  }

  getTrendingVideos() {
    return this.getRecentVideos(TrendingVideosQuery, 'trending')
  }

  async getSubscriptions() {
    try {
      const response = await this.api.query({
        query: SubscriptionsQuery,
        context: {
          headers: {
            Authorization: `Bearer ${this.store.state.auth.token}`,
          },
        },
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data.getSubscriptions
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
