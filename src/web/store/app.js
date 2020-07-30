export const state = () => ({
  darkMode: true,
})

export const mutations = {
  toggleDarkMode(state, mode) {
    state.darkMode = mode
  },
}
