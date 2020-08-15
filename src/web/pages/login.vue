<template>
  <v-container align="center" justify="center" fluid>
    <v-row justify="center">
      <v-col md="4">
        <v-card class="mx-auto" outlined>
          <v-list-item>
            <v-list-item-avatar
              ><nuxt-link to="/"
                ><v-icon>mdi-arrow-left</v-icon></nuxt-link
              ></v-list-item-avatar
            >
            <v-list-item-content>
              <v-list-item-title class="headline">Login</v-list-item-title>
              <v-list-item-subtitle
                >Sign in to your vidstream account</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
          <v-card-text>
            <v-text-field
              v-model="login.username"
              type="text"
              name="username"
              label="Username"
            />
            <v-text-field
              v-model="login.password"
              type="password"
              name="password"
              label="Password"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn text color="accent" @click="doLogin">LOGIN</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col md="4" offset-md="1">
        <v-card class="mx-auto" outlined>
          <v-list-item>
            <v-list-item-avatar
              ><nuxt-link to="/"
                ><v-icon>mdi-arrow-left</v-icon></nuxt-link
              ></v-list-item-avatar
            >
            <v-list-item-content>
              <v-list-item-title class="headline">Register</v-list-item-title>
              <v-list-item-subtitle
                >Create your new account</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
          <v-card-text>
            <v-text-field
              v-model="register.email"
              type="email"
              name="email"
              label="Email Address"
            />
            <v-text-field
              v-model="register.username"
              type="text"
              name="username"
              label="Username"
            />
            <v-text-field
              v-model="register.password"
              type="password"
              name="password"
              label="Password"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn text color="secondary" @click="doRegister">REGISTER</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
</style>
<script>
export default {
  layout: 'simple',
  name: 'Login',
  middleware: 'notAuthenticated',
  data() {
    return {
      login: {
        username: '',
        password: '',
      },
      register: {
        username: '',
        password: '',
        email: '',
      },
    }
  },
  methods: {
    async doRegister() {
      const response = await this.$sdk.Auth.register(this.register)
      if (response.error) {
        return alert(response.error)
      }

      alert('Register')
    },

    async doLogin() {
      const response = await this.$sdk.Auth.login(this.login)
      if (response.error) {
        return alert(response.error)
      }

      this.$store.auth.commit('setAuth', response.token)
      // this.$router.push('/')
    },
  },
}
</script>
