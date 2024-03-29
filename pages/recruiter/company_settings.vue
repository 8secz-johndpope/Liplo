<template>
  <v-layout
    white
    row
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
    <v-flex
      v-if="uid && uid != ''"
      xs12
      md10
      offset-md1
      class="break"
    >
      <v-layout
        row
        wrap
      >
        <!-- settings (lg, md) -->
        <v-flex
          md10
          xs12
          class="py-3"
          :class="{
            'px-5': $vuetify.breakpoint.lgAndUp,
            'px-3': $vuetify.breakpoint.mdOnly,
          }"
        >
          <v-flex md10 sm8 xs10 offset-md1 offset-sm2 offset-xs1 class="text-color">
            <!-- 請求書を送るメアド変更 -->
            <div class="py-5">
              <div
                class="title font-weight-bold">
                請求書を送るメールアドレスを変更する
              </div>
              <div class="pt-3">
                現在のメールアドレス： {{ invoiceEmail }}
              </div>
              <div class="text-xs-right pt-4">
                <v-btn @click="changeInvoiceEmailDialog = true">
                  メールアドレスを変更する
                </v-btn>
              </div>
            </div>
            <!-- プラン変更 -->
            <div class="py-5">
              <div
                class="title font-weight-bold">
                プランについて
              </div>
              <div class="pt-4">
                現在のプラン：
                <span v-if="planText" class="light-text-color font-weight-bold">{{ planText }}</span>
              </div>
              <div class="pt-5">
                <div>
                  どのプランも、契約期間が切れる前に自動更新されます。（1ヶ月ごとに自動更新）
                </div>
                自動更新の停止やプランの変更、解約などは、お手数ですが、support@liplo.jp までご連絡ください。
                <div class="pt-3">
                  現在契約しているプランがある場合は、契約期間が終わった後に変更・解約されます。
                </div>
                <div v-if="plan != null" class="light-text-color pt-3">
                  ※ パスを出している場合は、パスの有効期間が終了するかパスが使用されるまで原則、解約が出来ません。
                  また、解約されますと、候補者を採用することが出来なくなるため、採用する予定の候補者がいる場合は、
                  採用した後にご解約をお願いします。
                  <div>
                    現在、ベーシック以外のプランを契約していて、今後インターンを採用しないという場合は、
                    ベーシックプランに変更していただくと、掲載料金がかからなくなります。
                    （本採用の料金は、インターン採用時に加入していたプランの料金となります）
                  </div>
                  <div class="pt-3">
                    どうしても解約せざるを得ない場合は、解約後パスの使用や候補者のステータスの変更などが出来なくなるため、
                    候補者の方とメッセージにてやり取りをして頂き、解約前にパスを使用して頂くか、
                    両者合意の上で取り消しして頂くことになります。
                  </div>
                  何か不明な点がございましたら、お問い合わせ又はメールにてご連絡ください。
                </div>
              </div>
            </div>
          </v-flex>
        </v-flex>
        <!-- changeInvoiceEmailDialog -->
        <v-dialog
          v-model="changeInvoiceEmailDialog"
          :fullscreen="$vuetify.breakpoint.xsOnly"
          width="500"
        >
          <v-card>
            <v-toolbar flat>
              <span class="text-color font-weight-bold subheading">請求書の送信先変更</span>
            </v-toolbar>
            <div class="pa-4">
              <div class="pb-4 text-color">
                新しいメールアドレスを入力してください。
                <div class="pt-2">
                  ※ 変更後、新しいメールアドレスに確認メールが届きますのでご確認をお願い致します。
                  届かない場合は、指定したメールアドレスが正しいかご確認ください。
                  （確認メールが届くのに少々時間がかかる場合がございます）
                </div>
              </div>
              <v-form v-model="emailValid" @submit.prevent="">
                <v-container>
                  <v-layout
                    column
                    justify-center
                  >
                    <v-flex xs12>
                      <!-- メールアドレス -->
                      <v-text-field
                        v-model="newEmail"
                        :rules="emailRules"
                        label="新しいメールアドレス"
                        append-icon="mail_outline"
                        solo
                        required
                      ></v-text-field>
                    </v-flex>
                    <!-- 変更ボタン -->
                    <v-btn
                      :disabled="!emailValid"
                      class="teal lighten-1"
                      @click="changeEmailButtonClicked"
                    >
                      <span
                        class="font-weight-bold body-1"
                        style="color: #ffffff;"
                      >
                        メールアドレス変更
                      </span>
                    </v-btn>
                  </v-layout>
                </v-container>
              </v-form>
            </div>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  middleware: 'auth',
  head () {
    return {
      title: '企業設定',
      meta: [
        { name: 'robots', content: 'noindex' },
      ],
    }
  },
  data: () => ({
    isQueried: false,
    snackbar: false,
    snackbarText: '',
    changeInvoiceEmailDialog: false,
    emailValid: true,
    newEmail: '',
    emailRules: [
      v => !!v || 'メールアドレスを入力してください',
      v => /.+@.+/.test(v) || '無効なメールアドレスです'
    ],
  }),
  computed: {
    planText() {
      if (this.plan == 0) {
        return 'ベーシック'
      } else if (this.plan == 1) {
        return 'スタンダード'
      } else if (this.plan == 2) {
        return 'アドバンス'
      } else if (this.plan == null) {
        return '未契約'
      }
    },
    params() {
      return this.$route.params
    },
    path() {
      return this.$route.path
    },
    breakpoint() {
      return this.$vuetify.breakpoint.name
    },
    ...mapState({
      uid: state => state.uid,
      type: state => state.profile.type,
      companyId: state => state.profile.companyId,
      companyName: state => state.companyInfo.companyName,
      plan: state => state.companyInfo.plan,
      invoiceEmail: state => state.companyInfo.invoiceEmail,
    }),
  },
  mounted() {
    if (this.companyId != null && !this.isQueried) {
      this.queryCompanyInfo(this.companyId)
    }
  },
  watch: {
    companyId(companyId) {
      if (companyId != null && companyId != '') {
        this.queryCompanyInfo(companyId)
      }
    },
  },
  methods: {
    changeEmailButtonClicked() {
      if (this.changeInvoiceEmailDialog) {
        this.updateInvoiceEmail({companyId: this.companyId, companyName: this.companyName, email: this.newEmail})
        this.changeInvoiceEmailDialog = false
      }
      this.newEmail = ''
      this.snackbar = true
      this.snackbarText = '更新しました！ 確認のメールが届いているかご確認ください（少々時間がかかる場合がございます）'
    },
    ...mapActions({
      queryCompanyInfo: 'companyInfo/queryCompanyInfo',
      updateInvoiceEmail: 'companyInfo/updateCompanyInvoiceEmail',
    }),
  }
}
</script>
