<template>
  <v-layout
    row
    white
    wrap
    align-start
    align-content-start
    :style="{ height: windowHeight + 'px' }"
  >
    <v-flex xs12 class="py-3 break">
      <!-- Profile画像 & UserName -->
      <div class="py-4 align-center">
        <v-card flat>
          <v-flex
            layout
            px-4
          >
            <v-avatar
              :size="avatarSize"
              class="grey lighten-3 clickable"
              @click="profileImageClicked"
            >
              <img v-if="imageUrl" :src="imageUrl" alt="avatar">
              <v-icon v-else :size="60">person</v-icon>
            </v-avatar>
            <div class="pt-2">
              <div class="title textColor font-weight-bold break pl-4">
                {{ name }}
              </div>
              <div>
                <v-btn
                  flat
                  small
                  @click="userNameClicked"
                >
                  <v-icon :size="14">edit</v-icon>
                  <span class="caption edit-text-color">編集する</span>
                </v-btn>
              </div>
            </div>
          </v-flex>
        </v-card>
        <!-- ProfileImage編集 -->
        <div>
          <v-dialog
            :value="isEditingProfileImage"
            :fullscreen="$vuetify.breakpoint.xsOnly"
            persistent
            width="500"
          >
            <v-card>
              <v-card-title
                class="headline orange lighten-3"
                primary-title
              >
                プロフィール画像を変更
              </v-card-title>
              <v-flex xs10 offset-xs1 text-xs-center>
                <div class="py-4">
                  <v-avatar
                    :size="selectedImageSize"
                    class="grey lighten-3"
                  >
                    <v-img v-if="selectedImage" :src="selectedImage" />
                    <v-img v-else-if="imageUrl" :src="imageUrl" />
                    <v-icon v-else style="font-size: 150px">person</v-icon>
                  </v-avatar>
                </div>
                <input type="file" v-on:change="onFileChange">
                <p v-if="!imageFileSizeValid" class="warning-text-color">
                  {{ imageFileSizeWarning }}
                </p>
              </v-flex>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  flat
                  @click="updateIsEditingProfileImage(false)"
                >
                  キャンセル
                </v-btn>
                <v-btn
                  color="primary"
                  flat
                  :disabled ="selectedImage == null"
                  @click="updateProfileImage({uid: user.uid, imageFile: imageFile})"
                >
                  変更
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
        <!-- UserName編集 -->
        <v-form v-model="editUserNameValid">
          <v-dialog
            :value="isEditingUserName"
            :fullscreen="$vuetify.breakpoint.xsOnly"
            persistent
            width="500"
          >
            <v-card>
              <v-card-title
                class="headline orange lighten-3"
                primary-title
              >
                名前を変更
              </v-card-title>
              <v-flex xs10 offset-xs1 py-3>
                <!-- 苗字の編集画面 -->
                <v-text-field
                  label="姓"
                  v-model="tempLastName"
                  :rules="lastNameRules"
                  required
                ></v-text-field>
                <!-- 苗字の編集画面 -->
                <v-text-field
                  label="名"
                  v-model="tempFirstName"
                  :rules="firstNameRules"
                  required
                ></v-text-field>
              </v-flex>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  flat
                  @click="updateIsEditingUserName(false)"
                >
                  キャンセル
                </v-btn>
                <v-btn
                  color="primary"
                  flat
                  :disabled="!editUserNameValid"
                  @click="updateUserName({uid: user.uid, firstName: tempFirstName, lastName: tempLastName})"
                >
                  変更
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-form>
      </div>
      <div :class="{'px-5': $vuetify.breakpoint.smAndUp}">
        <!-- 役職 -->
        <v-flex class="px-3 break text-xs-left">
          <span class="textColor font-weight-bold">
            役職: {{ position }}
          </span>
          <v-btn
            flat
            small
            @click="positionEditButtonClicked"
          >
            <v-icon :size="14">edit</v-icon>
            <span class="caption edit-text-color">編集する</span>
          </v-btn>
        </v-flex>
        <!-- 役職編集 -->
        <v-form v-model="editPositionValid">
          <v-dialog
            :value="isEditingPosition"
            :fullscreen="$vuetify.breakpoint.xsOnly"
            persistent
            width="500"
          >
            <v-card>
              <v-card-title
                class="headline orange lighten-3"
                primary-title
              >
                役職を変更
              </v-card-title>
              <v-flex xs10 offset-xs1 py-3>
                <v-text-field
                  solo
                  label="役職"
                  v-model="tempPosition"
                  :rules="positionRules"
                  required
                ></v-text-field>
              </v-flex>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  @click="updateIsEditingPosition(false)"
                >
                  キャンセル
                </v-btn>
                <v-btn
                  :disabled="!editPositionValid"
                  @click="updatePosition({uid: user.uid, position: tempPosition})"
                >
                  更新
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-form>
      </div>
      <div :class="{'px-5': $vuetify.breakpoint.smAndUp}">
        <!-- 紹介文 -->
        <div>
          <v-layout
            align-center
            justify-space-between
            row
            class="pt-5"
          >
            <!-- タイトル&編集ボタン -->
            <v-card-title
              class="font-weight-bold"
              :class="{
                'title': $vuetify.breakpoint.smAndUp,
              }"
            >
              紹介文
            </v-card-title>
            <div v-show="!isEditingSelfIntro">
              <v-btn
                flat
                small
                @click="selfIntroEditButtonClicked"
              >
                <v-icon :size="14">edit</v-icon>
                <span class="caption edit-text-color">編集する</span>
              </v-btn>
            </div>
          </v-layout>
          <v-flex xs12 sm10>
            <v-divider></v-divider>
          </v-flex>
          <v-flex xs12 sm10 class="break">
            <!-- 自己紹介の表示 -->
            <v-card-text v-if="!isEditingSelfIntro">
              <p class="return">{{ selfIntro }}</p>
            </v-card-text>
            <!-- 自己紹介の編集画面 -->
            <div v-else>
              <v-form v-model="editSelfIntroValid">
                <v-textarea
                  solo
                  label="自己紹介"
                  v-model="tempSelfIntro"
                  :rules="selfIntroRules"
                  required
                ></v-textarea>
                <v-btn
                  @click="updateIsEditingSelfIntro(false)"
                >
                  キャンセル
                </v-btn>
                <v-btn
                  :disabled="!editSelfIntroValid"
                  @click="updateSelfIntro({uid: user.uid, selfIntro: tempSelfIntro})"
                >
                  更新
                </v-btn>
              </v-form>
            </div>
          </v-flex>
        </div>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import { firestore, auth, storage, storageRef } from '@/plugins/firebase'

