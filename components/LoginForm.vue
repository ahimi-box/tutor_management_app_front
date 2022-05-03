<template>
  <v-main>
    <v-container>
      <v-row justify="center" align="center">
        <v-col cols="8">
          <v-card>
            <v-card-title>
              {{ title }}
            </v-card-title>
            <Notification v-if="errors" :messages="errors" />
            <v-card-text>
              <v-form>
                <v-text-field
                  v-model="login_info.email"
                  prepend-icon="mdi-account-circle"
                  label="メールアドレス"
                />
                <v-text-field
                  v-model="login_info.password"
                  :type="showPassword ? 'text' : 'password'"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  prepend-icon="mdi-lock"
                  label="パスワード"
                  @click:append="showPassword = !showPassword"
                />
              </v-form>
              <v-card-actions>
                <v-btn
                  block
                  color="info"
                  @click="login()"
                >
                  ログイン
                </v-btn>
              </v-card-actions>
              <v-card-actions>
                <router-link :to="link">
                  {{ linkTitle }}
                </router-link>
              </v-card-actions>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    linkTitle: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    },
    loginUrl: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      auth: false,
      showPassword: false,
      user: {},
      errors: null,
      login_info: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    async login () {
      await this.$axios.post(this.loginUrl, this.login_info)
        .then(
          (response) => {
            console.log(response)
            localStorage.setItem('access-token', response.headers['access-token'])
            localStorage.setItem('client', response.headers.client)
            localStorage.setItem('uid', response.headers.uid)
            localStorage.setItem('token-type', response.headers['token-type'])
            this.user = response.data.data
            this.$store.dispatch('user_information/setUser', this.user)
            this.$router.push(this.setRouter())
            this.$store.dispatch(
              'flashMessage/showMessage',
              {
                message: 'ログインしました.',
                type: 'success',
                status: true
              },
              { root: true }
            )
            return response
          }
        )
        .catch((e) => {
          console.log(1)
          this.errors = e.response.data.errors
        })
    },
    authenticate () {
      this.$auth.loginWith('app')
    },
    setRouter () {
      if (!this.user.admin) {
        if (this.loginUrl === '/api/v1/auth/sign_in') {
          // return '/student/student_account'
          return '/'
        } else {
          // return '/teacher/teacher_account'
          return '/'
        }
      } else {
        // return '/admin_teacher_index'
        return '/'
      }
    }
  }
}
</script>
