export const strict = false
import { firestore } from '@/plugins/firebase'

export const state = () => ({
  chats: [],
  isLoading: false,
  allChatsQueried: false,
})

export const mutations = {
  setChats(state, chats) {
    state.chats = chats
  },
  addChat(state, chat) {
    state.chats.push(chat)
  },
  resetChats(state) {
    state.chats = []
  },
  updateIsLoading(state, isLoading) {
    state.isLoading = isLoading
  },
  setAllChatsQueried(state) {
    state.allChatsQueried = true
  }
}

export const actions = {
  updateUnreadCount({commit, state}, params) {
    var chats = state.chats
    const chatId = params.id
    chats.forEach((chat, i) => {
      if (chat.chatId == chatId) {
        chat.userUnreadCount = 0
      }
    })
    commit('setChats', chats)
  },
  updateIsLoading({commit}, isLoading) {
    commit('updateIsLoading', isLoading)
  },
  queryChats({commit}, {uid, companyId, chats}) {
    // すでにクエリしているか
    if (chats.length == 0) {
      var chatsRef = firestore.collection('chats').where('messagesExist', '==', true)
      if (uid != null && companyId == null) {
        chatsRef = chatsRef.where('uid', '==', uid)
      } else if (uid == null && companyId != null) {
        chatsRef = chatsRef.where('companyId', '==', companyId)
      }

      return chatsRef.orderBy("updatedAt", "desc").limit(20).get()
        .then(function(snapshot) {
          var docCount = 0
          snapshot.forEach(function(doc) {
            docCount += 1
            const chat = {
              chatId: doc.id,
              uid: doc.data()['uid'],
              profileImageUrl: doc.data()['profileImageUrl'],
              userName: doc.data()['userName'],
              companyId: doc.data()['companyId'],
              companyImageUrl: doc.data()['companyImageUrl'],
              companyName: doc.data()['companyName'],
              lastMessage: doc.data()['lastMessage'],
              picUnreadCount: doc.data()['picUnreadCount'],
              userUnreadCount: doc.data()['userUnreadCount'],
              updatedAt: doc.data()['updatedAt']
            }
            commit('addChat', chat)
          })
          if (docCount == 0) {
            commit('setAllChatsQueried')
          }
          commit('updateIsLoading', false)
        })
        .catch(function(error) {
          commit('updateIsLoading', false)
          console.log("Error getting document:", error)
        })
    } else {
      var chatsRef = firestore.collection('chats').where('messagesExist', '==', true)
      if (uid != null && companyId == null) {
        chatsRef = chatsRef.where('uid', '==', uid)
      } else if (uid == null && companyId != null) {
        chatsRef = chatsRef.where('companyId', '==', companyId)
      }

      const lastIndex = chats.length - 1
      const lastDate = chats[lastIndex].updatedAt
      return chatsRef
        .orderBy('updatedAt', 'desc')
        .startAfter(lastDate)
        .limit(10)
        .get()
        .then(function(snapshot) {
          var docCount = 0
          snapshot.forEach(function(doc) {
            docCount += 1
            const chat = {
              chatId: doc.id,
              uid: doc.data()['uid'],
              profileImageUrl: doc.data()['profileImageUrl'],
              userName: doc.data()['userName'],
              companyId: doc.data()['companyId'],
              companyImageUrl: doc.data()['companyImageUrl'],
              companyName: doc.data()['companyName'],
              lastMessage: doc.data()['lastMessage'],
              picUnreadCount: doc.data()['picUnreadCount'],
              userUnreadCount: doc.data()['userUnreadCount'],
              updatedAt: doc.data()['updatedAt']
            }
            commit('addChat', chat)
          })
          if (docCount == 0) {
            commit('setAllChatsQueried')
          }
          commit('updateIsLoading', false)
        })
        .catch(function(error) {
          commit('updateIsLoading', false)
          console.log("Error getting document:", error)
        })
    }
  },
  resetState({commit}) {
    commit('resetChats')
    commit('updateIsLoading', false)
    commit('setAllChatsQueried', false)
  },
}