export default {
  data: () => ({
    windowHeight: 0,
    imageFileSizeWarning: '2MB以下の画像を選択してください',
    selectedImageSize: 200,
    selectedImage: null,
    imageFile: null,
    tempFirstName: '',
    tempLastName: '',
    firstNameRules: [
      v => !!v || '名前を入力してください',
      v => (v && v.length <= 30) || '30文字を超えています'
    ],
    lastNameRules: [
      v => !!v || '苗字を入力してください',
      v => (v && v.length <= 30) || '30文字を超えています'
    ],
    editUserNameValid: true,
    tempSelfIntro: '',
    selfIntroRules: [
      v => (v.length <= 300) || '300字以内で入力してください'
    ],
    editSelfIntroValid: true,
    tempPosition: '',
    positionRules: [
      v => (v.length <= 15) || '15字以内で入力してください'
    ],
    editPositionValid: true,
  }),
  computed: {
    avatarSize() {
      return (this.breakpoint == 'xs') ? 50 : 60
    },
    name() {
      return this.lastName + ' ' + this.firstName
    },
    breakpoint() {
      return this.$vuetify.breakpoint.name
    },
    ...mapState({
      user: state => state.user,
      imageUrl: state => state.profile.imageUrl,
      imageFileSizeValid: state => state.profile.imageFileSizeValid,
      isEditingProfileImage: state => state.profile.isEditingProfileImage,
      position: state => state.profile.position,
      isEditingPosition: state => state.profile.isEditingPosition,
      firstName: state => state.profile.firstName,
      lastName: state => state.profile.lastName,
      isEditingUserName: state => state.profile.isEditingUserName,
      selfIntro: state => state.profile.selfIntro,
      isEditingSelfIntro: state => state.profile.isEditingSelfIntro,
    }),
  },
  mounted() {
    let toolbarHeight
    if (this.breakpoint == 'xs' || this.breakpoint == 'sm') {
      toolbarHeight = 48
    } else {
      toolbarHeight = 64
    }
    this.windowHeight = window.innerHeight - toolbarHeight

    auth.onAuthStateChanged((user) => {
      if (user) {
        this.queryProfile(user.uid)
      }
    })
  },
  methods: {
    profileImageClicked() {
      this.updateImageFileSizeValid(true)
      this.updateIsEditingProfileImage(true)
      this.selectedImage = null
      this.imageFile = null
    },
    onFileChange(e) {
      this.updateImageFileSizeValid(true)
      let files = e.target.files || e.dataTransfer.files
      // 画像サイズは2MB以下のみ
      if (files[0] != null && files[0].size/1024/1024 <= 2) {
        if (this.isEditingProfileImage) {
          this.imageFile = files[0]
        }
      } else {
        this.updateImageFileSizeValid(false)
      }

      if (this.imageFileSizeValid) {
        this.createImage(files[0])
      }
    },
    createImage(file) {
      // アップロードした画像を表示
      let reader = new FileReader()
      reader.onload = (e) => {
        if (this.isEditingProfileImage) {
          this.selectedImage = e.target.result
        }
      }
      reader.readAsDataURL(file)
    },
    userNameClicked() {
      this.updateIsEditingUserName(true)
      this.tempFirstName = this.firstName
      this.tempLastName = this.lastName
    },
    selfIntroEditButtonClicked() {
      this.tempSelfIntro = this.selfIntro
      this.updateIsEditingSelfIntro(true)
    },
    positionEditButtonClicked() {
      this.tempPosition = this.position
      this.updateIsEditingPosition(true)
    },
    ...mapActions({
      queryProfile: 'profile/queryProfile',
      updateImageFileSizeValid: 'profile/updateImageFileSizeValid',
      updateIsEditingProfileImage: 'profile/updateIsEditingProfileImage',
      updateProfileImage: 'profile/updateProfileImage',
      updateIsEditingUserName: 'profile/updateIsEditingUserName',
      updateUserName: 'profile/updateUserName',
      updateIsEditingSelfIntro: 'profile/updateIsEditingSelfIntro',
      updateSelfIntro: 'profile/updateSelfIntro',
      updateIsEditingPosition: 'profile/updateIsEditingPosition',
      updatePosition: 'profile/updatePosition',
    }),
  }
}
</script>