<template>
  <v-layout
    white
    column
  >
    <v-flex v-if="isRefreshing == null || isRefreshing" xs12 pt-5>
      <v-layout justify-center>
        Now Loading...
      </v-layout>
    </v-flex>
    <v-flex v-else-if="isInitialLoading" xs12 :style="{ height: windowHeight + 'px' }">
      <v-layout align-center justify-center column fill-height>
        Now Loading...
      </v-layout>
    </v-flex>
    <v-flex xs12 v-else-if="uid && uid != ''">
      <div
        v-if="yearPasses && yearPasses.length > 0"
        class="text-xs-right pa-3"
      >
        <v-btn @click="openAddYearDialogButtonClicked">年度を追加</v-btn>
      </div>
      <!-- 年度別のパス発行数 -->
      <v-flex
        xs12
        sm10
        md8
        offset-sm1
        offset-md2
      >
        <div
          v-if="yearPasses && yearPasses.length > 0"
          class="text-xs-right pt-2 pb-2"
        >
          <v-btn
            small
            flat
            class="grey--text text--darken-2"
            @click="passTypesDialog=true"
          >
            <v-icon class="mr-1" style="font-size: 18px; color: #BDBDBD">info</v-icon>
            パスの種類について
          </v-btn>
        </div>
        <v-flex
          xs12
          sm6
          :class="{
            'offset-sm3': yearPasses == null || yearPasses.length == 0,
          }"
        >
          <v-hover>
            <v-card
              slot-scope="{ hover }"
              class="pa-2 clickable"
              :class="{
                'elevation-6': hover && !$vuetify.breakpoint.xsOnly,
                'elevation-2': !hover,
                'mb-4 mt-3': $vuetify.breakpoint.smAndUp,
              }"
              @click="passesButtonClicked('/recruiter/passes/hiring')"

            >
              <div class="font-weight-bold text-color">
                入社パス
              </div>
              <div class="py-3 text-xs-center font-weight-bold light-text-color title">
                <span v-if="hiringPassCount">{{ hiringPassCount }}</span>
                <span v-else>0</span>
              </div>
              <div class="text-xs-right caption light-text-color">
                発行数(全年度共通)
                <div>
                  ※ 未使用かつ有効のものに限る
                </div>
              </div>
            </v-card>
          </v-hover>
        </v-flex>
        <v-list class="py-0" v-if="yearPasses && yearPasses.length > 0">
          <template v-for="(yearPass, index) in yearPasses">
            <v-card
              class="pa-4"
              :class="{
                'mb-5': $vuetify.breakpoint.smAndUp,
              }"
            >
              <div>
                <div class="font-weight-bold light-text-color title">
                  {{ yearPass.year }}年度
                </div>
                <!-- 先着パスの上限 -->
                <div class="pt-4">
                  <span v-if="yearPass.limit == 0" class="text-color">
                    先着パスの上限： <span class="font-weight-bold">0</span>
                  </span>
                  <span v-else-if="yearPass.limit" class="text-color">
                    先着パスの上限： <span class="font-weight-bold">{{ yearPass.limit }}</span>
                  </span>
                  <span v-else class="text-color">
                    先着パスの上限： なし
                  </span>
                  <v-btn
                    small
                    flat
                    color="teal lighten-1"
                    @click="openUpdatePassLimitDialogButtonClicked(yearPass.year)"
                  >
                    設定する
                  </v-btn>
                </div>
                <!-- パスの数 -->
                <v-layout row wrap class="py-4">
                  <v-flex
                    xs12
                    sm4
                    :class="{
                      'mt-3': $vuetify.breakpoint.xsOnly,
                    }"
                  >
                    <v-hover>
                      <v-card
                        v-if="yearPass.count.hiring"
                        slot-scope="{ hover }"
                        class="pa-2 mx-2 clickable"
                        :class="{
                          'elevation-6': hover && !$vuetify.breakpoint.xsOnly,
                          'elevation-2': !hover,
                        }"
                        @click="passesButtonClicked('/recruiter/passes/' + yearPass.year + '?passType=hiring')"
                      >
                        <div class="font-weight-bold text-color">
                          入社パス
                        </div>
                        <div class="py-3 text-xs-center font-weight-bold light-text-color title">
                          {{ yearPass.count.hiring.used }}
                        </div>
                        <div class="text-xs-right caption light-text-color">
                          使用数
                        </div>
                      </v-card>
                    </v-hover>
                  </v-flex>
                  <v-flex
                    xs12
                    sm4
                    :class="{
                      'mt-3': $vuetify.breakpoint.xsOnly,
                    }"
                  >
                    <v-hover>
                      <v-card
                        v-if="yearPass.count.offer"
                        slot-scope="{ hover }"
                        class="pa-2 mx-2 clickable"
                        :class="{
                          'elevation-6': hover && !$vuetify.breakpoint.xsOnly,
                          'elevation-2': !hover,
                        }"
                        @click="passesButtonClicked('/recruiter/passes/' + yearPass.year + '?passType=offer')"
                      >
                        <div class="font-weight-bold text-color">
                          内定パス
                        </div>
                        <div class="py-3 text-xs-center font-weight-bold light-text-color title">
                          {{ yearPass.count.offer.used }} / {{ yearPass.count.offer.all }}
                        </div>
                        <div class="text-xs-right caption light-text-color">
                          使用数 / 発行数
                        </div>
                      </v-card>
                    </v-hover>
                  </v-flex>
                  <v-flex
                    xs12
                    sm4
                    :class="{
                      'mt-3': $vuetify.breakpoint.xsOnly,
                    }"
                  >
                    <v-hover>
                      <v-card
                        v-if="yearPass.count.limited"
                        slot-scope="{ hover }"
                        class="pa-2 mx-2 clickable"
                        :class="{
                          'elevation-6': hover && !$vuetify.breakpoint.xsOnly,
                          'elevation-2': !hover,
                        }"
                        @click="passesButtonClicked('/recruiter/passes/' + yearPass.year + '?passType=limited')"
                      >
                        <div class="font-weight-bold text-color">
                          先着パス
                        </div>
                        <div class="py-3 text-xs-center font-weight-bold light-text-color title">
                          {{ yearPass.count.limited.used }} / {{ yearPass.count.limited.all }}
                        </div>
                        <div class="text-xs-right caption light-text-color">
                          使用数 / 発行数
                        </div>
                      </v-card>
                    </v-hover>
                  </v-flex>
                </v-layout>
              </div>
            </v-card>
          </template>
        </v-list>
      </v-flex>
      <!-- 年度がない場合 -->
      <v-flex
        v-if="yearPasses == null || yearPasses.length == 0"
        xs12
        sm8
        md6
        offset-sm2
        offset-md3
        :class="{
          'mt-5': $vuetify.breakpoint.smAndUp,
        }"
      >
        <v-card class="px-3 py-4">
          <div class="text-xs-center">
            <div class="text-color">
              パスの発行数の確認や先着パスの上限を設定したい年度を追加してください
            </div>
            <v-btn
              class="mt-3 font-weight-bold white--text"
              color="teal lighten-1"
              :disabled="plan == null"
              @click="openAddYearDialogButtonClicked"
            >
              追加する
            </v-btn>
          </div>
        </v-card>
      </v-flex>
      <infinite-loading
        v-if="showInfiniteLoading && yearPasses && yearPasses.length >= 10 && !isLoading"
        :distance="50"
        spinner="waveDots"
        @infinite="infiniteHandler">
        <div slot="no-results"></div>
      </infinite-loading>
    </v-flex>
    <!-- 年度追加 dialog -->
    <v-dialog
      v-model="addYearDialog"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      width="500"
    >
      <v-card>
        <v-toolbar flat color="white">
          <v-btn class="hidden-sm-and-up" icon @click="addYearDialog=false">
            <v-icon>close</v-icon>
          </v-btn>
          <span
            class="pl-3 text-color font-weight-bold"
            :class="{
              'title': $vuetify.breakpoint.smAndUp,
              'subheading': $vuetify.breakpoint.xsOnly
            }"
          >
            年度の追加
          </span>
        </v-toolbar>
        <v-flex
          xs12
          py-3
          class="light-text-color"
          :class="{'px-4': $vuetify.breakpoint.smAndUp, 'px-4 mt-4': $vuetify.breakpoint.xsOnly}"
        >
          <v-form v-model="addYearValid" @submit.prevent="">
            <v-container>
              <v-layout
                column
                justify-center
              >
                <v-flex xs12>
                  <!-- Error Message -->
                  <v-alert
                    :value="addYearError && addYearError != ''"
                    type="error"
                    class="mb-5"
                    outline
                  >
                    {{ addYearError }}
                  </v-alert>
                  <!-- 年度 -->
                  <v-text-field
                    v-model="tempYear"
                    class="pt-3"
                    type="number"
                    suffix="年度"
                    :rules="yearRules"
                    required
                  ></v-text-field>
                  <!-- 先着パス上限 -->
                  <v-text-field
                    v-model="tempPassLimit"
                    class="pt-3"
                    label="先着パス上限"
                    type="number"
                    suffix="人"
                    required
                  ></v-text-field>
                </v-flex>
                <!-- 追加ボタン -->
                <v-btn
                  :disabled="!addYearValid || plan == null"
                  class="teal lighten-1"
                  @click="addYearButtonClicked"
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
    <!-- 先着パス上限設定 dialog -->
    <v-dialog
      v-model="updatePassLimitDialog"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      width="500"
    >
      <v-card>
        <v-toolbar flat color="white">
          <v-btn class="hidden-sm-and-up" icon @click="updatePassLimitDialog=false">
            <v-icon>close</v-icon>
          </v-btn>
          <span
            class="pl-3 text-color font-weight-bold"
            :class="{
              'title': $vuetify.breakpoint.smAndUp,
              'subheading': $vuetify.breakpoint.xsOnly
            }"
          >
            先着パスの上限設定
          </span>
        </v-toolbar>
        <v-flex
          xs12
          py-3
          class="light-text-color"
          :class="{'px-4': $vuetify.breakpoint.smAndUp, 'px-4 mt-4': $vuetify.breakpoint.xsOnly}"
        >
          <v-form v-model="updatePassLimitValid" @submit.prevent="">
            <v-container>
              <v-layout
                column
                justify-center
              >
                <v-flex xs12>
                  <!-- Error Message -->
                  <v-alert
                    :value="updatePassLimitError && updatePassLimitError != ''"
                    type="error"
                    class="mb-5"
                    outline
                  >
                    {{ updatePassLimitError }}
                  </v-alert>
                  <!-- 先着パス上限 -->
                  <v-text-field
                    v-model="tempPassLimit"
                    class="pt-3"
                    label="先着パス上限"
                    type="number"
                    suffix="人"
                    required
                  ></v-text-field>
                </v-flex>
                <!-- 更新ボタン -->
                <v-btn
                  :disabled="!updatePassLimitValid || plan == null"
                  class="teal lighten-1"
                  @click="updatePassLimitButtonClicked"
                >
                  <span
                    class="font-weight-bold body-1"
                    style="color: #ffffff;"
                  >
                    更新
                  </span>
                </v-btn>
              </v-layout>
            </v-container>
          </v-form>
        </v-flex>
      </v-card>
    </v-dialog>
    <!-- パスの種類の説明 -->
    <v-dialog
      v-model="passTypesDialog"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      width="600"
    >
      <v-card>
        <v-toolbar flat color="white">
          <v-btn class="hidden-sm-and-up" icon @click="passTypesDialog=false">
            <v-icon>close</v-icon>
          </v-btn>
          <span
            class="pl-3 text-color font-weight-bold"
            :class="{
              'title': $vuetify.breakpoint.smAndUp,
              'subheading': $vuetify.breakpoint.xsOnly
            }"
          >
            パスの種類
          </span>
        </v-toolbar>
        <v-flex
          xs12
          py-3
          class="light-text-color"
          :class="{'px-4': $vuetify.breakpoint.smAndUp, 'px-4 mt-4': $vuetify.breakpoint.xsOnly}"
        >
          <div class="pb-3">
            <div class="subheading font-weight-bold">
              1. 入社パス
            </div>
            <div class="pt-2">
              卒業後の一定期間、入社する権利を与えるパスです（候補者が卒業前に使用した場合は、原則、卒業後に入社という形になります）。
              卒業と同時に入社してもらいたい場合は内定パスを発行してください。
              <div>
                有効期限は、卒業から1,2年を推奨しています。
              </div>
              <div>
                入社パスでの入社月日は、候補者の希望を聞いていただき、すり合わせを行ってください。
                （入社年度に関しては、候補者がパスの使用時に指定します）
              </div>
              <div>
                このパスを発行しすぎると、採用予定人数を上回ってしまう可能性があるため、
                対象者を厳選して発行することを推奨しています。
              </div>
            </div>
            <div class="pt-3 subheading font-weight-bold">
              2. 内定パス
            </div>
            <div class="pt-2">
              内定を取得する権利を与えるパスです。
              <div>
                有効期限は、候補者の卒業時期付近を推奨しています。
                （期限を早くしすぎてしまうと、候補者を採用できる可能性が低くなります）
              </div>
              <div>
                内定パスでの入社時期は、候補者の卒業年度に合わせて企業が設定します。
                （例えば、卒業年度が2019年であれば、2020年度と設定して下さい）
              </div>
              <div>
                このパスも入社パス同様、発行しすぎると採用予定人数を上回ってしまう可能性があるため、
                対象者を厳選して発行することを推奨しています。
              </div>
            </div>
            <div class="pt-3 subheading font-weight-bold">
              3. 先着パス
            </div>
            <div class="pt-2">
              このパスは、内定パスに使用上限数がついたものです。
              <div>
                使用上限数は企業が設定することが出来ます。
              </div>
              <div>
                先着パスの使用数が、設定した使用上限数に達した場合、候補者は先着パスを使用出来なくなります。
              </div>
              <div>
                入社パスや内定パスは性質上、パスを使う人数が予想しにくいため、あまり発行することが出来ませんが、
                先着パスは使用上限数を自由に設定することが出来るため、数を気にせず発行することができます。
              </div>
              <div>
                先着パスの使用上限数は、サイドバーのパスから設定できます。
              </div>
            </div>
          </div>
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
      title: 'パス',
      meta: [
        { name: 'robots', content: 'noindex' },
      ],
    }
  },
  data() {
    return {
      count: 0,
      showInfiniteLoading: false,
      windowHeight: 0,
      passTypesDialog: false,
      updatePassLimitDialog: false,
      updatePassLimitValid: true,
      selectedYear: null,
      addYearDialog: false,
      addYearValid: true,
      tempYear: null,
      tempPassLimit: null,
      updatePassLimitError: '',
      yearRules: [
        v => !!v || '入力してください',
        v => (String(v).length == 4) || '4桁で指定してください',
      ],
    }
  },
  computed: {
    breakpoint() {
      return this.$vuetify.breakpoint.name
    },
    ...mapState({
      uid: state => state.uid,
      isRefreshing: state => state.isRefreshing,
      plan: state => state.profile.plan,
      companyId: state => state.profile.companyId,
      hiringPassCount: state => state.companyPasses.hiringPassCount,
      yearPasses: state => state.companyPasses.yearPasses,
      isInitialLoading: state => state.companyPasses.isInitialLoading,
      isLoading: state => state.companyPasses.isLoading,
      allYearPassesQueried: state => state.companyPasses.allYearPassesQueried,
      addYearError: state => state.companyPass.addYearError,
    })
  },
  mounted() {
    let toolbarHeight
    if (this.breakpoint == 'xs' || this.breakpoint == 'sm') {
      toolbarHeight = 48
    } else {
      toolbarHeight = 64
    }
    this.windowHeight = window.innerHeight - toolbarHeight - 30
    this.showInfiniteLoading = true

    if (this.companyId != null && !this.isQueried) {
      this.resetYearPassesState()
      this.updateIsInitialLoading(true)
      this.updateIsLoading(true)
      this.queryHiringPassCount(this.companyId)
      this.queryYearPasses(this.companyId)
    }
  },
  watch: {
    companyId(companyId) {
      if (companyId != null && companyId != '') {
        this.resetYearPassesState()
        this.isQueried = true
        this.updateIsInitialLoading(true)
        this.updateIsLoading(true)
        this.queryHiringPassCount(companyId)
        this.queryYearPasses(companyId)
      }
    },
    addYearError(error) {
      if (error && error != '') {
        this.addYearValid = true
      } else if (error == null) {
        this.tempPassLimit = null
        this.addYearDialog = false
      }
    },
    updatePassLimitError(error) {
      if (error == null) {
        this.updatePassLimitError = ''
        this.tempPassLimit = null
        this.updatePassLimitDialog = false
      }
    }
  },
  methods: {
    infiniteHandler($state) {
      if (!this.allYearPassesQueried) {
        if (!this.isLoading) {
          this.count += 1
          this.updateIsLoading(true)
          this.queryYearPasses(this.companyId)
          if (this.count > 20) {
            $state.complete()
          } else {
            $state.loaded()
          }
        }
      } else {
        $state.complete()
      }
    },
    openAddYearDialogButtonClicked() {
      this.resetAddYearError()
      this.tempYear = new Date().getFullYear()
      this.addYearDialog = true
    },
    addYearButtonClicked() {
      this.addYearValid = false
      var limit
      if (this.tempPassLimit) {
        limit = Number(this.tempPassLimit)
      } else {
        limit = null
      }

      this.addYear({ companyId: this.companyId, year: Number(this.tempYear), limit: limit})
    },
    openUpdatePassLimitDialogButtonClicked(year) {
      this.selectedYear = year
      this.yearPasses.forEach((yearPass, i) => {
        if (yearPass.year == year) {
          this.tempPassLimit = yearPass.limit
        }
      })
      this.updatePassLimitDialog = true
    },
    updatePassLimitButtonClicked() {
      var isValid = true
      this.yearPasses.forEach((yearPass, i) => {
        if (yearPass.year == this.selectedYear) {
          if (
            yearPass.count.limited.used != 0 &&
            this.tempPassLimit &&
            Number(this.tempPassLimit) < yearPass.count.limited.used
          ) {
            isValid = false
            this.updatePassLimitError = 'すでに使用されている先着パス数より低い値には設定できません'
          }
        }
      })
      if (isValid) {
        var limit
        if (this.tempPassLimit) {
          limit = Number(this.tempPassLimit)
        } else {
          limit = null
        }

        this.updatePassLimit({ companyId: this.companyId, year: this.selectedYear, limit: limit})
        this.updatePassLimitError = null
      }
    },
    // 発行したパス一覧へ
    passesButtonClicked(url) {
      this.resetPassesState()
      this.$router.push(url)
    },
    ...mapActions({
      queryHiringPassCount: 'companyPasses/queryHiringPassCount',
      queryYearPasses: 'companyPasses/queryYearPasses',
      updateIsInitialLoading: 'companyPasses/updateIsInitialLoading',
      updateIsLoading: 'companyPasses/updateIsLoading',
      addYear: 'companyPass/addYear',
      updatePassLimit: 'companyPass/updatePassLimit',
      resetYearPassesState: 'companyPasses/resetYearPassesState',
      resetPassesState: 'companyPasses/resetPassesState',
      resetAddYearError: 'companyPass/resetAddYearError',
    }),
  }
}
</script>
