export default function ({ store, redirect }) {
  const expiry = store.state.auth.expiry
  const now = Date.now()
  if (expiry && expiry > now) {
    return
  }

  if (!store.state.app.userInfo.isLoggedIn) {
    redirect('/login')
  }
}
