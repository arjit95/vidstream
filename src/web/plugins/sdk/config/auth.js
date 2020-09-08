export default (context) => {
  return {
    httpEndpoint: context.$config.apiURL + '/api/auth',
    httpLinkOptions: {
      credentials: 'include',
    },
  }
}
