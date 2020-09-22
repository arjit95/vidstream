import API from '~/plugins/sdk/api'
import Assets from '~/plugins/sdk/assets'
import Auth from '~/plugins/sdk/auth'
import Metadata from '~/plugins/sdk/metadata'
import Video from '~/plugins/sdk/video'
import Recommendations from '~/plugins/sdk/recommendations'
import Utils from '~/plugins/sdk/utils'

export default (context, inject) => {
  const api = API(context)

  const apollo = context.app.apolloProvider.clients
  const sdk = {
    Assets: new Assets(context, apollo.defaultClient, api),
    Auth: new Auth(context, apollo.auth, api),
    Metadata: new Metadata(context, apollo.defaultClient),
    Video: new Video(context, apollo.defaultClient),
    Recommendations: new Recommendations(context, apollo.recommendations),
    Utils,
  }

  inject('sdk', sdk)
}
