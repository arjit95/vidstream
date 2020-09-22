import SearchQuery from '~/plugins/sdk/queries/recommendation/search'
import RelatedVideoQuery from '~/plugins/sdk/queries/recommendation/relatedVideos'

export default class {
  constructor({ store }, api) {
    this.store = store
    this.api = api
  }

  async search(query) {
    try {
      const response = await this.api.query({
        query: SearchQuery,
        variables: { query },
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data.search
    } catch (error) {
      return { error }
    }
  }

  async getRelatedVideos(videoId) {
    try {
      const response = await this.api.query({
        query: RelatedVideoQuery,
        variables: { id: videoId },
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data.getRelatedVideos
    } catch (error) {
      return { error }
    }
  }
}
