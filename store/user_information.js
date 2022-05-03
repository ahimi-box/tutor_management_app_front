export const state = () => ({
  user: 'null'
})

export const mutations = {
  login (state, payload) {
    state.user = payload
  },
  logout (state) {
    state.user = null
  }
}

export const actions = {
  setUser (context, user) {
    context.commit('login', user)
  }
}

export const getters = {
  getUser: state => state.user
}
