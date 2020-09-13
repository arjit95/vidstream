export default function ({ store, redirect }) {
  if (store.state.app.userInfo.isLoggedIn) {
    redirect('/')
  }
}
