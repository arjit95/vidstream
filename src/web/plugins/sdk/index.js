import Stream from '~/plugins/sdk/stream'
import Auth from '~/plugins/sdk/auth'

export default (context, inject) => {
  const sdk = {
    Stream: new Stream(context),
    Auth: new Auth(context),
  }

  inject('sdk', sdk)
}
