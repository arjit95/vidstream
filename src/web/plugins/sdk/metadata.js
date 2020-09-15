import ChannelsQuery from '~/plugins/sdk/queries/metadata/channels'
import VideosQuery from '~/plugins/sdk/queries/metadata/videos'
import UserQuery from '~/plugins/sdk/queries/metadata/user'
import ChannelQuery from '~/plugins/sdk/queries/metadata/channel'
import SubscriptionsQuery from '~/plugins/sdk/queries/metadata/subscriptions'
import RecentVideosQuery from '~/plugins/sdk/queries/metadata/recents'
import TrendingVideosQuery from '~/plugins/sdk/queries/metadata/trending'
import AddSubscription from '~/plugins/sdk/mutations/metadata/addSubscription'
import RemoveSubscription from '~/plugins/sdk/mutations/metadata/removeSubscription'
import IsSubscribed from '~/plugins/sdk/queries/metadata/isSubscribed'
import EditChannel from '~/plugins/sdk/mutations/metadata/editChannel'
import EditUser from '~/plugins/sdk/mutations/metadata/editUser'
import MinimalSubscriptions from '~/plugins/sdk/queries/metadata/subscriptionsMin'
import CommentsQuery from '~/plugins/sdk/queries/metadata/comments'
import AddComment from '~/plugins/sdk/mutations/metadata/addComment'

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

  async getSubscriptions(minimal = false) {
    try {
      const response = await this.api.query({
        query: minimal ? MinimalSubscriptions : SubscriptionsQuery,
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

  async editChannelInfo(id, title, description) {
    try {
      const response = await this.api.mutate({
        mutation: EditChannel,
        variables: { channel: { id, title, description } },
        context: {
          headers: {
            Authorization: `Bearer ${this.store.state.auth.token}`,
          },
        },
      })

      if (response.errors) {
        return response.errors[0].message
      }

      return response.data.editChannel
    } catch (error) {
      return { error }
    }
  }

  async editUserInfo(name, description) {
    try {
      const response = await this.api.mutate({
        mutation: EditUser,
        variables: { user: { name, description } },
        context: {
          headers: {
            Authorization: `Bearer ${this.store.state.auth.token}`,
          },
        },
      })

      if (response.errors) {
        return response.errors[0].message
      }

      return response.data.editUser
    } catch (error) {
      return { error }
    }
  }

  async getComments(videoId, parentId) {
    try {
      const response = await this.api.query({
        query: CommentsQuery,
        variables: { video_id: videoId, parent_id: parentId },
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data.getComments
    } catch (error) {
      return { error }
    }
  }

  async addComment(videoId, content, parent = null) {
    try {
      const response = await this.api.mutate({
        mutation: AddComment,
        variables: { video_id: videoId, content, parent },
        context: {
          headers: {
            Authorization: `Bearer ${this.store.state.auth.token}`,
          },
        },
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data.addComment
    } catch (error) {
      return { error }
    }
  }
}
