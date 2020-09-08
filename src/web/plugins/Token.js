export default class {
  static timer = null

  static async startTimer($sdk, $store) {
    const expiry = $store.state.auth.expiry
    const remaining = Date.now() - (expiry + 3 * 60) // Refresh before 3mins of actual expiration

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (remaining <= 0) {
      const { error } = await $sdk.Auth.refresh()
      if (error) {
        return
      }
    }

    this.timer = setTimeout(() => this.startTimer($sdk, $store), remaining)
  }
}
