export default (context) => {
  return {
    httpEndpoint: context.$config.apiURL + '/api/recommendation',
    httpLinkOptions: {
      credentials: 'include',
    },
  }
}
