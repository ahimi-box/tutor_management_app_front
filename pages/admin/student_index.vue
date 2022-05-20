<template>
  <v-app>
    <h2 class="mt-2">
      生徒一覧
    </h2>
    <v-data-table
      :headers="headers"
      :items="students"
      :search="search"
      class="elevation-1"
    >
      <template #[`item.name`]="{ item }">
        <span>
          {{ item.name }}さん
        </span>
      </template>
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
                生徒追加
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
                <span>{{ studentItem.name }}さん (生徒)</span>
                <v-container>
                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-text-field
                        v-model="studentItem.name"
                        prepend-icon="mdi-account-circle"
                        label="名前"
                      />
                      <v-text-field
                        v-model="studentItem.email"
                        prepend-icon="mdi-email"
                        label="メールアドレス"
                      />
                      <section>
                        <p>{{ message }}</p>
                        <v-col
                          cols="6"
                        >
                          <v-text-field
                            v-model="studentItem.post_code"
                            prepend-icon="mdi-home-variant-outline"
                            label="郵便番号"
                          >
                            <template #append-outer>
                              <v-btn
                                color="primary"
                                @click="searchAddressInfo"
                              >
                                検索
                              </v-btn>
                            </template>
                          </v-text-field>
                        </v-col>
                      </section>
                      <v-text-field
                        v-model="studentItem.address"
                        label="住所"
                      />
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <v-dialog
                          ref="dialog"
                          v-model="modal"
                          :return-value.sync="studentItem.birthday"
                          persistent
                          width="290px"
                        >
                          <template #activator="{ on, attrs }">
                            <v-text-field
                              v-model="studentItem.birthday"
                              label="生年月日"
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            />
                          </template>
                          <v-date-picker
                            v-model="studentItem.birthday"
                            scrollable
                          >
                            <v-spacer />
                            <v-btn
                              text
                              color="primary"
                              @click="modal = false"
                            >
                              キャンセル
                            </v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.dialog.save(studentItem.birthday)"
                            >
                              <!-- @click="$refs.dialog.save(date)" -->
                              OK
                            </v-btn>
                          </v-date-picker>
                        </v-dialog>
                      </v-col>
                      <!-- <p>{{ studentItem.teacher_ids }}</p> -->
                      <!-- <p>{{ studentItem.teachers_students }}</p> -->
                      <v-select
                        v-model="studentItem.teacher_ids"
                        item-text="name"
                        item-value="id"
                        :items="teachers"
                        prepend-icon="mdi-account-circle"
                        attach
                        label="担当の先生"
                        multiple
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
                    prepend-icon="mdi-email"
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
                  <!-- <p>{{ addItem.teacher_ids }}</p> -->
                  <v-select
                    v-model="addItem.teacher_ids"
                    item-text="name"
                    item-value="id"
                    :items="teachers"
                    prepend-icon="mdi-account-circle"
                    attach
                    label="担当の先生"
                    multiple
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
      <p>{{ addItem.teacher_id }}</p>
      <p>{{ students }}</p>
      <p>{{ teachers }}</p>
    </div> -->
  </v-app>
</template>

<script>
export default {
  name: 'StudentIndex',
  data: () => ({
    modal: false,
    dialog: false,
    dialogDelete: false,
    search: '',
    showPassword: false,
    errors: null,
    addItem: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      teacher_ids: []
    },
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
    students: [],
    teachers: [],
    editedIndex: -1,
    studentItem: {
      name: '',
      post_code: '',
      address: '',
      birthday: '',
      teacher_ids: []
    },
    defaultItem: {
      name: '',
      post_code: '',
      address: '',
      birthday: '',
      teacher_ids: []
    },
    addressData: {},
    message: ''
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? '新規登録(生徒)' : '編集'
    }
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
    this.fetchContents()
    this.teacherSelects()
  },

  methods: {
    fetchContents () {
      this.$axios
        .get('/api/v1/students')
        .then((response) => {
          this.students = response.data
        })
    },
    teacherSelects () {
      this.$axios
        .get('/api/v1/teachers')
        .then((response) => {
          this.teachers = response.data
        })
    },

    // 郵便番号検索
    searchAddressInfo () {
      const axios = require('axios')
      const url = 'http://zipcloud.ibsnet.co.jp/api/search?zipcode='
      axios.get(url + this.studentItem.post_code).then((res) => {
        if (res.data.results == null) {
          this.message = 'no data'
        }
        this.addressData = res.data.results[0]
        this.studentItem.address = this.addressData.address1 + this.addressData.address2 + this.addressData.address3
      }).catch((error) => {
        console.log(error)
        this.message = 'error'
      })
    },

    // pickerInfo () {
    //   if (this.studentItem.birthday) {
    //     return this.studentItem.birthday
    //   } else {
    //     // this.studentItem.birthday = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
    //   }
    // },

    editItem (item) {
      this.editedIndex = this.students.indexOf(item)
      this.studentItem = Object.assign({}, item)
      this.studentItem.teacher_ids = this.studentItem.teachers_students.map(t => t.teacher_id)
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = this.students.indexOf(item)
      this.studentItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm () {
      this.students.splice(this.editedIndex, 1)
      this.$axios.delete(`/api/v1/students/${this.studentItem.id}`)
        .then((res) => {
          this.fetchContents()
          this.$store.dispatch(
            'flashMessage/showMessage',
            {
              message: '生徒情報を削除しました',
              type: 'error',
              status: true
            }
          )
          this.closeDelete()
        })
    },

    close () {
      this.dialog = false
      this.$nextTick(() => {
        this.studentItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.studentItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save () {
      // 編集
      if (this.editedIndex > -1) {
        // this.$axios.put('/api/v1/auth', this.studentItem)
        this.$axios.patch(`/api/v1/students/${this.studentItem.id}`, this.studentItem)
          .then((res) => {
            this.fetchContents()
            this.$store.dispatch(
              'flashMessage/showMessage',
              {
                message: '生徒情報を更新しました',
                type: 'info',
                status: true
              }
            )
          })
      } else {
        // 新規登録
        this.$axios.post('/api/v1/auth', this.addItem)
          .then((response) => {
            // this.teachers.push(this.addItem)
            this.addItem.name = ''
            this.addItem.email = ''
            this.addItem.password = ''
            this.addItem.password_confirmation = ''
            this.addItem.teacher_ids = ''
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
                message: '生徒追加できませんでした。',
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
