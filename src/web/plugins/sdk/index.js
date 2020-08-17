import axios from 'axios'
import Assets from '~/plugins/sdk/assets'
import Auth from '~/plugins/sdk/auth'
import Channel from '~/plugins/sdk/channel'
import Video from '~/plugins/sdk/video'

export default (context, inject) => {
  const api = axios.create({
    baseURL: context.$env.API_URL,
  })

  const sdk = {
    Assets: new Assets(context, api),
    Auth: new Auth(context, api),
    Channel: new Channel(context, api),
    Video: new Video(context, api),
  }

  inject('sdk', sdk)
}
