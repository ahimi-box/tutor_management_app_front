<template>
  <v-app>
    <h2 class="mt-2">
      先生一覧
    </h2>
    <!-- <h2>ログイン状態:{{ $auth.loggedIn }}</h2>
    <p>{{ user }}</p> -->
    <!-- <p>{{ $auth.user }}</p>
    <p>{{ $store.state.auth.user }}</p> -->
    <!-- <Notification v-if="errors" :messages="errors" /> -->
    <v-data-table
      :headers="headers"
      :items="teachers"
      :search="search"
      class="elevation-1"
    >
      <template #top>
        <v-toolbar
          flat
        >
          <v-dialog
            v-model="dialog"
            max-width="650px"
          >
            <template #activator="{ on, attrs }">
              <v-btn
                color="primary"
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
              >
                先生追加
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
                <v-spacer />
                <v-icon
                  x-large
                  color="black"
                  @click="close"
                >
                  mdi-close-box-outline
                </v-icon>
              </v-card-title>
              <!-- 編集dialog -->
              <v-card-text v-if="editedIndex > -1">
                <v-container>
                  <v-row>
                    <v-col
                      cols="6"
                    >
                      <v-avatar
                        size="200"
                      >
                        <v-img
                          v-model="teacherItem.teacher_icon_url"
                          :src="setImage()"
                        />
                      </v-avatar>
                      <v-file-input
                        v-model="image"
                        class="mt-3"
                        truncate-length="15"
                        label="File input"
                        prepend-icon="mdi-camera"
                        outlined
                        dense
                        @change="uploadFile()"
                      />
                    </v-col>
                    <v-col
                      cols="6"
                    >
                      <v-text-field
                        v-model="teacherItem.name"
                        label="名前"
                      />
                      <v-text-field
                        v-model="teacherItem.email"
                        label="メールアドレス"
                      />
                      <v-select
                        v-model="teacherItem.subjects"
                        :items="items"
                        attach
                        label="担当教科"
                        multiple
                      />
                    </v-col>
                    <v-col
                      cols="12"
                    >
                      <v-textarea
                        v-model="teacherItem.introduction"
                        outlined
                        label="自己紹介"
                      />
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <!-- 先生追加dialog -->
              <v-card-text v-else>
                <Notification v-if="errors" :messages="errors" />
                <v-form>
                  <v-text-field
                    v-model="addItem.name"
                    prepend-icon="mdi-account-circle"
                    label="名前"
                  />
                  <v-text-field
                    v-model="addItem.email"
                    prepend-icon="mdi-account-circle"
                    label="メールアドレス"
                  />
                  <v-text-field
                    v-model="addItem.password"
                    :type="showPassword ? 'text' : 'password'"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    prepend-icon="mdi-lock"
                    label="パスワード"
                    @click:append="showPassword = !showPassword"
                  />
                  <v-text-field
                    v-model="addItem.password_confirmation"
                    :type="showPassword ? 'text' : 'password'"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    prepend-icon="mdi-lock"
                    label="パスワード再確認"
                    @click:append="showPassword = !showPassword"
                  />
                </v-form>
              </v-card-text>

              <v-card-actions>
                <v-dialog>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-if="editedIndex > -1"
                      color="primary"
                      dark
                      block
                      class="mb-2"
                      v-bind="attrs"
                      @click="save"
                      v-on="on"
                    >
                      編集
                    </v-btn>
                    <v-btn
                      v-else
                      color="primary"
                      dark
                      block
                      class="mb-2"
                      v-bind="attrs"
                      @click="save"
                      v-on="on"
                    >
                      新規登録
                    </v-btn>
                  </template>
                </v-dialog>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="300px">
            <v-card>
              <v-card-title class="text-h5">
                本当に削除しますか？
              </v-card-title>
              <v-card-actions>
                <v-spacer />
                <v-btn color="blue darken-1" text @click="closeDelete">
                  キャンセル
                </v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">
                  削除
                </v-btn>
                <v-spacer />
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-spacer />
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          />
        </v-toolbar>
      </template>
      <template #[`item.actions`]="{ item }">
        <v-icon
          small
          class="mr-2"
          color="primary"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          color="error"
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
    <!-- <div>
      <p>{{ teachers }}</p>
    </div> -->
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'TeacherIndex',
  data: () => ({
    dialog: false,
    dialogDelete: false,
    search: '',
    showPassword: false,
    errors: null,
    addItem: {
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    },
    teachers: [],
    headers: [
      {
        text: '名前',
        align: 'start',
        sortable: false,
        value: 'name',
        width: '90%'
      },
      { text: '編集/削除', value: 'actions', sortable: false }
    ],
    editedIndex: -1,
    teacherItem: {
      name: '',
      email: '',
      teacher_icon_url: '',
      introduction: '',
      subjects: []
    },
    defaultItem: {
      name: '',
      email: '',
      teacher_icon_url: '',
      introduction: '',
      subjects: []
    },
    image: null,
    items: ['国語', '算数', '理科', '社会', '英語']
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? '新規登録(先生)' : '編集'
    },
    ...mapGetters({
      user: 'user_information/getUser'
    })
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    }
  },

  mounted () {
    // this.$axios
    //   .get('/api/v1/teachers')
    //   .then((response) => {
    //     this.teachers = response.data
    //   })
    this.fetchContents()
  },

  methods: {
    fetchContents () {
      this.$axios
        .get('/api/v1/teachers')
        .then((response) => {
          this.teachers = response.data
          // console.log(this.teachers)
        })
    },
    setImage () {
      if (this.teacherItem.teacher_icon_url) {
        return this.teacherItem.teacher_icon_url
      } else {
        return '/img/default_icon.png'
      }
    },

    uploadFile () {
      if (this.image) {
        this.teacherItem.teacher_icon_url = URL.createObjectURL(this.image)
        return this.teacherItem.teacher_icon_url
      } else {
        return '/img/default_icon.png'
      }
    },

    editItem (item) {
      this.editedIndex = this.teachers.indexOf(item)
      this.teacherItem = Object.assign({}, item)
      this.teacherItem.subjects = this.teacherItem.subjects.map(subjects => subjects.subject)
      console.log(this.teacherItem.subjects)
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = this.teachers.indexOf(item)
      this.teacherItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm () {
      this.teachers.splice(this.editedIndex, 1)
      this.$axios.delete(`/api/v1/teachers/${this.teacherItem.id}`)
        .then((res) => {
          this.fetchContents()
          this.$store.dispatch(
            'flashMessage/showMessage',
            {
              message: '先生情報を削除しました',
              type: 'error',
              status: true
            }
          )
          this.closeDelete()
        })
    },

    close () {
      this.dialog = false
      this.image = null
      this.$nextTick(() => {
        this.teacherItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.teacherItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save () {
      if (this.editedIndex > -1) {
        // 更新
        const formData = new FormData()
        if (this.image) {
          formData.append('teacher_icon', this.image)
        }
        formData.append('id', this.teacherItem.id)
        formData.append('name', this.teacherItem.name)
        formData.append('introduction', this.teacherItem.introduction)
        if (this.teacherItem.subjects) {
          this.teacherItem.subjects.forEach((text) => {
            formData.append('subject[]', text)
          })
        }
        const config = {
          headers: {
            'content-type': 'multipart/form-data'
          }
        }
        const url = `/api/v1/teachers/${this.teacherItem.id}`
        console.log(this.teacherItem)
        // this.$axios.$patch('/api/v1/teacher_auth', this.editedItem)
        // Object.assign(this.teachers[this.editedIndex], this.editedItem)
        this.$axios.put(url, formData, config)
          .then((res) => {
            this.fetchContents()
            this.$store.dispatch(
              'flashMessage/showMessage',
              {
                message: '先生情報を更新しました',
                type: 'info',
                status: true
              }
            )
          })
      } else {
        // 新規登録
        this.$axios.post('/api/v1/teacher_auth', this.addItem)
          .then((response) => {
            // this.teachers.push(this.addItem)
            this.addItem.name = ''
            this.addItem.email = ''
            this.addItem.password = ''
            this.addItem.password_confirmation = ''
            this.errors = ''
            this.fetchContents()
            this.$store.dispatch(
              'flashMessage/showMessage',
              {
                message: '新規登録しました',
                type: 'success',
                status: true
              },
              { root: true }
            )
          })
          .catch((e) => {
            this.errors = e.response.data.errors.full_messages
            this.$store.dispatch(
              'flashMessage/showMessage',
              {
                message: '先生追加できませんでした。',
                type: 'error',
                status: true
              }
            )
          })
      }
      this.close()
    }
  }
}
</script>
