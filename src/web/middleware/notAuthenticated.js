export default async function ({ store, $sdk, redirect }) {
  const expiry = store.state.auth.expiry
  const now = Date.now()
  if (expiry && expiry > now) {
    redirect('/')
    return
  }

  if (!store.state.app.userInfo.isLoggedIn) {
    return
  }

  // Successful refresh
  const { error } = await $sdk.Auth.refresh()
  if (!error) {
    return redirect('/login')
  }
}
