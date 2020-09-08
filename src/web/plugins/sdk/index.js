import API from '~/plugins/sdk/api'
import Assets from '~/plugins/sdk/assets'
import Auth from '~/plugins/sdk/auth'
import Metadata from '~/plugins/sdk/metadata'
import Video from '~/plugins/sdk/video'

export default (context, inject) => {
  const api = API(context)

  const apollo = context.app.apolloProvider.clients
  const sdk = {
    Assets: new Assets(context, api),
    Auth: new Auth(context, apollo.auth, api),
    Metadata: new Metadata(context, apollo.defaultClient),
    Video: new Video(context, api),
  }

  inject('sdk', sdk)
}
