export const strict = false
import { firestore, storageRef } from '@/plugins/firebase'
import { event } from 'vue-analytics'
import SimpleCrypto from "simple-crypto-js"

export const state = () => ({
  imageUrl: '',
  firstName: '',
  lastName: '',
  selfIntro: '',
  whatWantToDo: '',
  portfolio: null,
  skills: null,
  links: null,
  email: '',
  university: '',
  faculty: '',
  department: '',
  laboratory: '',
  grade: '',
  graduationYear: '',
  address: '',
  birthDate: '',
  desiredOccupations: null,
  interestingFields: null,
  isCandidate: false,
  isLoading: false,
})

export const mutations = {
  setImageUrl(state, imageUrl) {
    state.imageUrl = imageUrl
  },
  setFirstName(state, firstName) {
    state.firstName = firstName
  },
  setLastName(state, lastName) {
    state.lastName = lastName
  },
  setSelfIntro(state, selfIntro) {
    state.selfIntro = selfIntro
  },
  setWhatWantToDo(state, whatWantToDo) {
    state.whatWantToDo = whatWantToDo
  },
  setPortfolio(state, portfolio) {
    state.portfolio = portfolio
  },
  setSkills(state, skills) {
    state.skills = skills
  },
  setLinks(state, links) {
    state.links = links
  },
  setEmail(state, email) {
    state.email = email
  },
  setUniversity(state, university) {
    state.university = university
  },
  setFaculty(state, faculty) {
    state.faculty = faculty
  },
  setDepartment(state, department) {
    state.department = department
  },
  setLaboratory(state, laboratory) {
    state.laboratory = laboratory
  },
  setGrade(state, grade) {
    state.grade = grade
  },
  setGraduationYear(state, graduationYear) {
    state.graduationYear = graduationYear
  },
  setAddress(state, address) {
    state.address = address
  },
  setBirthDate(state, birthDate) {
    state.birthDate = birthDate
  },
  setDesiredOccupatins(state, occupations) {
    state.desiredOccupations = occupations
  },
  setInterstingFields(state, fields) {
    state.interestingFields = fields
  },
  updateIsCandidate(state, isCandidate) {
    state.isCandidate = isCandidate
  },
  updateIsLoading(state, isLoading) {
    state.isLoading = isLoading
  },
}

export const actions = {
  queryUser({commit, state}, {nuxt, uid, companyId}) {
    firestore.collection('users')
      .doc(uid)
      .collection('detail')
      .doc(uid)
      .get()
      .then(function(doc) {
        if (doc.exists) {
          commit('setImageUrl', doc.data()['imageUrl'])
          commit('setFirstName', doc.data()['firstName'])
          commit('setLastName', doc.data()['lastName'])
          commit('setSelfIntro', doc.data()['selfIntro'])
          commit('setWhatWantToDo', doc.data()['whatWantToDo'])
          commit('setPortfolio', doc.data()['portfolio'])
          commit('setSkills', doc.data()['skills'])
          commit('setLinks', doc.data()['links'])
          commit('setEmail', doc.data()['email'])
          commit('setUniversity', doc.data()['university'])
          commit('setFaculty', doc.data()['faculty'])
          commit('setDepartment', doc.data()['department'])
          commit('setLaboratory', doc.data()['laboratory'])
          commit('setGraduationYear', doc.data()['graduationYear'])
          commit('setAddress', doc.data()['address'])
          commit('setBirthDate', doc.data()['birthDate'])
          commit('setDesiredOccupatins', doc.data()['desiredOccupations'])

          let grade
          switch (doc.data()['grade']) {
            case 'B1':
              grade = '大学１年'
              break
            case 'B2':
              grade = '大学２年'
              break
            case 'B3':
              grade = '大学３年'
              break
            case 'B4':
              grade = '大学４年'
              break
            case 'M1':
              grade = '修士１年'
              break
            case 'M2':
              grade = '修士２年'
              break
            case 'others':
              grade = 'その他'
              break
          }
          commit('setGrade', grade)

          // スカウトを許可しているか、アカウントが削除されているか
          if (!doc.data()['acceptScout'] || doc.data()['isDeleted']) {
            console.log('404');
            // 404
            commit('updateIsLoading', false)
            nuxt.error({ statusCode: 404, message: 'not found' })
          } else {
            // すでに候補者になっているか
            firestore.collection('companies')
              .doc(companyId)
              .collection('candidates')
              .where('user.uid', '==', uid)
              .where('status.rejected', '==', false)
              .where('status.hired', '==', false)
              .get()
              .then(function(snapshot) {
                if (snapshot.empty) {
                  commit('updateIsCandidate', false)
                } else {
                  commit('updateIsCandidate', true)
                }
                commit('updateIsLoading', false)
              })
              .catch(function(error) {
                console.log("Error getting document:", error)
                commit('updateIsLoading', false)
              })
          }
        } else {
          console.log('404');
          // 404
          commit('updateIsLoading', false)
          nuxt.error({ statusCode: 404, message: 'not found' })
        }
      })
      .catch(function(error) {
        commit('updateIsLoading', false)
        console.log("Error getting document:", error)
      })
  },
  scout({commit, state},{user, pic, companyId, message}) {
    var scouts = state.scouts
    const status = {
      scouted: true,
      inbox: false,
      inProcess: false,
      intern: false,
      pass: false,
      contracted: false,
      hired: false,
      rejected: false,
    }

    // encrypt
    var simpleCrypto = new SimpleCrypto(process.env.SECRET_KEY)
    var cipherText = simpleCrypto.encrypt(message)

    const scout = {
      pic: pic,
      message: cipherText,
    }

    firestore.collection('companies').doc(companyId)
      .collection('candidates')
      .add({
        user: user,
        scout: scout,
        status: status,
        createdAt: new Date(),
        type: 'scout',
        isInternExtended: false,
        extendedInternEnd: false,
      })
      .then(() => {
        commit('updateIsCandidate', true)
        // analytics
        event({
          eventCategory: 'user',
          eventAction: 'scout',
          eventLabel: user.uid
        })
      })
      .catch((error) => {
        console.error("Error adding document: ", error)
      })
  },
  updateIsLoading({commit}, isLoading) {
    commit('updateIsLoading', isLoading)
  },
  resetState({commit}) {
    commit('setImageUrl', '')
    commit('setFirstName', '')
    commit('setLastName', '')
    commit('setSelfIntro', '')
    commit('setWhatWantToDo', '')
    commit('setPortfolio', null)
    commit('setSkills', null)
    commit('setLinks', null)
    commit('setEmail', '')
    commit('setUniversity', '')
    commit('setFaculty', '')
    commit('setDepartment', '')
    commit('setLaboratory')
    commit('setGrade', '')
    commit('setGraduationYear', '')
    commit('setAddress', '')
    commit('setBirthDate', '')
    commit('setDesiredOccupatins', null)
    commit('setInterstingFields', null)
    commit('updateIsCandidate', false)
    commit('updateIsLoading', false)
  },
}
