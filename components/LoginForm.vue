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
                  v-model="email"
                  prepend-icon="mdi-account-circle"
                  label="メールアドレス"
                />
                <v-text-field
                  v-model="password"
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
              <!-- <p>email: sample@email.com</p> -->
              <p>email: student-#{n+1}@email.com</p>
              <!-- <p>email: teacher@email.com</p> -->
              <p>email: teacher-#{n+1}@email.com</p>
              <p>email: teacher-admin@email.com</p>
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
    },
    loginUser: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      showPassword: false,
      email: '',
      password: '',
      errors: null,
      user: {}
    }
  },

  methods: {
    async login () {
      await this.$auth
        // .loginWith('student', {
        .loginWith(this.loginUser, {
          // emailとpasswordの情報を送信
          data: {
            email: this.email,
            password: this.password
          }
        })
        .then(
          (response) => {
            console.log(response)
            // 認証に必要な情報をlocalStorageに保存
            localStorage.setItem('access-token', response.headers['access-token'])
            localStorage.setItem('client', response.headers.client)
            localStorage.setItem('uid', response.headers.uid)
            localStorage.setItem('token-type', response.headers['token-type'])
            this.user = response.data.data
            console.log(this.user)
            this.$store.dispatch('user_information/setUser', this.user)
            // this.$router.push('/')
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
          this.errors = e.response.data.errors
        })
    },
    authenticate () {
      this.$auth.loginWith('app')
    },
    setRouter () {
      if (!this.user.admin) {
        if (this.loginUrl === '/api/v1/auth/sign_in') {
          return '/student/student_account'
        } else {
          return '/teacher/teacher_account'
        }
      } else {
        return '/admin/teacher_index'
      }
    }
  }
}
</script>
