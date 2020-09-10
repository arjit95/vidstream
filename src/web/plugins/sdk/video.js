import VideoQuery from '~/plugins/sdk/queries/metadata/video'

export default class {
  constructor({ store }, api) {
    this.store = store
    this.api = api
  }

  async getInfo(id) {
    try {
      const response = await this.api.query({
        query: VideoQuery,
        variables: { id },
      })

      if (response.errors) {
        throw response.errors[0].message
      }

      return response.data.video
    } catch (error) {
      return { error }
    }
  }
}
