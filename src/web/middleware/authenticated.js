export default async function ({ store, $sdk, redirect }) {
  const expiry = store.state.auth.expiry
  const now = Date.now()
  if (expiry && expiry > now) {
    return
  }

  if (!store.state.app.userInfo.isLoggedIn) {
    redirect('/login')
    return
  }

  const { error } = await $sdk.Auth.refresh()
  if (error) {
    return redirect('/login')
  }
}
