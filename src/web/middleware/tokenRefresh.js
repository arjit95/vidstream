export default async function ({ store, $sdk }) {
  const expiry = store.state.auth.expiry
  const now = Date.now()
  if (expiry && expiry > now) {
    return
  }

  if (!store.state.app.userInfo.isLoggedIn) {
    return
  }

  // Successful refresh
  await $sdk.Auth.refresh()
}
