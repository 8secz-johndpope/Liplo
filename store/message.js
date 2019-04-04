export const strict = false
import { firestore } from '@/plugins/firebase'

export const state = () => ({

})

export const mutations = {

}

export const actions = {
  postMessageFromUser({commit}, {params, message, uid, imageUrl, name}) {
    const chatId = params.id
    const user = {
      uid: uid,
      imageUrl: imageUrl,
      name: name,
    }

    return firestore.collection('chats').doc(chatId)
      .collection('messages')
      .add({
        message: message,
        user: user,
        createdAt: new Date(),
      })
      .then(() => {

      })
      .catch((error) => {
        console.error("Error adding document: ", error)
      })
  },
  postMessageFromPic({commit}, {params, message, uid, imageUrl, name}) {
    const chatId = params.id
    const pic = {
      uid: uid,
      imageUrl: imageUrl,
      name: name,
    }

    return firestore.collection('chats').doc(chatId)
      .collection('messages')
      .add({
        message: message,
        pic: pic,
        createdAt: new Date(),
      })
      .then(() => {

      })
      .catch((error) => {
        console.error("Error adding document: ", error)
      })
  },
}
