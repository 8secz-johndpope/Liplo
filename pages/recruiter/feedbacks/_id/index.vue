<template>
  <v-layout
    white
    row
    wrap
  >
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
    <v-flex
      v-else-if="uid && uid != ''"
      xs12
      md10
      offset-md1
      class="break"
      :class="{
        'px-4': $vuetify.breakpoint.smAndDown,
      }"
    >
      <div
        :class="{
          'px-5 py-2': $vuetify.breakpoint.mdAndUp,
        }"
        id="feedback-detail"
      >
        <v-card v-if="uid && uid != ''" flat :to="'/users/' + uid">
          <v-card-actions class="px-0 pb-4">
            <v-list-tile>
              <v-list-tile-avatar>
                <v-img
                  v-if="profileImageUrl"
                  :src="profileImageUrl"
                  class="avatar-border"
                ></v-img>
                <v-icon v-else class="avatar-border">person</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title class="text-color font-weight-bold return">{{ userName }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-card-actions>
        </v-card>
        <div class="text-color pt-3">
          職種：　{{ occupation }}
        </div>
        <div class="pt-2 text-color">
          インターン終了時期：　{{ timestamp }}
        </div>
        <div v-if="goodPoint" class="pt-5">
          <span class="font-weight-bold text-color">良かった点</span>
          <p class="light-text-color body-text return">{{ goodPoint }}</p>
        </div>
        <div v-if="advice" class="py-3">
          <span class="font-weight-bold text-color">アドバイス</span>
          <p class="light-text-color body-text return">{{ advice }}</p>
        </div>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  middleware: 'auth',
  head () {
    return {
      title: 'フィードバック',
      meta: [
        { name: 'robots', content: 'noindex' },
      ],
    }
  },
  data: () => ({
    isQueried: false,
    windowHeight: 0,
    count: 0,
    showInfiniteLoading: false,
  }),
  computed: {
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
      companyId: state => state.profile.companyId,
      isRefreshing: state => state.isRefreshing,
      uid: state => state.feedback.uid,
      profileImageUrl: state => state.feedback.profileImageUrl,
      userName: state => state.feedback.userName,
      occupation: state => state.feedback.occupation,
      goodPoint: state => state.feedback.goodPoint,
      advice: state => state.feedback.advice,
      timestamp: state => state.feedback.timestamp,
      isLoading: state => state.feedback.isLoading,
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

    if (this.companyId != null && !this.isQueried) {
      this.resetState()
      this.updateIsLoading(true)
      this.queryFeedback({nuxt: this.$nuxt, params: this.params, companyId: this.companyId})
    }
  },
  watch: {
    companyId(companyId) {
      if (companyId != null && companyId != '') {
        this.isQueried = true
        this.resetState()
        this.updateIsLoading(true)
        this.queryFeedback({nuxt: this.$nuxt, params: this.params, companyId: companyId})
      }
    }
  },
  methods: {
    ...mapActions({
      queryFeedback: 'feedback/queryFeedback',
      updateIsLoading: 'feedback/updateIsLoading',
      resetState: 'feedback/resetState',
    }),
  }
}
</script>
<style>
#feedback-detail div.v-list__tile {
  padding: 0px;
}
</style>
