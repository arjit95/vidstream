import axios from 'axios'

export default (context) => {
  const api = axios.create({
    baseURL: context.$config.apiURL,
    withCredentials: true,
  })

  api.interceptors.response.use(
    (res) => res.data,
    (err) => {
      if (!err.response) {
        throw new Error('Empty response from server')
      }

      if (err.response.status === 404) {
        return context.redirect('/404')
      }

      throw err.response.data
    }
  )

  return api
}
