export default (context) => {
  return {
    httpEndpoint: context.$config.apiURL + '/api/metadata',
    httpLinkOptions: {
      credentials: 'include',
    },
  }
}
