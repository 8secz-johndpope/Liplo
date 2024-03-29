<template>
  <v-layout
    row
    white
    wrap
  >
    <v-snackbar
      v-model="snackbar"
      color="teal lighten-1"
      :multi-line="true"
      :timeout="6000"
      :left="true"
      :bottom="true"
    >
      {{ snackbarText }}
      <v-btn
        color="white"
        flat
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </v-snackbar>
    <!-- loading -->
    <v-flex v-if="isRefreshing == null || isRefreshing" xs12 py-5>
      <v-layout justify-center>
        Now Loading...
      </v-layout>
    </v-flex>
    <v-flex v-else-if="isLoading" xs12 :style="{ height: windowHeight + 'px' }">
      <v-layout align-center justify-center column fill-height>
        Now Loading...
      </v-layout>
    </v-flex>
    <v-flex v-else-if="uid && uid != ''" xs12 class="py-3 break">
      <!-- Profile画像 & UserName -->
      <div class="align-center">
        <v-card flat>
          <v-card-actions
            class="break py-4"
            :class="{
              'px-5': $vuetify.breakpoint.smAndUp,
              'px-3': $vuetify.breakpoint.xsOnly,
            }"
          >
            <v-avatar
              :size="avatarSize"
              class="grey lighten-3 clickable"
            >
              <img v-if="imageUrl" :src="imageUrl" alt="avatar">
            </v-avatar>
            <span
              class="text-color font-weight-bold px-3 headline"
            >
              {{ companyName }}
            </span>
          </v-card-actions>
        </v-card>
      </div>
      <div :class="{'px-5': $vuetify.breakpoint.smAndUp}">
        <!-- 企業の請求一覧 -->
        <div class="pb-3">
          <v-btn
            outline
            color="teal"
            class="ma-0"
            :to="'/admin/companies/' + params.id + '/invoice'"
          >
            企業の請求一覧
          </v-btn>
          <!-- 初回サインアップのメール送信 -->
          <v-btn
            outline
            color="pink"
            class="ma-0 ml-3"
            @click="signUpEmailDialog = true"
          >
            サインアップメール送信
          </v-btn>
          <!-- 最初のメンバー追加 -->
          <v-btn
            outline
            color="pink"
            class="ma-0 ml-3"
            @click="addFirstMemberDialog = true"
          >
            最初のメンバー追加
          </v-btn>
        </div>
        <!-- 削除済み -->
        <div v-if="isDeleted" class="pt-4">
          <span class="orange--text font-weight-bold">削除済み</span>
        </div>
        <!-- email -->
        <div class="pt-4">
          <div v-if="invoiceEmail">
            <span class="text-color font-weight-bold">
              invoiceEmail:
            </span>
            <span class="light-text-color pl-3">{{ invoiceEmail }}</span>
          </div>
        </div>
        <!-- プラン -->
        <div class="pt-4">
          <span class="text-color font-weight-bold pr-3">
            プラン:
          </span>
          <span v-if="plan == 0" class="teal--text font-weight-bold">ベーシック</span>
          <span v-if="plan == 1" class="red--text font-weight-bold">スタンダード</span>
          <span v-if="plan == 2" class="blue--text font-weight-bold">アドバンス</span>
          <span v-else-if="plan == null" class="grey--text font-weight-bold">未契約</span>
          <v-btn
            v-show="!isEditingPlan"
            flat
            @click="editPlanButtonClicked"
          >
            <v-icon :size="14">edit</v-icon>
            <span class="caption teal-text-color">編集する</span>
          </v-btn>
          <div v-if="isEditingPlan" class="pt-3">
            <v-select
              v-model="tempPlan"
              :items="planItems"
              attach
              solo
            ></v-select>
            <v-btn
              @click="isEditingPlan = false"
            >
              キャンセル
            </v-btn>
            <v-btn
              :disabled="updatePlanButtonDisabled"
              @click="updatePlanButtonClicked"
            >
              更新
            </v-btn>
          </div>
        </div>
      </div>
    </v-flex>
    <!-- サインアップメール dialog -->
    <v-dialog
      v-model="signUpEmailDialog"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      width="500"
    >
      <v-card>
        <v-toolbar flat color="white">
          <v-btn icon @click="signUpEmailDialog=false">
            <v-icon>close</v-icon>
          </v-btn>
          <span
            class="pl-3 text-color font-weight-bold"
            :class="{
              'title': $vuetify.breakpoint.smAndUp,
              'subheading': $vuetify.breakpoint.xsOnly
            }"
          >
            サインアップメール送信
          </span>
        </v-toolbar>
        <v-flex
          xs12
          py-3
          class="light-text-color"
          :class="{'px-4': $vuetify.breakpoint.smAndUp, 'px-4 mt-4': $vuetify.breakpoint.xsOnly}"
        >
          <v-form v-model="valid" @submit.prevent="">
            <v-container>
              <v-layout
                column
                justify-center
              >
                <v-flex xs12>
                  <v-text-field
                    label="メールアドレス"
                    v-model="tempEmail"
                    :rules="emailRules"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="名前"
                    v-model="tempName"
                    :rules="nameRules"
                    required
                  ></v-text-field>
                </v-flex>
                <!-- 送信ボタン -->
                <v-btn
                  :disabled="!valid"
                  class="teal"
                  @click="sendSignUpEmailButtonClicked"
                >
                  <span
                    class="font-weight-bold body-1"
                    style="color: #ffffff;"
                  >
                    送信
                  </span>
                </v-btn>
              </v-layout>
            </v-container>
          </v-form>
        </v-flex>
      </v-card>
    </v-dialog>
    <!-- 最初のメンバー追加 dialog -->
    <v-dialog
      v-model="addFirstMemberDialog"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      width="500"
    >
      <v-card>
        <v-toolbar flat color="white">
          <v-btn icon @click="addFirstMemberDialog=false">
            <v-icon>close</v-icon>
          </v-btn>
          <span
            class="pl-3 text-color font-weight-bold"
            :class="{
              'title': $vuetify.breakpoint.smAndUp,
              'subheading': $vuetify.breakpoint.xsOnly
            }"
          >
            最初のメンバー追加
          </span>
        </v-toolbar>
        <v-flex
          xs12
          py-3
          class="light-text-color"
          :class="{'px-4': $vuetify.breakpoint.smAndUp, 'px-4 mt-4': $vuetify.breakpoint.xsOnly}"
        >
          <v-form v-model="addFirstMemberValid" @submit.prevent="">
            <v-container>
              <v-layout
                column
                justify-center
              >
                <v-flex xs12>
                  <v-text-field
                    label="メールアドレス"
                    v-model="tempEmail"
                    :rules="emailRules"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="名前"
                    v-model="tempName"
                    :rules="nameRules"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="役職"
                    v-model="tempPosition"
                    :rules="positionRules"
                    required
                  ></v-text-field>
                </v-flex>
                <!-- 送信ボタン -->
                <v-btn
                  :disabled="!addFirstMemberValid"
                  class="teal"
                  @click="addFirstMemberButtonClicked"
                >
                  <span
                    class="font-weight-bold body-1"
                    style="color: #ffffff;"
                  >
                    追加
                  </span>
                </v-btn>
              </v-layout>
            </v-container>
          </v-form>
        </v-flex>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  middleware: 'auth',
  head () {
    return {
      title: this.companyName ? this.companyName : '',
      meta: [
        { name: 'robots', content: 'noindex' },
      ],
    }
  },
  data: () => ({
    isQueried: false,
    windowHeight: 0,
    avatarSize: 50,
    isEditingPlan: false,
    tempPlan: null,
    valid: true,
    addFirstMemberValid: true,
    snackbar: false,
    snackbarText: '',
    signUpEmailDialog: false,
    addFirstMemberDialog: false,
    tempEmail: '',
    tempName: '',
    tempPosition: '',
    nameRules: [
      v => !!v || '名前を入力してください',
      v => (v && v.length <= 30) || '30文字を超えています'
    ],
    emailRules: [
      v => !!v || 'メールアドレスを入力してください',
      v => /.+@.+/.test(v) || '無効なメールアドレスです'
    ],
    positionRules: [
      v => (v.length <= 30) || '30文字を超えています'
    ],
  }),
  computed: {
    updatePlanButtonDisabled() {
      if (this.tempPlan == null) {
        return true
      }

      let currentPlan
      if (this.plan == null) {
        currentPlan = '未契約'
      } else if (this.plan == 0) {
        currentPlan = 'ベーシック'
      } else if (this.plan == 1) {
        currentPlan = 'スタンダード'
      } else if (this.plan == 2) {
        currentPlan = 'アドバンス'
      }

      if (currentPlan == this.tempPlan) {
        return true
      } else {
        return false
      }
    },
    planItems() {
      let items
      if (this.plan == null) {
        items = [
          '未契約',
          'ベーシック',
          'スタンダード',
          'アドバンス'
        ]
      } else {
        items = [
          'ベーシック',
          'スタンダード',
          'アドバンス',
          '解約'
        ]
      }
      return items
    },
    params() {
      return this.$route.params
    },
    breakpoint() {
      return this.$vuetify.breakpoint.name
    },
    ...mapState({
      uid: state => state.uid,
      isAdmin: state => state.profile.isAdmin,
      isRefreshing: state => state.isRefreshing,
      isLoading: state => state.companyInfo.isLoading,
      plan: state => state.companyInfo.plan,
      isDeleted: state => state.companyInfo.isDeleted,
      imageUrl: state => state.companyInfo.companyImageUrl,
      companyId: state => state.companyInfo.companyId,
      companyName: state => state.companyInfo.companyName,
      invoiceEmail: state => state.companyInfo.invoiceEmail,
    }),
  },
  mounted() {
    let toolbarHeight
    if (this.breakpoint == 'xs' || this.breakpoint == 'sm') {
      toolbarHeight = 48
    } else {
      toolbarHeight = 64
    }
    this.windowHeight = window.innerHeight - toolbarHeight - 30

    if (this.isAdmin) {
      this.resetState()
      this.updateIsLoading(true)
      this.queryCompanyFromAdmin(this.$route.params.id)
    } else {
      // 管理者出ない場合は rootへ
      this.$router.push('/')
    }
  },
  methods: {
    editPlanButtonClicked() {
      if (this.plan == null) {
        this.tempPlan = '未契約'
      } else if (this.plan == 0) {
        this.tempPlan = 'ベーシック'
      } else if (this.plan == 1) {
        this.tempPlan = 'スタンダード'
      } else if (this.plan == 2) {
        this.tempPlan = 'アドバンス'
      }
      this.isEditingPlan = true
    },
    updatePlanButtonClicked() {
      let tempPlan
      if (this.tempPlan == 'ベーシック') {
        tempPlan = 0
      } else if (this.tempPlan == 'スタンダード') {
        tempPlan = 1
      } else if (this.tempPlan == 'アドバンス') {
        tempPlan = 2
      } else if (this.tempPlan == '解約') {
        tempPlan = null
      }

      this.updatePlan({companyId: this.companyId, plan: tempPlan})
      this.isEditingPlan = false
    },
    sendSignUpEmailButtonClicked() {
      this.sendSignUpEmail({
        companyId: this.params.id,
        name: this.tempName,
        email: this.tempEmail
      })
      this.signUpEmailDialog = false
    },
    addFirstMemberButtonClicked() {
      this.addFirstMember({
        companyId: this.params.id,
        name: this.tempName,
        email: this.tempEmail,
        position: this.tempPosition
      })
      this.addFirstMemberDialog = false
    },
    ...mapActions({
      queryCompanyFromAdmin: 'companyInfo/queryCompanyFromAdmin',
      updateIsLoading: 'companyInfo/updateIsLoading',
      resetState: 'companyInfo/resetState',
      updatePlan: 'admin/updatePlan',
      sendSignUpEmail: 'sendSignUpEmail',
      addFirstMember: 'admin/addFirstMember'
    }),
  }
}
</script>
