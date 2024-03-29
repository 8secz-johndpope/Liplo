const functions = require('firebase-functions')
const nodemailer = require('nodemailer')
// const sgMail = require('@sendgrid/mail')
// const sgApiKey = functions.config().sendgrid.api_key
// sgMail.setApiKey(sgApiKey)

const appUrl = functions.config().app.url
const gmailEmail = functions.config().gmail.email
const gmailPassword = functions.config().gmail.password
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword
    }
})
const admin = require('firebase-admin')

admin.initializeApp()


// 採用をした時に管理者に通知
exports.sendPaidActionMailToAdmin = functions.region('asia-northeast1')
  .firestore
  .document('paidActions/{paidActionId}')
  .onCreate((snap, context) => {
    const paidActionId = context.params.paidActionId
    const companyId = snap.data().companyId
    const type = snap.data().type
    const isFree = snap.data().isFree
    const companyName = snap.data().companyName
    const invoiceEmail = snap.data().invoiceEmail
    const plan = snap.data().plan
    var createdAt = snap.data().createdAt
    let date = new Date( createdAt.seconds * 1000 )
    let year  = date.getFullYear()
    let month = date.getMonth() + 1
    let day  = date.getDate()
    createdAt = `${year}/${month}/${day}`

    const mailOptions = {
      from: `Liplo <noreply@liplo.jp>`,
      to: 'go26dev@gmail.com',
    }
    mailOptions.subject = `[Liplo] 採用あり`
    mailOptions.html = `
      <p><b>paidActionId: </b>${paidActionId}</p>
      <p><b>type: </b>${type}</p>
      <p><b>isFree: </b>${isFree}</p>
      <p><b>companyId: </b>${companyId}</p>
      <p><b>companyName: </b>${companyName}</p>
      <p><b>invoiceEmail: </b>${invoiceEmail}</p>
      <p><b>plan: </b>${plan}</p>
      <p><b>Date: </b>${createdAt}</p>
    `
    mailTransport.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err)
      }
      console.log('completed.')
    })
    return 0
  })

// 企業メンバーが招待された時の処理
// exports.sendMailToInvitedMember = functions.region('asia-northeast1')
//   .firestore
//   .document('companies/{companyId}/invitedMembers/{memberId}')
//   .onCreate((snap, context) => {
//     const companyId = context.params.companyId
//     const email = snap.data().email
//     const companyName = snap.data().companyName
//     const userName = snap.data().userName
//     const url = `${appUrl}/?type=invited&id=${companyId}`
//
//     // 招待されたユーザーにメール送信
//     const msg = {
//       to: email,
//       from: 'Liplo<noreply@liplo.jp>',
//       subject: `[招待] ${userName}さんが${companyName}にあなたを招待しました。`,
//       html: `
//         <body>
//           <table border="0" cellpadding="0" cellspacing="0" width="100%">
//             <tr>
//               <td align="center">
//                 <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
//                   <tr>
//                     <td
//                       style="
//                         padding: 12px;
//                         font-size: 16px;
//                         line-height: 32px;
//                       "
//                     >
//                       <h1
//                         style="
//                           color: #555555;
//                           margin: 14px 12px 40px;
//                           font-size: 20px;
//                           font-weight: 400;
//                           line-height: 24px;
//                         "
//                       >
//                         ${userName}さんが${companyName}にあなたを招待しました。
//                       </h1>
//                       <div style="margin: 0 16px 60px; color: #555555">
//                         下のボタンからサインアップできます。
//                       </div>
//                     </td>
//                   </tr>
//                   <tr>
//                     <td align="left" bgcolor="#ffffff">
//                       <table border="0" cellpadding="0" cellspacing="0" width="100%">
//                         <tr>
//                           <td align="center" bgcolor="#ffffff" style="padding: 20px;">
//                             <table border="0" cellpadding="0" cellspacing="0">
//                               <tr>
//                                 <td align="center" bgcolor="#26A69A" style="border-radius: 6px;">
//                                   <a
//                                     href="${url}"
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     style="
//                                       display: inline-block;
//                                       padding: 10px 50px;
//                                       font-size: 16px;
//                                       color: #ffffff;
//                                       text-decoration: none;
//                                       border-radius: 6px;
//                                     "
//                                   >サインアップ</a>
//                                 </td>
//                               </tr>
//                             </table>
//                           </td>
//                         </tr>
//                       </table>
//                     </td>
//                   </tr>
//                   <tr>
//                     <td
//                       align="center"
//                       style="
//                         color: #777777;
//                         padding: 60px 12px 0px;
//                         font-size: 12px;
//                         line-height: 24px;
//                       "
//                     >
//                       <hr size=1 color="#dddddd">
//                       <p style="margin: 0; padding-top: 12px"> このメールに心当たりがない方は、お手数をおかけしますがこのメールを破棄してください。</p>
//                     </td>
//                   </tr>
//                   <tr>
//                     <td
//                       align="center"
//                       style="
//                         color: #777777;
//                         padding: 20px;
//                         font-size: 14px;
//                         line-height: 24px;
//                       "
//                     >
//                       <p style="margin: 0;"> Liplo Inc.</p>
//                     </td>
//                   </tr>
//                 </table>
//               </td>
//             </tr>
//           </table>
//         </body>
//       `,
//     }
//     return sgMail.send(msg).then(() => {
//       console.log('sendMailToInvitedMember completed. sent to:', email)
//     })
//   })

// 採用したときに、paidActions に追加
exports.candidateHasChanged = functions.region('asia-northeast1')
  .firestore
  .document('companies/{companyId}/candidates/{candidateId}')
  .onUpdate((change, context) => {
    const newValue = change.after.data()
    const previousValue = change.before.data()
    const beforeStatus = previousValue.status
    const newStatus = newValue.status
    // ステータスに変化がない場合終了
    if (
      newStatus.scouted == beforeStatus.scouted &&
      newStatus.inbox == beforeStatus.inbox &&
      newStatus.inProcess == beforeStatus.inProcess &&
      newStatus.intern == beforeStatus.intern &&
      newStatus.pass == beforeStatus.pass &&
      newStatus.contracted == beforeStatus.contracted &&
      newStatus.hired == beforeStatus.hired &&
      newStatus.rejected == beforeStatus.rejected
    ) {
      return 0
    }

    const companyId = context.params.companyId
    const candidateId = context.params.candidateId
    const user = newValue.user
    const plan = newValue.plan
    const feedback = newValue.feedback
    const isInternExtended = newValue.isInternExtended
    const extendedInternEnd = newValue.extendedInternEnd
    const createdAt = newValue.updatedAt
    const updatedAt = newValue.updatedAt
    const career = newValue.career
    let occupation
    if (career) {
      occupation = career.internOccupation
    }
    const type = newValue.type
    let pass = newValue.pass
    let passType
    let passTypeText
    if (pass) {
      // パスの種類
      passType = newValue.pass.type
      if (pass.type == 'hiring') {
        passTypeText = '入社パス'
      } else if (pass.type == 'offer') {
        passTypeText = '内定パス'
      } else if (pass.type == 'limited') {
        passTypeText = '先着パス'
      }
    }

    // company の候補者カウント, hiringPassCount 更新
    const companyInfoRef = admin.firestore().collection('companies').doc(companyId)
      .collection('info').doc(companyId)

    if (!(beforeStatus.intern && newStatus.pass)) {
      return admin.firestore().runTransaction(function(transaction) {
        return transaction.get(companyInfoRef).then(function(companyInfoDoc) {
          if (companyInfoDoc.exists) {
            const companyName = companyInfoDoc.data().companyName
            const companyImageUrl = companyInfoDoc.data().companyImageUrl
            let currentCandidates = companyInfoDoc.data().currentCandidates
            let allCandidates = companyInfoDoc.data().allCandidates
            let hiringPassCount = companyInfoDoc.data().hiringPassCount
            let companyFeedbackData = companyInfoDoc.data().feedback
            const invoiceEmail = companyInfoDoc.data().invoiceEmail

            // candidate count 更新
            if (beforeStatus.scouted) {
              currentCandidates.scouted -= 1
            } else if (beforeStatus.inbox) {
              currentCandidates.inbox -= 1
            } else if (beforeStatus.inProcess) {
              currentCandidates.inProcess -= 1
            } else if (beforeStatus.intern) {
              currentCandidates.intern -= 1
            } else if (beforeStatus.pass) {
              currentCandidates.pass -= 1
            } else if (beforeStatus.contracted) {
              currentCandidates.contracted -= 1
            }

            if (newStatus.inProcess) {
              currentCandidates.inProcess += 1
              allCandidates.inProcess.all += 1
              if (type == 'scout') {
                allCandidates.inProcess.scout += 1
              } else {
                allCandidates.inProcess.application += 1
              }
            } else if (newStatus.intern) {
              currentCandidates.intern += 1
              allCandidates.intern.all += 1
              if (type == 'scout') {
                allCandidates.intern.scout += 1
              } else {
                allCandidates.intern.application += 1
              }
            } else if (newStatus.contracted) {
              currentCandidates.contracted += 1
              allCandidates.contracted.all += 1
              if (type == 'scout') {
                allCandidates.contracted.scout += 1
              } else {
                allCandidates.contracted.application += 1
              }
            } else if (newStatus.hired) {
              currentCandidates.hired += 1
              allCandidates.hired.all += 1
              if (type == 'scout') {
                allCandidates.hired.scout += 1
              } else {
                allCandidates.hired.application += 1
              }
            } else if (newStatus.rejected) {
              allCandidates.rejected.all += 1
              if (type == 'scout') {
                allCandidates.rejected.scout += 1
              } else {
                allCandidates.rejected.application += 1
              }
            }

            var companyData = {
              currentCandidates: currentCandidates,
              allCandidates: allCandidates,
            }

            // company feedback all 更新
            if (beforeStatus.intern) {
              companyFeedbackData.all += 1
              if (feedback) {
                companyFeedbackData.writtenCount += 1
              }
              companyData.feedback = companyFeedbackData

              const companyDetailRef = admin.firestore().collection('companies')
                .doc(companyId).collection('detail').doc(companyId)
              transaction.update(companyDetailRef, {
                feedback: companyFeedbackData,
              })
            }

            transaction.update(companyInfoRef, companyData)

            companyData.invoiceEmail = invoiceEmail
            companyData.companyName = companyName
            if (companyImageUrl) {
              companyData.imageUrl = companyImageUrl
            }
            companyData.feedback = companyFeedbackData
            return companyData
          }
        })
      }).then(companyData => {
        console.log('update candidates count completed.')

        const companyName = companyData.companyName
        const companyImageUrl = companyData.imageUrl
        let allCandidates = companyData.allCandidates
        let companyFeedbackData = companyData.feedback
        const invoiceEmail = companyData.invoiceEmail

        if (beforeStatus.inProcess && newStatus.intern) {
          const batch = admin.firestore().batch()

          // paidActions に追加
          const paidActionRef = admin.firestore().collection('paidActions').doc()
          let paidActionData = {
            companyId: companyId,
            companyName: companyName,
            type: 'intern',
            invoiceEmail: invoiceEmail,
            plan: plan,
            createdAt: new Date()
          }
          if (companyImageUrl) {
            paidActionData.companyImageUrl = companyImageUrl
          }
          if (plan == 0) {
            let isFree = allCandidates.intern.all > 1 ? false : true
            paidActionData.isFree = isFree
          } else {
            paidActionData.isFree = false
          }
          batch.set(paidActionRef, paidActionData)

          // キャリア更新
          const careerRef = admin.firestore().collection('users').doc(user.uid)
            .collection('career').doc(career.careerId)
          var careerData = {
            type: 'intern',
            occupation: occupation,
            companyId: companyId,
            companyName: companyName,
            startedAt: createdAt,
            end: false,
            isReviewWritten: false,
            isInternExtended: false,
            extendedInternEnd: false,
          }
          if (companyImageUrl) {
            careerData.companyImageUrl = companyImageUrl
          }
          batch.set(careerRef, careerData)

          batch.commit()
            .then(() => {
              console.log('update paidActions & career completed.')
            })
            .catch((error) => {
              console.error("Error", error)
            })

          // userスコア更新
          admin.firestore().collection('users')
            .doc(user.uid)
            .update({
              points: admin.firestore.FieldValue.increment(1)
            })
            .then(() => {
              console.log('update user score completed.')
            })
            .catch((error) => {
              console.error("Error", error)
            })

          admin.firestore().collection('users')
            .doc(user.uid)
            .collection('profile')
            .doc(user.uid)
            .update({
              points: admin.firestore.FieldValue.increment(1)
            })
            .then(() => {
              console.log('update user profile score completed.')
            })
            .catch((error) => {
              console.error("Error", error)
            })
        } else if (beforeStatus.intern) {
          const batch = admin.firestore().batch()

          // feedbacks 追加
          const feedbackId = admin.firestore().collection('feedbacks').doc().id
          const feedbackRef = admin.firestore().collection('feedbacks').doc(feedbackId)
          var feedbackData = {
            uid: user.uid,
            userName: user.name,
            companyId: companyId,
            companyName: companyName,
            occupation: occupation,
            createdAt: updatedAt,
          }
          if (user.imageUrl) {
            feedbackData.profileImageUrl = user.imageUrl
          }
          if (companyImageUrl) {
            feedbackData.companyImageUrl = companyImageUrl
          }

          if (feedback == null) {
            feedbackData.isWritten = false
          } else {
            feedbackData.isWritten = true
            if (feedback.goodPoint) {
              feedbackData.goodPoint = feedback.goodPoint
            }
            if (feedback.advice) {
              feedbackData.advice = feedback.advice
            }
          }
          batch.set(feedbackRef, feedbackData)

          if (feedback != null) {
            // フィードバック送信 通知
            let feedbackNotificationRef = admin.firestore().collection('users').doc(user.uid)
              .collection('notifications').doc()
            let feedbackUrl = '/user/feedbacks/' + feedbackId
            batch.set(feedbackNotificationRef, {
              type: 'normal',
              isImportant: false,
              content: companyName + 'からフィードバックが送られました！ ',
              createdAt: new Date(),
              url: feedbackUrl,
              isUnread: true,
            })
          }

          // キャリア更新（インターンを延長していない場合）
          if (!isInternExtended) {
            const careerRef = admin.firestore().collection('users').doc(user.uid)
              .collection('career').doc(career.careerId)
            var careerData = {
              end: true,
              endedAt: new Date()
            }
            batch.update(careerRef, careerData)

            // インターン終了 通知
            let reviewNotificationRef = admin.firestore().collection('users').doc(user.uid)
              .collection('notifications').doc()
            let reviewUrl = '/user/reviews/new?id=' + career.careerId
            batch.set(reviewNotificationRef, {
              type: 'normal',
              isImportant: true,
              content:
                'インターンが終了しました。お疲れ様でした！ ' +
                companyName +
                'のレビューをしましょう！',
              createdAt: new Date(),
              url: reviewUrl,
              isUnread: true,
            })
          }

          batch.commit()
            .then(() => {
              if (newValue.feedback != null) {
                console.log('set feedback & update career & send notification completed.')
              } else {
                console.log('set feedback & update career completed.')
              }
            })
            .catch((error) => {
              console.error("Error", error)
            })
        } else if (newStatus.contracted) {

          let paidActionData = {
            companyId: companyId,
            companyName: companyName,
            type: 'hired',
            plan: plan,
            invoiceEmail: invoiceEmail,
            createdAt: new Date()
          }

          paidActionData.isFree = (plan == 2)

          if (companyImageUrl) {
            paidActionData.companyImageUrl = companyImageUrl
          }

          admin.firestore()
            .collection('paidActions')
            .add(paidActionData)
            .then(() => {
              console.log('set paidActions completed.')
            })
            .catch((error) => {
              console.error("Error", error)
            })
        } else if (newStatus.hired) {
          // キャリア更新
          var careerData = {
            type: 'hired',
            occupation: occupation,
            companyId: companyId,
            companyName: companyName,
            startedAt: createdAt,
            end: false,
          }
          if (companyImageUrl) {
            careerData.companyImageUrl = companyImageUrl
          }

          admin.firestore().collection('users')
            .doc(user.uid)
            .collection('career')
            .add(careerData)
            .then(() => {
              console.log('set career completed.')
            })
            .catch((error) => {
              console.error("Error", error)
            })
        }
      }).catch(error => {
          console.error(error)
      })
    }
    if (beforeStatus.intern && newStatus.pass) {
      const companyInfoRef = admin.firestore().collection('companies').doc(companyId)
      .collection('info').doc(companyId)
      const yearPassRef = admin.firestore().collection('companies').doc(companyId)
        .collection('yearPasses').doc(String(pass.joiningYear))

      return admin.firestore().runTransaction(function(transaction) {
        return transaction.getAll(companyInfoRef, yearPassRef).then(function(docs) {
          const companyInfoDoc = docs[0]
          const yearPassDoc = docs[1]

          if (companyInfoDoc.exists) {
            const companyName = companyInfoDoc.data().companyName
            const companyImageUrl = companyInfoDoc.data().companyImageUrl
            let currentCandidates = companyInfoDoc.data().currentCandidates
            let allCandidates = companyInfoDoc.data().allCandidates
            let hiringPassCount = companyInfoDoc.data().hiringPassCount
            let companyFeedbackData = companyInfoDoc.data().feedback

            // candidate count 更新
            currentCandidates.intern -= 1
            currentCandidates.pass += 1
            allCandidates.pass.all += 1
            if (type == 'scout') {
              allCandidates.pass.scout += 1
            } else {
              allCandidates.pass.application += 1
            }

            var companyData = {
              currentCandidates: currentCandidates,
              allCandidates: allCandidates,
              hiringPassCount: hiringPassCount
            }

            // company feedback all 更新
            companyFeedbackData.all += 1
            if (feedback) {
              companyFeedbackData.writtenCount += 1
            }
            companyData.feedback = companyFeedbackData

            const companyDetailRef = admin.firestore().collection('companies')
              .doc(companyId).collection('detail').doc(companyId)
            transaction.update(companyDetailRef, {
              feedback: companyFeedbackData,
            })

            if (pass.type == 'hiring') {
              // 入社パスの場合、hiringPassCount を更新
              if (hiringPassCount) {
                companyData.hiringPassCount = hiringPassCount + 1
              } else {
                companyData.hiringPassCount = 1
              }
            } else {
              // 内定パスまたは先着パスの場合
              if (yearPassDoc.exists) {
                // doc が存在する場合
                let count = yearPassDoc.data().count
                if (pass.type == 'offer') {
                  // 内定パス
                  count.offer.all += 1
                } else if (pass.type == 'limited') {
                  // 先着パス
                  count.limited.all += 1
                }
                transaction.update(yearPassRef, {
                  count: count
                })
              } else {
                // doc が存在しない場合
                let passData
                if (pass.type == 'offer') {
                  // 内定パス
                  passData = {
                    count: {
                      hiring: {
                        used: 0
                      },
                      offer: {
                        all: 1,
                        used: 0
                      },
                      limited: {
                        all: 0,
                        used: 0
                      }
                    }
                  }
                } else if (pass.type == 'limited') {
                  // 先着パス
                  passData = {
                    count: {
                      hiring: {
                        used: 0
                      },
                      offer: {
                        all: 0,
                        used: 0
                      },
                      limited: {
                        all: 1,
                        used: 0
                      }
                    }
                  }
                }
                passData.year = pass.joiningYear
                passData.limit = null
                transaction.set(yearPassRef, passData)
              }
            }

            transaction.update(companyInfoRef, companyData)

            companyData.companyName = companyName
            if (companyImageUrl) {
              companyData.imageUrl = companyImageUrl
            }
            companyData.feedback = companyFeedbackData
            return companyData
          }
        })
      }).then(companyData => {
        console.log("update pass count completed.")

        const companyName = companyData.companyName
        const companyImageUrl = companyData.imageUrl
        let allCandidates = companyData.allCandidates
        let companyFeedbackData = companyData.feedback

        const batch = admin.firestore().batch()

        // feedback 追加
        var feedbackData = {
          uid: user.uid,
          userName: user.name,
          companyId: companyId,
          companyName: companyName,
          occupation: occupation,
          createdAt: updatedAt,
        }
        if (user.imageUrl) {
          feedbackData.profileImageUrl = user.imageUrl
        }
        if (companyImageUrl) {
          feedbackData.companyImageUrl = companyImageUrl
        }

        if (feedback == null) {
          feedbackData.isWritten = false
        } else {
          feedbackData.isWritten = true
          if (feedback.goodPoint) {
            feedbackData.goodPoint = feedback.goodPoint
          }
          if (feedback.advice) {
            feedbackData.advice = feedback.advice
          }
        }

        const feedbackId = admin.firestore().collection('feedbacks').doc().id

        const feedbackRef = admin.firestore().collection('feedbacks').doc(feedbackId)
        batch.set(feedbackRef, feedbackData)

        if (feedback != null) {
          // フィードバック送信 通知
          let feedbackNotificationRef = admin.firestore().collection('users').doc(user.uid)
            .collection('notifications').doc()
          let feedbackUrl = '/user/feedbacks/' + feedbackId
          batch.set(feedbackNotificationRef, {
            type: 'normal',
            isImportant: false,
            content: companyName + 'からフィードバックが送られました！ ',
            createdAt: new Date(),
            url: feedbackUrl,
            isUnread: true,
          })
        }

        // キャリア更新
        const careerRef = admin.firestore().collection('users').doc(user.uid)
          .collection('career').doc(career.careerId)
        var careerData = {
          end: true,
          endedAt: new Date()
        }
        batch.update(careerRef, careerData)
        // インターン終了 通知
        let reviewNotificationRef = admin.firestore().collection('users').doc(user.uid)
          .collection('notifications').doc()
        let reviewUrl = '/user/reviews/new?id=' + career.careerId
        batch.set(reviewNotificationRef, {
          type: 'normal',
          isImportant: true,
          content:
            'インターンが終了しました。お疲れ様でした！ ' +
            companyName +
            'のレビューをしましょう！',
          createdAt: new Date(),
          url: reviewUrl,
          isUnread: true,
        })

        // pass 追加
        var passData = {
          candidateId: candidateId,
          uid: user.uid,
          userName: user.name,
          companyId: companyId,
          companyName: companyName,
          createdAt: updatedAt,
          type: pass.type,
          expirationDate: pass.expirationDate,
          occupation: pass.occupation,
          picMessage: pass.message,
          pic: pass.pic,
          isAccepted: false,
          isContracted: false,
          isValid: true,
        }
        if (user.imageUrl) {
          passData.profileImageUrl = user.imageUrl
        }
        if (companyImageUrl) {
          passData.companyImageUrl = companyImageUrl
        }
        if (pass.type != 'hiring') {
          passData.joiningYear = pass.joiningYear
        }

        const passRef = admin.firestore().collection('passes').doc(pass.passId)
        batch.set(passRef, passData)

        // pass 通知
        let passNotificationRef = admin.firestore().collection('users').doc(user.uid)
          .collection('notifications').doc()
        let passUrl = '/user/passes/' + pass.passId
        batch.set(passNotificationRef, {
          type: 'normal',
          isImportant: true,
          content: `${companyName}から${passTypeText}が送られました！ 確認してみましょう！`,
          createdAt: new Date(),
          url: passUrl,
          isUnread: true,
        })
        batch.commit()
          .then(() => {
            // パスが渡されたユーザーにメール送信
            admin.firestore().collection('users')
              .doc(user.uid)
              .get()
              .then(userDoc => {
                if (userDoc.exists) {
                  if (userDoc.data().notificationsSetting == null || userDoc.data().notificationsSetting.pass) {
                    // const msg = {
                    //   to: userDoc.data().email,
                    //   from: 'Liplo<noreply@liplo.jp>',
                    //   subject: `[パス] ${companyName}から${passTypeText}が届きました！`,
                    //   html: `
                    //     <body>
                    //       <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    //         <tr>
                    //           <td align="center">
                    //             <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    //               <tr>
                    //                 <td
                    //                   style="
                    //                     padding: 12px;
                    //                     font-size: 16px;
                    //                     line-height: 32px;
                    //                   "
                    //                 >
                    //                   <h1
                    //                     style="
                    //                       color: #555555;
                    //                       margin: 14px 12px 40px;
                    //                       font-size: 20px;
                    //                       font-weight: 400;
                    //                       line-height: 24px;
                    //                     "
                    //                   >
                    //                     <div>こんにちは ${user.name} さん</div>
                    //                     <div style="padding-top: 6px">${companyName}から${passTypeText}が届いています！</div>
                    //                   </h1>
                    //                   <div style="margin: 0 16px 60px; color: #555555">
                    //                     下のボタンからパスを確認できます。有効期限が設定されているので、早めにご確認ください。
                    //                   </div>
                    //                 </td>
                    //               </tr>
                    //               <tr>
                    //                 <td align="left" bgcolor="#ffffff">
                    //                   <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    //                     <tr>
                    //                       <td align="center" bgcolor="#ffffff" style="padding: 20px;">
                    //                         <table border="0" cellpadding="0" cellspacing="0">
                    //                           <tr>
                    //                             <td align="center" bgcolor="#26A69A" style="border-radius: 6px;">
                    //                               <a
                    //                                 href="${appUrl}${passUrl}"
                    //                                 target="_blank"
                    //                                 rel="noopener noreferrer"
                    //                                 style="
                    //                                   display: inline-block;
                    //                                   padding: 10px 50px;
                    //                                   font-size: 16px;
                    //                                   color: #ffffff;
                    //                                   text-decoration: none;
                    //                                   border-radius: 6px;
                    //                                 "
                    //                               >確認する</a>
                    //                             </td>
                    //                           </tr>
                    //                         </table>
                    //                       </td>
                    //                     </tr>
                    //                   </table>
                    //                 </td>
                    //               </tr>
                    //               <tr>
                    //                 <td
                    //                   align="center"
                    //                   style="
                    //                     color: #777777;
                    //                     padding: 60px 12px 20px;
                    //                     font-size: 14px;
                    //                     line-height: 24px;
                    //                   "
                    //                 >
                    //                   <hr size=1 color="#dddddd">
                    //                   <p style="margin: 0; padding-top: 12px"> Liplo Inc.</p>
                    //                 </td>
                    //               </tr>
                    //             </table>
                    //           </td>
                    //         </tr>
                    //       </table>
                    //     </body>
                    //   `,
                    // }
                    // sgMail.send(msg).then(() => {
                    //   console.log('New pass email sent to:', userDoc.data().email)
                    // })
                  }
                }
              })
              .catch((error) => {
                console.error("Error getting document", error)
              })
            if (newValue.feedback != null) {
              console.log('set feedback & update career & send notification completed.')
            } else {
              console.log('set feedback & update career completed.')
            }
          })
          .catch((error) => {
            console.error("Error", error)
          })
      }).catch(function(error) {
        console.error(error)
      })
    }
  })

// フィードバックが送られた時、企業のfeedback countを更新
exports.updateCompanyFeedbackCount = functions.region('asia-northeast1')
  .firestore
  .document('feedbacks/{feedbackId}')
  .onUpdate((change, context) => {
    const newValue = change.after.data()
    const previousValue = change.before.data()
    const feedbackId = context.params.feedbackId
    const uid = newValue.uid
    const companyName = newValue.companyName
    const companyId = newValue.companyId
    const isWritten = newValue.isWritten

    if (isWritten && !previousValue.isWritten) {
      // company feedback writtenCount 更新
      const companyInfoRef = admin.firestore().collection('companies').doc(companyId)
        .collection('info').doc(companyId)
      return admin.firestore().runTransaction(function(transaction) {
        return transaction.get(companyInfoRef).then(function(companyInfoDoc) {
          var feedback = companyInfoDoc.data().feedback
          feedback.writtenCount += 1

          transaction.update(companyInfoRef, {
            feedback: feedback
          })
          const companyDetailRef = admin.firestore().collection('companies')
            .doc(companyId).collection('detail').doc(companyId)
          transaction.update(companyDetailRef, {
            feedback: feedback
          })
        })
      }).then(() => {
        // 通知
        const url = '/user/feedbacks/' + feedbackId

        admin.firestore().collection('users')
          .doc(uid)
          .collection('notifications')
          .add({
            type: 'normal',
            isImportant: false,
            content: companyName + 'からフィードバックが送られました！',
            createdAt: new Date(),
            url: url,
            isUnread: true,
          })
          .then(() => {
            console.log('completed.')
          })
          .catch((error) => {
            console.error("Error adding document", error)
          })
      }).catch(error => {
        console.error(error)
      })
    } else {
      return 0
    }
  })

// パスの情報が変更された時の処理 （パスを使用した時、recruiter がパスの入社年度を変更した時）
exports.passHasChanged = functions.region('asia-northeast1')
  .firestore
  .document('passes/{passId}')
  .onUpdate((change, context) => {
    const newValue = change.after.data()
    const previousValue = change.before.data()

    const uid = newValue.uid
    const userName = newValue.userName
    const profileImageUrl = newValue.profileImageUrl
    const userMessage = newValue.userMessage
    const companyId = newValue.companyId
    const companyName = newValue.companyName
    const companyImageUrl = newValue.companyImageUrl
    const type = newValue.type
    const joiningYear = newValue.joiningYear
    const occupation = newValue.occupation
    const candidateId = newValue.candidateId
    const isAccepted = newValue.isAccepted
    const isValid = newValue.isValid
    const passId = context.params.passId

    if (isAccepted == true && previousValue.isAccepted == false) {
      // パスを承諾した時の処理
      let message = {
        message: userMessage,
        createdAt: newValue.acceptedDate,
        type: 'acceptOffer',
        user: {
          uid: uid,
          name: userName
        }
      }
      if (profileImageUrl) {
        message.user.imageUrl = profileImageUrl
      }
      // パスの種類
      var typeText
      if (type == 'hiring') {
        typeText = '入社パス'
      } else if (type == 'offer') {
        typeText = '内定パス'
      } else if (type == 'limited') {
        typeText = '先着パス'
      }

      const companyInfoRef = admin.firestore().collection('companies').doc(companyId)
        .collection('info').doc(companyId)
      const yearPassRef = admin.firestore().collection('companies').doc(companyId)
        .collection('yearPasses').doc(String(joiningYear))

      return admin.firestore().runTransaction(function(transaction) {
        return transaction.getAll(companyInfoRef, yearPassRef).then(function(docs) {
          const companyInfoDoc = docs[0]
          const yearPassDoc = docs[1]

          if (companyInfoDoc.exists) {
            // hiringPassCount 更新
            if (type == 'hiring') {
              transaction.update(companyInfoRef, {
                hiringPassCount: companyInfoDoc.data().hiringPassCount - 1
              })
            }
          }

          if (yearPassDoc.exists) {
            // doc が存在する時
            var count = yearPassDoc.data().count
            if (type == 'hiring') {
              count.hiring.used += 1
            } else if (type == 'offer') {
              count.offer.used += 1
            } else if (type == 'limited') {
              count.limited.used += 1
            }

            transaction.update(yearPassRef, {
              count: count
            })
          } else {
            // doc が存在しない時
            var passData
            if (type == 'hiring') {
              // 内定パス
              passData = {
                count: {
                  hiring: {
                    used: 1
                  },
                  offer: {
                    all: 0,
                    used: 0
                  },
                  limited: {
                    all: 0,
                    used: 0
                  }
                }
              }
            }
            passData.year = joiningYear
            passData.limit = null

            transaction.set(yearPassRef, passData)
          }

          let companyData = {
            members: companyInfoDoc.data().members
          }
          return companyData
        })
      }).then(companyData => {
        console.log("update pass count completed.")

        // メッセージを messages に追加
        admin.firestore()
          .collection('chats')
          .where('uid', '==', uid)
          .where('companyId', '==', companyId)
          .get()
          .then(function(snapshot) {
            var docCount = 0
            snapshot.forEach(function(doc) {
              docCount += 1
              if (docCount == 1) {
                admin.firestore().collection('chats').doc(doc.id)
                  .collection('messages')
                  .add(message)
                  .then(() => {
                    console.log('add message complete.')
                  })
                  .catch((error) => {
                    console.error("Error adding document", error)
                  })
              }
            })
          })
          .catch(err => {
            console.log('Error getting document', err)
          })

        // 通知
        const candidateUrl = '/recruiter/candidates/' + candidateId
        const members = companyData.members
        const batch = admin.firestore().batch()
        members.forEach((member, i) => {
          const notificationRef = admin.firestore().collection('users').doc(member.uid)
            .collection('notifications').doc()
          batch.set(notificationRef, {
            type: 'normal',
            isImportant: true,
            content: `${userName}さんが${typeText}（${joiningYear}年度入社）を使用しました！ 契約が済みましたら、ステータスを採用予定に変更してください。`,
            createdAt: new Date(),
            url: candidateUrl,
            isUnread: true,
          })
        })
        batch.commit()
          .then(() => {
            // パスが使用されたら担当者にメール送信
            members.forEach((member, i) => {
              if (member.notificationsSetting == null || member.notificationsSetting.acceptPass) {
                // const msg = {
                //   to: member.email,
                //   from: 'Liplo<noreply@liplo.jp>',
                //   subject: `[パス] ${userName}さんが${typeText}を使用しました。`,
                //   html: `
                //     <body>
                //       <table border="0" cellpadding="0" cellspacing="0" width="100%">
                //         <tr>
                //           <td align="center">
                //             <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                //               <tr>
                //                 <td
                //                   style="
                //                     padding: 12px;
                //                     font-size: 16px;
                //                     line-height: 32px;
                //                   "
                //                 >
                //                   <h1
                //                     style="
                //                       color: #555555;
                //                       margin: 14px 12px 40px;
                //                       font-size: 20px;
                //                       font-weight: 400;
                //                       line-height: 24px;
                //                     "
                //                   >
                //                     ${userName}さんが${typeText}（${joiningYear}年度入社）を使用しました。
                //                   </h1>
                //                   <div style="margin: 0 16px 60px; color: #555555">
                //                     下のボタンから確認ができます。 契約が済みましたら、ステータスを採用予定に変更してください。
                //                   </div>
                //                 </td>
                //               </tr>
                //               <tr>
                //                 <td align="left" bgcolor="#ffffff">
                //                   <table border="0" cellpadding="0" cellspacing="0" width="100%">
                //                     <tr>
                //                       <td align="center" bgcolor="#ffffff" style="padding: 20px;">
                //                         <table border="0" cellpadding="0" cellspacing="0">
                //                           <tr>
                //                             <td align="center" bgcolor="#26A69A" style="border-radius: 6px;">
                //                               <a
                //                                 href="${appUrl}${candidateUrl}"
                //                                 target="_blank"
                //                                 rel="noopener noreferrer"
                //                                 style="
                //                                   display: inline-block;
                //                                   padding: 10px 50px;
                //                                   font-size: 16px;
                //                                   color: #ffffff;
                //                                   text-decoration: none;
                //                                   border-radius: 6px;
                //                                 "
                //                               >確認する</a>
                //                             </td>
                //                           </tr>
                //                         </table>
                //                       </td>
                //                     </tr>
                //                   </table>
                //                 </td>
                //               </tr>
                //               <tr>
                //                 <td
                //                   align="center"
                //                   style="
                //                     color: #777777;
                //                     padding: 60px 12px 20px;
                //                     font-size: 14px;
                //                     line-height: 24px;
                //                   "
                //                 >
                //                   <hr size=1 color="#dddddd">
                //                   <p style="margin: 0; padding-top: 12px"> Liplo Inc.</p>
                //                 </td>
                //               </tr>
                //             </table>
                //           </td>
                //         </tr>
                //       </table>
                //     </body>
                //   `,
                // }
                // sgMail.send(msg).then(() => {
                //   console.log('New accept pass email sent to:', member.email)
                // })
              }
            })
            console.log('send notification, mail to recruiter complete.')
          })
          .catch((error) => {
            console.error("Error", error)
          })
      }).catch(function(error) {
        console.error(error)
      })
    } else if (
      type == 'hiring' &&
      isAccepted == false &&
      isValid == false &&
      previousValue.isValid == true
    ) {
      return admin.firestore()
        .collection('companies')
        .doc(companyId)
        .collection('info')
        .doc(companyId)
        .update({
          hiringPassCount: admin.firestore.FieldValue.increment(-1)
        })
        .then(() => {
          console.log('update hiringPassCount completed.')
        })
        .catch((error) => {
          console.error("Error updating document", error)
        })
    } else if (
      type != 'hiring' &&
      joiningYear &&
      previousValue.joiningYear &&
      joiningYear != previousValue.joiningYear
    ) {
      // recruiter がパスの入社年度を変更した時
      const previousYearPassRef = admin.firestore().collection('companies').doc(companyId)
        .collection('yearPasses').doc(String(previousValue.joiningYear))

      const newYearPassRef = admin.firestore().collection('companies').doc(companyId)
        .collection('yearPasses').doc(String(joiningYear))

      return admin.firestore().runTransaction(function(transaction) {
        return transaction.getAll(previousYearPassRef, newYearPassRef).then(function(docs) {
          const previousDoc = docs[0]
          const newDoc = docs[1]

          // 変更前の入社年度のパスカウント　更新
          if (previousDoc.exists) {
            var count = previousDoc.data().count
            var passData
            if (type == 'offer') {
              // 内定パス
              count.offer.all -= 1

              // 使用済みなら usedも-1
              if (isAccepted) {
                count.offer.used -= 1
              }
            } else if (type == 'limited') {
              // 先着パス
              count.limited.all -= 1

              // 使用済みなら usedも-1
              if (isAccepted) {
                count.limited.used -= 1
              }
            }

            transaction.update(previousYearPassRef, {
              count: count
            })
          }

          // 変更後の入社年度のパスカウント更新
          if (newDoc.exists) {
            // doc が存在する場合
            var count = newDoc.data().count
            if (type == 'offer') {
              // 内定パス
              count.offer.all += 1

              // 使用済みなら usedも+1
              if (isAccepted) {
                count.offer.used += 1
              }
            } else if (type == 'limited') {
              // 先着パス
              count.limited.all += 1

              // 使用済みなら usedも+1
              if (isAccepted) {
                count.limited.used += 1
              }
            }

            transaction.update(newYearPassRef, {
              count: count
            })
          } else {
            // doc が存在しない場合
            var passData
            if (type == 'offer') {
              // 内定パス
              passData = {
                count: {
                  hiring: {
                    used: 0
                  },
                  offer: {
                    all: 1,
                    used: 0
                  },
                  limited: {
                    all: 0,
                    used: 0
                  }
                }
              }
              // 使用済みなら usedも+1
              if (isAccepted) {
                passData.count.offer.used += 1
              }
            } else if (type == 'limited') {
              // 先着パス
              passData = {
                count: {
                  hiring: {
                    used: 0
                  },
                  offer: {
                    all: 0,
                    used: 0
                  },
                  limited: {
                    all: 1,
                    used: 0
                  }
                }
              }
              // 使用済みなら usedも+1
              if (isAccepted) {
                passData.count.limited.used += 1
              }
            }
            passData.year = joiningYear
            passData.limit = null

            transaction.set(newYearPassRef, passData)
          }
        })
      }).then(() => {
        console.log("update pass count")
      }).catch(error => {
        console.error(error)
      })
    } else {
      return 0
    }
  })

// recruiterがスカウトした時の処理
exports.scoutUser = functions.region('asia-northeast1')
  .firestore
  .document('companies/{companyId}/candidates/{candidateId}')
  .onCreate((snap, context) => {
    if (snap.data().status == null || snap.data().status.scouted != true) {
      return 0
    }

    const user = snap.data().user
    const pic = snap.data().scout.pic
    const message = snap.data().scout.message
    const createdAt = snap.data().createdAt
    const companyId = context.params.companyId
    const candidateId = context.params.candidateId

    // company の応募者数の更新、応募者の情報格納, スカウトメッセージ送信
    const companyInfoRef = admin.firestore().collection('companies').doc(companyId)
      .collection('info').doc(companyId)

    return admin.firestore().runTransaction(function(transaction) {
      return transaction.get(companyInfoRef).then(function(companyInfoDoc) {
        if (companyInfoDoc.exists) {
          const companyName = companyInfoDoc.data().companyName
          const companyImageUrl = companyInfoDoc.data().companyImageUrl
          const members = companyInfoDoc.data().members
          var currentCandidates = companyInfoDoc.data().currentCandidates
          var allCandidates = companyInfoDoc.data().allCandidates

          // company の応募者数の更新、応募者の情報格納
          if (currentCandidates) {
            currentCandidates.scouted += 1
          } else {
            currentCandidates = {
              scouted: 1,
              inbox: 0,
              inProcess: 0,
              intern: 0,
              pass: 0,
              contracted: 0,
              hired: 0
            }
          }

          const initialValue = {
            all: 0,
            scout: 0,
            application: 0,
          }

          if (allCandidates) {
            allCandidates.scouted += 1
          } else {
            allCandidates = {
              scouted: 1,
              inbox: 0,
              inProcess: initialValue,
              intern: initialValue,
              pass :initialValue,
              contracted: initialValue,
              hired: initialValue,
              rejected: initialValue,
            }
          }

          // 候補者カウント更新
          transaction.update(companyInfoRef, {
            currentCandidates: currentCandidates,
            allCandidates: allCandidates,
          })
          return companyInfoDoc
        }
      })
    }).then((companyInfoDoc) => {
      console.log('update candidates count completed.')

      const companyName = companyInfoDoc.data().companyName
      const companyImageUrl = companyInfoDoc.data().companyImageUrl
      const members = companyInfoDoc.data().members

      // scoutedUsersに追加
      admin.firestore()
        .collection('companies')
        .doc(companyId)
        .collection('scoutedUsers')
        .add({
          user: user,
          createdAt: createdAt,
          candidateId: candidateId
        })
        .then(() => {
          console.log('set scoutedUsers completed.')
        })
        .catch((error) => {
          console.error("Error", error)
        })

      // chatIdをcandidateに格納, chatにスカウト メッセージを送信(chatがなければ作成), ユーザーにメール送信
      admin.firestore()
        .collection('chats')
        .where('companyId', '==', companyId)
        .where('uid', '==', user.uid)
        .get()
        .then(function(snapshot) {
          if (!snapshot.empty) {
            var docCount = 0
            snapshot.forEach(function(chatDoc) {
              docCount += 1
              if (docCount == 1) {
                const batch = admin.firestore().batch()
                // スカウトメッセージ作成
                const messagesRef = admin.firestore().collection('chats').doc(chatDoc.id)
                  .collection('messages').doc()
                batch.set(messagesRef, {
                  pic: pic,
                  message: message,
                  createdAt: createdAt,
                  type: 'scout',
                })
                // candidate に chatId 格納
                const candidateRef = admin.firestore().collection('companies').doc(companyId)
                  .collection('candidates').doc(candidateId)
                batch.update(candidateRef, {
                  chatId: chatDoc.id
                })
                // 通知
                const notificationRef = admin.firestore().collection('users').doc(user.uid)
                  .collection('notifications').doc()
                const chatUrl = '/messages/' + chatDoc.id
                batch.set(notificationRef, {
                  type: 'normal',
                  isImportant: true,
                  content: companyName + 'にスカウトされました！ メッセージを確認してみましょう。',
                  createdAt: new Date(),
                  url: chatUrl,
                  isUnread: true,
                })
                batch.commit()
                  .then(() => {
                    admin.firestore().collection('users')
                      .doc(user.uid)
                      .get()
                      .then(userDoc => {
                        if (userDoc.exists) {
                          if (userDoc.data().notificationsSetting == null || userDoc.data().notificationsSetting.scout) {
                            // スカウトされたユーザーにメール送信
                            // const msg = {
                            //   to: userDoc.data().email,
                            //   from: 'Liplo<noreply@liplo.jp>',
                            //   subject: `[スカウト] ${companyName}にスカウトされました！ 返事をして話を聞きに行ってみましょう！`,
                            //   html: `
                            //     <body>
                            //       <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            //         <tr>
                            //           <td align="center">
                            //             <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            //               <tr>
                            //                 <td
                            //                   style="
                            //                     padding: 12px;
                            //                     font-size: 16px;
                            //                     line-height: 32px;
                            //                   "
                            //                 >
                            //                   <h1
                            //                     style="
                            //                       color: #555555;
                            //                       margin: 14px 12px 50px;
                            //                       font-size: 20px;
                            //                       font-weight: 400;
                            //                       line-height: 24px;
                            //                     "
                            //                   >
                            //                     <div>こんにちは ${user.name} さん</div>
                            //                     <div style="padding-top: 10px">${companyName}からスカウトが届いています！</div>
                            //                   </h1>
                            //                   <div style="margin: 0 16px 60px; color: #555555">
                            //                     下のボタンからメッセージを確認できます。興味がある場合は、メッセージに返信をしましょう。
                            //                   </div>
                            //                 </td>
                            //               </tr>
                            //               <tr>
                            //                 <td align="left" bgcolor="#ffffff">
                            //                   <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            //                     <tr>
                            //                       <td align="center" bgcolor="#ffffff" style="padding: 20px;">
                            //                         <table border="0" cellpadding="0" cellspacing="0">
                            //                           <tr>
                            //                             <td align="center" bgcolor="#26A69A" style="border-radius: 6px;">
                            //                               <a
                            //                                 href="${appUrl}${chatUrl}"
                            //                                 target="_blank"
                            //                                 rel="noopener noreferrer"
                            //                                 style="
                            //                                   display: inline-block;
                            //                                   padding: 10px 50px;
                            //                                   font-size: 16px;
                            //                                   color: #ffffff;
                            //                                   text-decoration: none;
                            //                                   border-radius: 6px;
                            //                                 "
                            //                               >確認する</a>
                            //                             </td>
                            //                           </tr>
                            //                         </table>
                            //                       </td>
                            //                     </tr>
                            //                   </table>
                            //                 </td>
                            //               </tr>
                            //               <tr>
                            //                 <td
                            //                   align="center"
                            //                   style="
                            //                     color: #777777;
                            //                     padding: 60px 12px 20px;
                            //                     font-size: 14px;
                            //                     line-height: 24px;
                            //                   "
                            //                 >
                            //                   <hr size=1 color="#dddddd">
                            //                   <p style="margin: 0; padding-top: 12px"> Liplo Inc.</p>
                            //                 </td>
                            //               </tr>
                            //             </table>
                            //           </td>
                            //         </tr>
                            //       </table>
                            //     </body>
                            //   `,
                            // }
                            // sgMail.send(msg).then(() => {
                            //   console.log('New scout email sent to:', userDoc.data().email)
                            // })
                          }
                        }
                      })
                      .catch((error) => {
                        console.error("Error getting document", error)
                      })
                    console.log('send message & update candidate & send notification completed.')
                  })
                  .catch((error) => {
                    console.error("Error", error)
                  })
              }
            })
          } else {
            const chatId = admin.firestore().collection('chats').doc().id
            var chatData = {
              uid: user.uid,
              userName: user.name,
              companyId: companyId,
              companyName: companyName,
              lastMessage: message,
              messagesExist: true,
              updatedAt: createdAt,
            }
            if (user.imageUrl) {
              chatData.profileImageUrl = user.imageUrl
            }
            if (companyImageUrl) {
              chatData.companyImageUrl = companyImageUrl
            }

            const batch = admin.firestore().batch()
            // chat 作成
            const chatsRef = admin.firestore().collection('chats').doc(chatId)
            batch.set(chatsRef, chatData)
            // スカウトメッセージ作成
            const messagesRef = admin.firestore().collection('chats').doc(chatId)
              .collection('messages').doc()
            batch.set(messagesRef, {
              pic: pic,
              message: message,
              createdAt: createdAt,
              type: 'scout',
            })
            // candidate に chatId 格納
            const candidateRef = admin.firestore().collection('companies').doc(companyId)
              .collection('candidates').doc(candidateId)
            batch.update(candidateRef, {
              chatId: chatId
            })
            // 通知
            const notificationRef = admin.firestore().collection('users').doc(user.uid)
              .collection('notifications').doc()
            const chatUrl = '/messages/' + chatId
            batch.set(notificationRef, {
              type: 'normal',
              isImportant: true,
              content: companyName + 'にスカウトされました！ メッセージを確認してみましょう。',
              createdAt: new Date(),
              url: chatUrl,
              isUnread: true,
            })
            batch.commit()
              .then(() => {
                admin.firestore().collection('users')
                  .doc(user.uid)
                  .get()
                  .then(userDoc => {
                    if (userDoc.exists) {
                      if (userDoc.data().notificationsSetting == null || userDoc.data().notificationsSetting.scout) {
                        // スカウトされたユーザーにメール送信
                        // const msg = {
                        //   to: userDoc.data().email,
                        //   from: 'Liplo<noreply@liplo.jp>',
                        //   subject: `[スカウト] ${companyName}にスカウトされました！ 返事をして話を聞きに行ってみましょう！`,
                        //   html: `
                        //     <body>
                        //       <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        //         <tr>
                        //           <td align="center">
                        //             <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                        //               <tr>
                        //                 <td
                        //                   style="
                        //                     padding: 12px;
                        //                     font-size: 16px;
                        //                     line-height: 32px;
                        //                   "
                        //                 >
                        //                   <h1
                        //                     style="
                        //                       color: #555555;
                        //                       margin: 14px 12px 50px;
                        //                       font-size: 20px;
                        //                       font-weight: 400;
                        //                       line-height: 24px;
                        //                     "
                        //                   >
                        //                     <div>こんにちは ${user.name} さん</div>
                        //                     <div style="padding-top: 10px">${companyName}からスカウトが届いています！</div>
                        //                   </h1>
                        //                   <div style="margin: 0 16px 60px; color: #555555">
                        //                     下のボタンからメッセージを確認できます。興味がある場合は、メッセージに返信をしましょう。
                        //                   </div>
                        //                 </td>
                        //               </tr>
                        //               <tr>
                        //                 <td align="left" bgcolor="#ffffff">
                        //                   <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        //                     <tr>
                        //                       <td align="center" bgcolor="#ffffff" style="padding: 20px;">
                        //                         <table border="0" cellpadding="0" cellspacing="0">
                        //                           <tr>
                        //                             <td align="center" bgcolor="#26A69A" style="border-radius: 6px;">
                        //                               <a
                        //                                 href="${appUrl}${chatUrl}"
                        //                                 target="_blank"
                        //                                 rel="noopener noreferrer"
                        //                                 style="
                        //                                   display: inline-block;
                        //                                   padding: 10px 50px;
                        //                                   font-size: 16px;
                        //                                   color: #ffffff;
                        //                                   text-decoration: none;
                        //                                   border-radius: 6px;
                        //                                 "
                        //                               >確認する</a>
                        //                             </td>
                        //                           </tr>
                        //                         </table>
                        //                       </td>
                        //                     </tr>
                        //                   </table>
                        //                 </td>
                        //               </tr>
                        //               <tr>
                        //                 <td
                        //                   align="center"
                        //                   style="
                        //                     color: #777777;
                        //                     padding: 60px 12px 20px;
                        //                     font-size: 14px;
                        //                     line-height: 24px;
                        //                   "
                        //                 >
                        //                   <hr size=1 color="#dddddd">
                        //                   <p style="margin: 0; padding-top: 12px"> Liplo Inc.</p>
                        //                 </td>
                        //               </tr>
                        //             </table>
                        //           </td>
                        //         </tr>
                        //       </table>
                        //     </body>
                        //   `,
                        // }
                        // sgMail.send(msg).then(() => {
                        //   console.log('New scout email sent to:', userDoc.data().email)
                        // })
                      }
                    }
                  })
                  .catch((error) => {
                    console.error("Error getting document", error)
                  })
                console.log('send message & update candidate & send notification completed.')
              })
              .catch((error) => {
                console.error("Error", error)
              })
          }
        })
        .catch(err => {
          console.log('Error getting document', err)
        })
    }).catch(error => {
        console.error(error)
    })
  })

// ユーザーが応募した時の処理
exports.applyForJob = functions.region('asia-northeast1')
  .firestore
  .document('companies/{companyId}/candidates/{candidateId}')
  .onCreate((snap, context) => {
    if (snap.data().status == null || snap.data().status.inbox != true) {
      return 0
    }
    const companyId = context.params.companyId
    const candidateId = context.params.candidateId
    const uid = snap.data().user.uid
    const user = snap.data().user
    const jobId = snap.data().jobId
    const createdAt = snap.data().createdAt

    // company の応募者数の更新、応募者の情報格納
    const companyInfoRef = admin.firestore().collection('companies').doc(companyId)
      .collection('info').doc(companyId)
    return admin.firestore().runTransaction(function(transaction) {
      return transaction.get(companyInfoRef).then(function(companyInfoDoc) {
        if (companyInfoDoc.exists) {
          const companyName = companyInfoDoc.data().companyName
          const companyImageUrl = companyInfoDoc.data().companyImageUrl
          const members = companyInfoDoc.data().members
          var currentCandidates = companyInfoDoc.data().currentCandidates
          var allCandidates = companyInfoDoc.data().allCandidates

          if (currentCandidates) {
            currentCandidates.inbox += 1
          } else {
            currentCandidates = {
              scouted: 0,
              inbox: 1,
              inProcess: 0,
              intern: 0,
              pass: 0,
              contracted: 0,
              hired: 0
            }
          }

          const initialValue = {
            all: 0,
            scout: 0,
            application: 0,
          }

          if (allCandidates) {
            allCandidates.inbox += 1
          } else {
            allCandidates = {
              scouted: 0,
              inbox: 1,
              inProcess: initialValue,
              intern: initialValue,
              pass: initialValue,
              contracted: initialValue,
              hired: initialValue,
              rejected: initialValue,
            }
          }

          // 候補者カウント更新
          transaction.update(companyInfoRef, {
            currentCandidates: currentCandidates,
            allCandidates: allCandidates,
          })
          return companyInfoDoc
        }
      })
    }).then((companyInfoDoc) => {
      console.log('update candidates count completed.')

      const companyName = companyInfoDoc.data().companyName
      const companyImageUrl = companyInfoDoc.data().companyImageUrl
      const members = companyInfoDoc.data().members

      const batch = admin.firestore().batch()
      // applicantsに追加
      const companyApplicantsRef = admin.firestore().collection('companies')
        .doc(companyId).collection('applicants').doc()
      batch.set(companyApplicantsRef, {
        user: user,
        createdAt: createdAt,
        jobId: jobId,
        candidateId: candidateId
      })
      // 通知
      const candidateUrl = '/recruiter/candidates/' + candidateId
      members.forEach((member, i) => {
        const notificationRef = admin.firestore().collection('users')
          .doc(member.uid).collection('notifications').doc()
        batch.set(notificationRef, {
          type: 'normal',
          isImportant: true,
          content: user.name + 'さんから応募が届きました。',
          createdAt: new Date(),
          url: candidateUrl,
          isUnread: true,
        })
      })
      batch.commit()
        .then(() => {
          console.log('set applicants & send notification completed.')
        })
        .catch((error) => {
          console.error("Error", error)
        })

      // chat作成、chatIdをcandidateに格納, 担当者にメール送信
      admin.firestore()
        .collection('chats')
        .where('companyId', '==', companyId)
        .where('uid', '==', user.uid)
        .get()
        .then(function(snapshot) {
          if (!snapshot.empty) {
            var docCount = 0
            snapshot.forEach(function(chatDoc) {
              docCount += 1
              if (docCount == 1) {
                admin.firestore().collection('companies')
                  .doc(companyId)
                  .collection('candidates')
                  .doc(candidateId)
                  .update({
                    chatId: chatDoc.id
                  })
                  .then(() => {
                    // 応募が来たら担当者にメール送信
                    members.forEach((member, i) => {
                      if (member.notificationsSetting == null || member.notificationsSetting.application) {
                        // const msg = {
                        //   to: member.email,
                        //   from: 'Liplo<noreply@liplo.jp>',
                        //   subject: `[応募] ${user.name}さんから応募が来ました。`,
                        //   html: `
                        //     <body>
                        //       <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        //         <tr>
                        //           <td align="center">
                        //             <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;>
                        //               <tr>
                        //                 <td
                        //                   style="
                        //                     padding: 12px;
                        //                     font-size: 16px;
                        //                     line-height: 32px;
                        //                   "
                        //                 >
                        //                   <h1
                        //                     style="
                        //                       color: #555555;
                        //                       margin: 14px 12px 50px;
                        //                       font-size: 20px;
                        //                       font-weight: 400;
                        //                       line-height: 24px;
                        //                     "
                        //                   >
                        //                     ${user.name}さんから応募が届いています。
                        //                   </h1>
                        //                   <div style="margin: 0 16px 60px; color: #555555">
                        //                     下のボタンから確認ができます。選考する場合は、候補者のステータスを選考中に変え、
                        //                     メッセージにて候補者の方とご連絡をお取りください。
                        //                   </div>
                        //                 </td>
                        //               </tr>
                        //               <tr>
                        //                 <td align="left" bgcolor="#ffffff">
                        //                   <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        //                     <tr>
                        //                       <td align="center" bgcolor="#ffffff" style="padding: 20px;">
                        //                         <table border="0" cellpadding="0" cellspacing="0">
                        //                           <tr>
                        //                             <td align="center" bgcolor="#26A69A" style="border-radius: 6px;">
                        //                               <a
                        //                                 href="${appUrl}${candidateUrl}"
                        //                                 target="_blank"
                        //                                 rel="noopener noreferrer"
                        //                                 style="
                        //                                   display: inline-block;
                        //                                   padding: 10px 50px;
                        //                                   font-size: 16px;
                        //                                   color: #ffffff;
                        //                                   text-decoration: none;
                        //                                   border-radius: 6px;
                        //                                 "
                        //                               >確認する</a>
                        //                             </td>
                        //                           </tr>
                        //                         </table>
                        //                       </td>
                        //                     </tr>
                        //                   </table>
                        //                 </td>
                        //               </tr>
                        //               <tr>
                        //                 <td
                        //                   align="center"
                        //                   style="
                        //                     color: #777777;
                        //                     padding: 60px 12px 20px;
                        //                     font-size: 14px;
                        //                     line-height: 24px;
                        //                   "
                        //                 >
                        //                   <hr size=1 color="#dddddd">
                        //                   <p style="margin: 0; padding-top: 12px"> Liplo Inc.</p>
                        //                 </td>
                        //               </tr>
                        //             </table>
                        //           </td>
                        //         </tr>
                        //       </table>
                        //     </body>
                        //   `,
                        // }
                        // sgMail.send(msg).then(() => {
                        //   console.log('New apply email sent to:', member.email)
                        // })
                      }
                    })
                    console.log('update candidate completed.')
                  })
                  .catch((error) => {
                    console.error("Error updating document: ", error)
                  })
              }
            })
          } else {
            const chatId = admin.firestore().collection('chats').doc().id
            var chatData = {
              uid: user.uid,
              userName: user.name,
              companyId: companyId,
              companyName: companyName,
              messagesExist: false,
              updatedAt: createdAt,
            }
            if (user.imageUrl) {
              chatData.profileImageUrl = user.imageUrl
            }
            if (companyImageUrl) {
              chatData.companyImageUrl = companyImageUrl
            }

            const batch = admin.firestore().batch()
            const chatsRef = admin.firestore().collection('chats').doc(chatId)
            batch.set(chatsRef, chatData)
            const candidateRef = admin.firestore().collection('companies').doc(companyId)
              .collection('candidates').doc(candidateId)
            batch.update(candidateRef, {
              chatId: chatId
            })
            batch.commit()
              .then(() => {
                // 応募が来たら担当者にメール送信
                members.forEach((member, i) => {
                  if (member.notificationsSetting == null || member.notificationsSetting.application) {
                    // const msg = {
                    //   to: member.email,
                    //   from: 'Liplo<noreply@liplo.jp>',
                    //   subject: `[応募] ${user.name}さんから応募が来ました。`,
                    //   html: `
                    //     <body>
                    //       <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    //         <tr>
                    //           <td align="center">
                    //             <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;>
                    //               <tr>
                    //                 <td
                    //                   style="
                    //                     padding: 12px;
                    //                     font-size: 16px;
                    //                     line-height: 32px;
                    //                   "
                    //                 >
                    //                   <h1
                    //                     style="
                    //                       color: #555555;
                    //                       margin: 14px 12px 50px;
                    //                       font-size: 20px;
                    //                       font-weight: 400;
                    //                       line-height: 24px;
                    //                     "
                    //                   >
                    //                     ${user.name}さんから応募が届いています。
                    //                   </h1>
                    //                   <div style="margin: 0 16px 60px; color: #555555">
                    //                     下のボタンから確認ができます。選考する場合は、候補者のステータスを選考中に変え、
                    //                     メッセージにて候補者の方とご連絡をお取りください。
                    //                   </div>
                    //                 </td>
                    //               </tr>
                    //               <tr>
                    //                 <td align="left" bgcolor="#ffffff">
                    //                   <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    //                     <tr>
                    //                       <td align="center" bgcolor="#ffffff" style="padding: 20px;">
                    //                         <table border="0" cellpadding="0" cellspacing="0">
                    //                           <tr>
                    //                             <td align="center" bgcolor="#26A69A" style="border-radius: 6px;">
                    //                               <a
                    //                                 href="${appUrl}${candidateUrl}"
                    //                                 target="_blank"
                    //                                 rel="noopener noreferrer"
                    //                                 style="
                    //                                   display: inline-block;
                    //                                   padding: 10px 50px;
                    //                                   font-size: 16px;
                    //                                   color: #ffffff;
                    //                                   text-decoration: none;
                    //                                   border-radius: 6px;
                    //                                 "
                    //                               >確認する</a>
                    //                             </td>
                    //                           </tr>
                    //                         </table>
                    //                       </td>
                    //                     </tr>
                    //                   </table>
                    //                 </td>
                    //               </tr>
                    //               <tr>
                    //                 <td
                    //                   align="center"
                    //                   style="
                    //                     color: #777777;
                    //                     padding: 60px 12px 20px;
                    //                     font-size: 14px;
                    //                     line-height: 24px;
                    //                   "
                    //                 >
                    //                   <hr size=1 color="#dddddd">
                    //                   <p style="margin: 0; padding-top: 12px"> Liplo Inc.</p>
                    //                 </td>
                    //               </tr>
                    //             </table>
                    //           </td>
                    //         </tr>
                    //       </table>
                    //     </body>
                    //   `,
                    // }
                    // sgMail.send(msg).then(() => {
                    //   console.log('New apply email sent to:', member.email)
                    // })
                  }
                })
                console.log('update candidate completed.')
              })
              .catch((error) => {
                console.error("Error updating document: ", error)
              })
          }
        })
        .catch(err => {
          console.log('Error getting document', err)
        })
    }).catch(error => {
        console.error(error)
    })
  })

// 採用担当者が募集を投稿した時の処理
exports.postJob = functions.region('asia-northeast1')
  .firestore
  .document('jobs/{jobId}/detail/{detailId}')
  .onCreate((snap, context) => {
    const jobId = context.params.jobId
    const companyId = snap.data().companyId
    const initialStatus = snap.data().initialStatus

    return admin.firestore()
      .collection('companies')
      .doc(companyId)
      .collection('detail')
      .doc(companyId)
      .get()
      .then(doc => {
        if (doc.exists) {
          const companyName = doc.data().companyName
          const companyImageUrl = doc.data().companyImageUrl
          const mission = doc.data().mission
          const vision = doc.data().vision
          const value = doc.data().value
          const culture = doc.data().culture
          const system = doc.data().system
          const why = doc.data().why
          const what = doc.data().what
          const services = doc.data().services
          const welfare = doc.data().welfare
          const feedback = doc.data().feedback
          const points = doc.data().points
          const employeesCount = doc.data().employeesCount
          const url = doc.data().url
          const location = doc.data().location
          const foundedDate = doc.data().foundedDate

          var jobData = {
            companyName: companyName,
            status: initialStatus,
            feedback: feedback,
            points: points
          }
          if (companyImageUrl) {
            jobData.companyImageUrl = companyImageUrl
          }
          if (doc.data().reviews) {
            rating = doc.data().reviews.rating
            jobData.rating = rating
          }

          // 投稿更新
          const batch = admin.firestore().batch()
          const jobsRef = admin.firestore().collection('jobs').doc(jobId)
          batch.update(jobsRef, jobData)

          var jobDetailData = {
            companyName: companyName,
            status: initialStatus,
            feedback: feedback,
            points: points
          }
          if (companyImageUrl) {
            jobDetailData.companyImageUrl = companyImageUrl
          }
          if (mission) {
            jobDetailData.mission = mission
          }
          if (vision) {
            jobDetailData.vision = vision
          }
          if (value) {
            jobDetailData.value = value
          }
          if (culture) {
            jobDetailData.culture = culture
          }
          if (system) {
            jobDetailData.system = system
          }
          if (why) {
            jobDetailData.why = why
          }
          if (what) {
            jobDetailData.what = what
          }
          if (services) {
            jobDetailData.services = services
          }
          if (welfare) {
            jobDetailData.welfare = welfare
          }
          if (employeesCount) {
            jobDetailData.employeesCount = employeesCount
          }
          if (url) {
            jobDetailData.url = url
          }
          if (location) {
            jobDetailData.location = location
          }
          if (foundedDate) {
            jobDetailData.foundedDate = foundedDate
          }

          const jobDetailRef = admin.firestore().collection('jobs').doc(jobId).collection('detail').doc(jobId)
          batch.update(jobDetailRef, jobDetailData)
          batch.commit()
            .then(() => {
              console.log('postJob completed.')
            })
            .catch((error) => {
              console.error("Error", error)
            })
        }
      })
      .catch(err => {
        console.log('Error getting document', err)
      })
  })

// 企業アカウントが削除された時、契約が終了した時に募集を private に変更する処理
exports.updateJobStatusToPrivate = functions.region('asia-northeast1')
  .firestore
  .document('companies/{companyId}')
  .onUpdate((change, context) => {
    const previousValue = change.before.data()
    const newValue = change.after.data()
    const companyId = context.params.companyId
    const isDeleted = newValue.isDeleted

    // 変化がない場合は終了
    if (isDeleted != true || previousValue.isDeleted == true) {
      return 0
    }

    return admin.firestore()
      .collection('jobs')
      .where('companyId', '==', companyId)
      .get()
      .then(function(snapshot) {
        // job関連更新
        const batch = admin.firestore().batch()

        snapshot.forEach(function(doc) {
          const jobRef = admin.firestore().collection('jobs').doc(doc.id)
          batch.update(jobRef, {
            status: 'private'
          })

          const jobDetailRef = admin.firestore().collection('jobs').doc(doc.id)
            .collection('detail')
            .doc(doc.id)
          batch.update(jobDetailRef, {
            status: 'private'
          })
        })
        batch.commit()
          .then(() => {
            console.log('completed.')
          })
          .catch((error) => {
            console.error("Error", error)
          })
      })
      .catch(err => {
        console.log('Error getting document', err)
      })
  })

// 企業情報を編集した時の処理
exports.editCompanyProfile = functions.region('asia-northeast1')
  .firestore
  .document('companies/{companyId}/detail/{companyDetailId}')
  .onUpdate((change, context) => {
    const previousValue = change.before.data()
    const newValue = change.after.data()
    const companyId = context.params.companyId
    const companyName = newValue.companyName
    const companyImageUrl = newValue.companyImageUrl
    const mission = newValue.mission
    const vision = newValue.vision
    const value = newValue.value
    const culture = newValue.culture
    const system = newValue.system
    const why = newValue.why
    const what = newValue.what
    const services = newValue.services
    const welfare = newValue.welfare
    const url = newValue.url
    const location = newValue.location
    const foundedDate = newValue.foundedDate
    const employeesCount = newValue.employeesCount
    const feedback = newValue.feedback
    const invoiceEmail = newValue.invoiceEmail
    const employmentInfo = newValue.employmentInfo
    var isCompanyNameChanged = false
    var isCompanyImageUrlChanged = false
    var isInvoiceEmailChanged = false

    // 変化がない場合は終了
    if (
      companyName == previousValue.companyName &&
      companyImageUrl == previousValue.companyImageUrl &&
      mission == previousValue.mission &&
      vision == previousValue.vision &&
      value == previousValue.value &&
      culture == previousValue.culture &&
      system == previousValue.system &&
      why == previousValue.why &&
      what == previousValue.what &&
      welfare == previousValue.welfare &&
      url == previousValue.url &&
      location == previousValue.location &&
      employeesCount == previousValue.employeesCount &&
      feedback.all == previousValue.feedback.all &&
      feedback.writtenCount == previousValue.feedback.writtenCount &&
      invoiceEmail == previousValue.invoiceEmail
    ) {
      var isChanged = false
      // foundedDate比較
      if (foundedDate) {
        if (previousValue.foundedDate == null) {
          isChanged = true
        } else {
          if (foundedDate.seconds != previousValue.foundedDate.seconds) {
            isChanged = true
          }
        }
      }
      // service比較
      if (services) {
        if (previousValue.services == null) {
          isChanged = true
        } else if (services.length == previousValue.services.length) {
          var isEqual = true
          services.forEach((service, serviceIndex) => {
            // 同じものが存在するか
            var sameServiceExists = false
            previousValue.services.forEach((previousService, previousServiceIndex) => {
              if (
                service.title == previousService.title &&
                service.content == previousService.content &&
                service.url == previousService.url &&
                service.imageUrl == previousService.imageUrl
              ) {
                sameServiceExists = true
              }
            })

            if (!sameServiceExists) {
              isEqual = false
            }
          })
          // 同じものが存在しない場合
          if (!isEqual) {
            isChanged = true
          }
        } else {
          isChanged = true
        }
      } else {
        if (previousValue.services) {
          isChanged = true
        }
      }
      // employmentInfo比較
      if (employmentInfo) {
        if (previousValue.employmentInfo == null) {
          isChanged = true
        } else {
          if (employmentInfo.newGrad != previousValue.employmentInfo.newGrad) {
            isChanged = true
          }
          if (employmentInfo.newGradResignee != previousValue.employmentInfo.newGradResignee) {
            isChanged = true
          }
          if (employmentInfo.averageYearsOfService != previousValue.employmentInfo.averageYearsOfService) {
            isChanged = true
          }
          if (employmentInfo.averageAge != previousValue.employmentInfo.averageAge) {
            isChanged = true
          }
          if (
            employmentInfo.training &&
            (employmentInfo.training.exists != previousValue.employmentInfo.training.exists ||
              employmentInfo.training.content != previousValue.employmentInfo.training.content)
          ) {
            isChanged = true
          }
          if (
            employmentInfo.selfDevSupport &&
            (employmentInfo.selfDevSupport.exists != previousValue.employmentInfo.selfDevSupport.exists ||
              employmentInfo.selfDevSupport.content != previousValue.employmentInfo.selfDevSupport.content)
          ) {
            isChanged = true
          }
          if (
            employmentInfo.mentor &&
            employmentInfo.mentor.exists != previousValue.employmentInfo.mentor.exists
          ) {
            isChanged = true
          }
          if (
            employmentInfo.careerSupport &&
            (employmentInfo.careerSupport.exists != previousValue.employmentInfo.careerSupport.exists ||
              employmentInfo.careerSupport.content != previousValue.employmentInfo.careerSupport.content)
          ) {
            isChanged = true
          }
          if (
            employmentInfo.testSystem &&
            (employmentInfo.testSystem.exists != previousValue.employmentInfo.testSystem.exists ||
              employmentInfo.testSystem.content != previousValue.employmentInfo.testSystem.content)
          ) {
            isChanged = true
          }
          if (employmentInfo.overtimeWork != previousValue.employmentInfo.overtimeWork) {
            isChanged = true
          }
          if (employmentInfo.paidHolidays != previousValue.employmentInfo.paidHolidays) {
            isChanged = true
          }
          if (
            employmentInfo.childcareLeave &&
            (
              (
                employmentInfo.childcareLeave.man &&
                (
                  employmentInfo.childcareLeave.man.taken != previousValue.employmentInfo.childcareLeave.man.taken ||
                  employmentInfo.childcareLeave.man.all != previousValue.employmentInfo.childcareLeave.man.all
                )
              ) ||
              (
                employmentInfo.childcareLeave.woman &&
                (
                  employmentInfo.childcareLeave.woman.taken != previousValue.employmentInfo.childcareLeave.woman.taken ||
                  employmentInfo.childcareLeave.woman.all != previousValue.employmentInfo.childcareLeave.woman.all
                )
              )
            )
          ) {
            isChanged = true
          }
          if (employmentInfo.femaleExecutives != previousValue.employmentInfo.femaleExecutives) {
            isChanged = true
          }
        }
      }

      if (!isChanged) {
        return 0
      }
    }

    if (companyName != previousValue.companyName) {
      isCompanyNameChanged = true
    }
    if (companyImageUrl != previousValue.companyImageUrl) {
      isCompanyImageUrlChanged = true
    }
    if (invoiceEmail != previousValue.invoiceEmail) {
      isInvoiceEmailChanged = true
    }
    var companyData = {
      companyName: companyName,
    }
    if (companyImageUrl) {
      companyData.companyImageUrl = companyImageUrl
    }

    return admin.firestore()
      .collection('jobs')
      .where('companyId', '==', companyId)
      .get()
      .then(function(snapshot) {
        // job関連更新
        const jobBatch = admin.firestore().batch()

        snapshot.forEach(function(doc) {
          if (isCompanyNameChanged || isCompanyImageUrlChanged) {
            const jobRef = admin.firestore().collection('jobs').doc(doc.id)
            jobBatch.update(jobRef, companyData)
          }
          const jobDetailRef = admin.firestore().collection('jobs').doc(doc.id)
            .collection('detail')
            .doc(doc.id)

          var jobDetailData = {
            companyName: companyName,
          }
          if (companyImageUrl) {
            jobDetailData.companyImageUrl = companyImageUrl
          }
          if (mission) {
            jobDetailData.mission = mission
          }
          if (vision) {
            jobDetailData.vision = vision
          }
          if (value) {
            jobDetailData.value = value
          }
          if (culture) {
            jobDetailData.culture = culture
          }
          if (system) {
            jobDetailData.system = system
          }
          if (why) {
            jobDetailData.why = why
          }
          if (what) {
            jobDetailData.what = what
          }
          if (services) {
            jobDetailData.services = services
          }
          if (welfare) {
            jobDetailData.welfare = welfare
          }
          if (url) {
            jobDetailData.url = url
          }
          if (location) {
            jobDetailData.location = location
          }
          if (foundedDate) {
            jobDetailData.foundedDate = foundedDate
          }
          if (employeesCount) {
            jobDetailData.employeesCount = employeesCount
          }
          if (feedback) {
            jobDetailData.feedback = feedback
          }
          if (employmentInfo) {
            jobDetailData.employmentInfo = employmentInfo
          }
          jobBatch.update(jobDetailRef, jobDetailData)
        })
        jobBatch.commit()
          .then(() => {
            console.log('update job completed.')
          })
          .catch((error) => {
            console.error("Error", error)
          })

        // name or invoiceEmail が変わっていれば続行
        if (isCompanyNameChanged || isInvoiceEmailChanged) {
          // paidActions
          admin.firestore()
            .collection('paidActions')
            .where('companyId', '==', companyId)
            .get()
            .then(function(snapshot) {
              const batch = admin.firestore().batch()

              snapshot.forEach(function(doc) {
                const paidActionRef = admin.firestore().collection('paidActions').doc(doc.id)
                let paidActionData = {
                  companyName: companyName,
                  invoiceEmail: invoiceEmail
                }
                if (companyImageUrl) {
                  paidActionData.companyImageUrl = companyImageUrl
                }
                batch.update(paidActionRef, paidActionData)
              })
              batch.commit()
                .then(() => {
                  console.log('update paidActions completed.')
                })
                .catch((error) => {
                  console.error("Error", error)
                })
            })
            .catch(err => {
              console.log('Error getting document', err)
            })
        }
        // name が変わっていれば続行
        if (isCompanyNameChanged) {
          // projects
          admin.firestore()
            .collection('projects')
            .where('companyId', '==', companyId)
            .get()
            .then(function(snapshot) {
              const batch = admin.firestore().batch()

              snapshot.forEach(function(doc) {
                const projectRef = admin.firestore().collection('projects').doc(doc.id)
                batch.update(projectRef, companyData)
              })
              batch.commit()
                .then(() => {
                  console.log('update project completed.')
                })
                .catch((error) => {
                  console.error("Error", error)
                })
            })
            .catch(err => {
              console.log('Error getting document', err)
            })

          // chats
          const limitDate = new Date()
          limitDate.setYear(limitDate.getFullYear() - 1)

          admin.firestore()
            .collection('chats')
            .where('companyId', '==', companyId)
            .where('updatedAt', '>', limitDate)
            .get()
            .then(function(snapshot) {
              const batch = admin.firestore().batch()

              snapshot.forEach(function(doc) {
                const chatRef = admin.firestore().collection('chats').doc(doc.id)
                batch.update(chatRef, companyData)
              })
              batch.commit()
                .then(() => {
                  console.log('update chat completed.')
                })
                .catch((error) => {
                  console.error("Error", error)
                })
            })
            .catch(err => {
              console.log('Error getting document', err)
            })

          // passes
          admin.firestore()
            .collection('passes')
            .where('companyId', '==', companyId)
            .where('isValid', '==', true)
            .get()
            .then(function(snapshot) {
              const batch = admin.firestore().batch()

              snapshot.forEach(function(doc) {
                const passRef = admin.firestore().collection('passes').doc(doc.id)
                batch.update(passRef, companyData)
              })
              batch.commit()
                .then(() => {
                  console.log('update pass completed.')
                })
                .catch((error) => {
                  console.error("Error", error)
                })
            })
            .catch(err => {
              console.log('Error getting document', err)
            })
        }
      })
      .catch(err => {
        console.log('Error getting document', err)
      })
  })

// 担当者がサインアップした時の処理
exports.createRecruiter = functions.region('asia-northeast1')
  .firestore
  .document('users/{uid}')
  .onCreate((snap, context) => {
    const uid = context.params.uid
    const companyId = snap.data().companyId
    const firstName = snap.data().firstName
    const lastName = snap.data().lastName
    const email = snap.data().email
    const position = snap.data().position
    const notificationsSetting = snap.data().notificationsSetting

    // userの場合終了
    if (companyId == null) {
      return 0
    }

    // 企業の member 内の情報更新
    return admin.firestore()
      .collection('companies').doc(companyId)
      .collection('info').doc(companyId)
      .get()
      .then(doc => {
        if (doc.exists) {
          var members = doc.data().members
          var member = {
            uid: uid,
            name: lastName + ' ' + firstName,
            email: email,
            notificationsSetting: notificationsSetting
          }
          if (position) {
            member.position = position
          }

          if (members.length == 1) {
            if (members[0].isFirstMember != null && members[0].isFirstMember) {
              if (!member.position && members[0].position) {
                member.position = members[0].position
              }
              members = [member]
            } else {
              members.push(member)
            }
          } else if (members.length > 1) {
            members.push(member)
          }

          // members更新
          const batch = admin.firestore().batch()
          const companyInfoRef = admin.firestore().collection('companies').doc(companyId)
            .collection('info').doc(companyId)
          batch.update(companyInfoRef, {
            members: members,
          })
          const companyDetailRef = admin.firestore().collection('companies').doc(companyId)
            .collection('detail').doc(companyId)
          batch.update(companyDetailRef, {
            members: members,
          })
          batch.commit()
            .then(() => {
              console.log('completed.')
            })
            .catch((error) => {
              console.error("Error", error)
            })
        }
      })
      .catch(err => {
        console.log('Error getting document', err)
      })
  })

// 担当者が設定を編集した時の処理（メールアドレス、通知設定変更、アカウント削除）
exports.editRecruiterSetting = functions.region('asia-northeast1')
  .firestore
  .document('users/{uid}')
  .onUpdate((change, context) => {
    const previousValue = change.before.data()
    const newValue = change.after.data()
    const uid = context.params.uid
    const companyId = newValue.companyId
    const email = newValue.email
    const notificationsSetting = newValue.notificationsSetting
    const isDeleted = newValue.isDeleted

    // 担当者でない場合は終了
    if (companyId == null) {
      return 0
    }

    if (
      email != previousValue.email ||
      notificationsSetting.application != previousValue.notificationsSetting.application ||
      notificationsSetting.acceptPass != previousValue.notificationsSetting.acceptPass
    ) {
      // 設定が変わっている場合
      // 企業の member 内の情報更新
      return admin.firestore()
        .collection('companies').doc(companyId)
        .collection('info').doc(companyId)
        .get()
        .then(doc => {
          if (doc.exists) {
            let members = doc.data().members

            var index
            members.forEach((member, i) => {
              if (member.uid == uid) {
                index = i
              }
            })

            members[index].email = email
            members[index].notificationsSetting = notificationsSetting

            // members更新
            const batch = admin.firestore().batch()
            const companyInfoRef = admin.firestore().collection('companies').doc(companyId)
              .collection('info').doc(companyId)
            batch.update(companyInfoRef, {
              members: members,
            })
            const companyDetailRef = admin.firestore().collection('companies').doc(companyId)
              .collection('detail').doc(companyId)
            batch.update(companyDetailRef, {
              members: members,
            })
            batch.commit()
              .then(() => {
                console.log('completed.')
              })
              .catch((error) => {
                console.error("Error", error)
              })
          }
        })
        .catch(err => {
          console.log('Error getting document', err)
        })
    } else if (isDeleted != previousValue.isDeleted) {
      // アカウントが削除された場合
      // 企業の member 内の情報更新
      return admin.firestore()
        .collection('companies').doc(companyId)
        .collection('info').doc(companyId)
        .get()
        .then(doc => {
          if (doc.exists) {
            var companyData
            var companyDetail
            var members = doc.data().members
            var isCompanyDeleted = false

            if (members.length <= 1) {
              isCompanyDeleted = true
              members = []
              companyData = {
                members: members,
                isDeleted: true,
                plan: null,
              }
              companyDetailData = {
                members: members,
                isDeleted: true,
              }
            } else {
              var index
              members.forEach((member, i) => {
                if (member.uid == uid) {
                  index = i
                }
              })
              members.splice(index, 1)
              companyData = {
                members: members,
              }
              companyDetailData = {
                members: members,
              }
            }

            // members, isDeleted 更新
            const batch = admin.firestore().batch()
            if (isCompanyDeleted) {
              const companyRef = admin.firestore().collection('companies').doc(companyId)
              batch.update(companyRef, {
                isDeleted: true
              })
            }

            const companyInfoRef = admin.firestore().collection('companies').doc(companyId)
              .collection('info').doc(companyId)
            batch.update(companyInfoRef, companyData)
            const companyDetailRef = admin.firestore().collection('companies').doc(companyId)
              .collection('detail').doc(companyId)
            batch.update(companyDetailRef, companyDetailData)
            batch.commit()
              .then(() => {
                console.log('completed.')
              })
              .catch((error) => {
                console.error("Error", error)
              })
          }
        })
        .catch(err => {
          console.log('Error getting document', err)
        })
    } else {
      return 0
    }
  })

// プロフィールを編集した時の処理
exports.editProfile = functions.region('asia-northeast1')
  .firestore
  .document('users/{uid}/profile/{profile}')
  .onUpdate((change, context) => {
    const previousValue = change.before.data()
    const newValue = change.after.data()
    const uid = context.params.uid
    const companyId = newValue.companyId
    const position = newValue.position
    const firstName = newValue.firstName
    const lastName = newValue.lastName
    const type = newValue.type
    const imageUrl = newValue.imageUrl
    const selfIntro = newValue.selfIntro
    const whatWantToDo = newValue.whatWantToDo
    const portfolio = newValue.portfolio
    const skills = newValue.skills
    const links = newValue.links
    const grade = newValue.grade
    const graduationYear = newValue.graduationYear
    const address = newValue.address
    const university = newValue.university
    const faculty = newValue.faculty
    const department = newValue.department
    const desiredOccupations = newValue.desiredOccupations

    if (companyId == null && type == 'user') {
      // user が profile を編集した時
      // プロフィール完成度などを更新
      var percentage = 0
      var canSearch = false

      percentage += (imageUrl && imageUrl != '') ? 12 : 0
      if (desiredOccupations) {
        var isSelected = false
        if (desiredOccupations.engineer == true) {
          isSelected = true
        }
        if (desiredOccupations.designer == true) {
          isSelected = true
        }
        if (desiredOccupations.sales == true) {
          isSelected = true
        }
        if (desiredOccupations.marketer == true) {
          isSelected = true
        }
        if (desiredOccupations.planner == true) {
          isSelected = true
        }
        if (desiredOccupations.writer == true) {
          isSelected = true
        }
        if (desiredOccupations.others == true) {
          isSelected = true
        }
        percentage += isSelected ? 12 : 0
      }
      percentage += (selfIntro && selfIntro != '') ? 12 : 0
      percentage += (whatWantToDo && whatWantToDo != '') ? 12 : 0
      percentage += (portfolio && portfolio.length > 0) ? 12 : 0
      percentage += (skills && skills.length > 0) ? 12 : 0
      percentage += (links && links.length > 0) ? 4 : 0
      percentage += (university && university != '') ? 4 : 0
      percentage += (faculty && faculty != '') ? 4 : 0
      percentage += (department && department != '') ? 4 : 0
      percentage += (grade && grade != '') ? 4 : 0
      percentage += (graduationYear && graduationYear != '') ? 4 : 0
      percentage += (address && address != '') ? 4 : 0

      // プロフィール完成度が 50% を超えていたら検索に表示される
      if (percentage > 50) {
        canSearch = true
      }

      return admin.firestore()
        .collection('users')
        .doc(uid)
        .update({
          completionPercentage: percentage,
          canSearch: canSearch
        })
        .then(() => {
          console.log('update completionPercentage completed.')
        })
        .catch((error) => {
          console.error("Error updating document", error)
        })
    } else if (companyId && type == 'recruiter') {
      // recruiter
      // name, imageUrl, position, selfIntro どれも変わっていない場合はreturn
      if (
        firstName == previousValue.firstName &&
        lastName == previousValue.lastName &&
        imageUrl == previousValue.imageUrl &&
        position == previousValue.position &&
        selfIntro == previousValue.selfIntro
      ) {
        return 0
      }

      // recruiter が profile を編集した時
      // 企業の member 内の情報更新
      return admin.firestore()
        .collection('companies').doc(companyId)
        .collection('info').doc(companyId)
        .get()
        .then(doc => {
          if (doc.exists) {
            let members = doc.data().members

            var index
            members.forEach((member, i) => {
              if (member.uid == uid) {
                index = i
              }
            })

            if (imageUrl) {
              members[index].imageUrl = imageUrl
            }
            members[index].name = lastName + ' ' + firstName
            if (position) {
              members[index].position = position
            }
            if (selfIntro) {
              members[index].selfIntro = selfIntro
            }

            // members更新
            const batch = admin.firestore().batch()
            const companyInfoRef = admin.firestore().collection('companies').doc(companyId)
              .collection('info').doc(companyId)
            batch.update(companyInfoRef, {
              members: members,
            })
            const companyDetailRef = admin.firestore().collection('companies').doc(companyId)
              .collection('detail').doc(companyId)
            batch.update(companyDetailRef, {
              members: members,
            })
            batch.commit()
              .then(() => {
                console.log('completed.')
              })
              .catch((error) => {
                console.error("Error", error)
              })
          }
        })
        .catch(err => {
          console.log('Error getting document', err)
        })
    } else {
      return 0
    }
  })

// レビューした時の処理
exports.sendReview = functions.region('asia-northeast1')
  .firestore
  .document('reviews/{reviewId}')
  .onCreate((snap, context) => {

    const uid = snap.data().uid
    const companyId = snap.data().companyId
    const content = snap.data().content
    const occupation = snap.data().occupation
    const createdAt = snap.data().createdAt
    const comment = {
      uid: uid,
      reviewId: context.params.reviewId,
      occupation: occupation,
      content: content,
      createdAt: createdAt,
    }

    // job の rating, companies detail の reviews, points を更新
    const companyDetailRef = admin.firestore().collection('companies')
      .doc(companyId).collection('detail').doc(companyId)

    const userRef = admin.firestore().collection('users').doc(uid)
    const userProfileRef = admin.firestore().collection('users').doc(uid)
      .collection('profile').doc(uid)

    return admin.firestore().runTransaction(function(transaction) {
      return transaction.getAll(companyDetailRef, userRef).then(function(docs) {
        const companyDetailDoc = docs[0]
        const userDoc = docs[1]

        if (companyDetailDoc.exists) {
          // スコア更新
          var points = companyDetailDoc.data().points
          if (points == null) {
            points = 100
          }
          if (snap.data().all < 1.5) {
            if (points < 2) {
              points = 0
            } else {
              points -= 2
            }
          } else if (snap.data().all >= 1.5 && snap.data().all < 2.5) {
            if (points < 1) {
              points = 0
            } else {
              points -= 1
            }
          } else if (snap.data().all >= 2.5 && snap.data().all < 3.5) {
            // points維持
          } else if (snap.data().all >= 3.5 && snap.data().all < 4.5) {
            points += 1
          } else if (snap.data().all >= 4.5) {
            points += 2
          }

          var reviewCount
          var atmosphere
          var job
          var discretion
          var workingHours
          var environment
          var all
          var comments

          if (companyDetailDoc.data().reviews) {
            reviewCount = companyDetailDoc.data().reviews.rating.count
            atmosphere = Math.round((companyDetailDoc.data().reviews.rating.atmosphere * reviewCount + snap.data().atmosphere) / (reviewCount + 1) * 10) / 10
            job = Math.round((companyDetailDoc.data().reviews.rating.job * reviewCount + snap.data().job) / (reviewCount + 1) * 10) / 10
            discretion = Math.round((companyDetailDoc.data().reviews.rating.discretion * reviewCount + snap.data().discretion) / (reviewCount + 1) * 10) / 10
            workingHours = Math.round((companyDetailDoc.data().reviews.rating.workingHours * reviewCount + snap.data().workingHours) / (reviewCount + 1) * 10) / 10
            environment = Math.round((companyDetailDoc.data().reviews.rating.environment * reviewCount + snap.data().environment) / (reviewCount + 1) * 10) / 10
            all = Math.round((atmosphere + job + discretion + workingHours + environment) / 5 * 10) / 10
            comments = companyDetailDoc.data().reviews.comments

            if (comments == null) {
              comments = [comment]
            } else if (comments.length < 3) {
              comments.push(comment)
            } else if (comments.length >= 3) {
              var date
              var index
              comments.forEach((comment, i) => {
                if (date == null || date > comment.createdAt.seconds * 1000) {
                  date = comment.createdAt.seconds * 1000
                  index = i
                }
              })
              comments.splice(index, 1)
              comments.push(comment)
            }
          } else {
            reviewCount = 0
            atmosphere = snap.data().atmosphere
            job = snap.data().job
            discretion = snap.data().discretion
            workingHours = snap.data().workingHours
            environment = snap.data().environment
            all = Math.round((atmosphere + job + discretion + workingHours + environment) / 5 * 10) / 10
            comments = [comment]
          }

          const rating = {
            all: all,
            count: reviewCount + 1,
            atmosphere: atmosphere,
            job: job,
            discretion: discretion,
            workingHours: workingHours,
            environment: environment,
          }
          const reviews = {
            rating: rating,
            comments: comments,
          }
          // company rating, points 更新
          const companyRef = admin.firestore().collection('companies').doc(companyId)
          transaction.update(companyRef, {
            rating: rating,
            points: points
          })
          // company info rating, points 更新
          const companyInfoRef = admin.firestore().collection('companies').doc(companyId)
            .collection('info').doc(companyId)
          transaction.update(companyInfoRef, {
            rating: rating,
            points: points
          })
          // companyDetail reviews, points 更新
          transaction.update(companyDetailRef, {
            reviews: reviews,
            points: points,
          })
          // userスコア更新
          transaction.update(userRef, {
            points: userDoc.data().points + 1,
          })
          transaction.update(userProfileRef, {
            points: userDoc.data().points + 1,
          })
          return { rating: rating, points: points }
        }
      })
    }).then((updatedData) => {
      console.log('update company & detail & user score completed.')
      // job rating, points更新
      admin.firestore()
        .collection('jobs')
        .where('companyId', '==', companyId)
        .get()
        .then(snapshot => {
          const batch = admin.firestore().batch()

          snapshot.forEach(function(jobDoc) {
            const jobRef = admin.firestore().collection('jobs').doc(jobDoc.id)
            batch.update(jobRef, updatedData)
          })
          batch.commit()
            .then(() => {
              console.log('update jobs completed.')
            })
            .catch((error) => {
              console.error("Error", error)
            })
        })
        .catch(error => {
          console.log('Error getting document', error)
        })
    }).catch(error => {
        console.error(error)
    })
  })

// メッセージを送信した時の処理
exports.sendMessage = functions.region('asia-northeast1')
  .firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate((snap, context) => {
    const chatId = context.params.chatId
    const messageId = context.params.messageId
    const message = snap.data().message
    const user = snap.data().user
    const pic = snap.data().pic

    // chatのupdatedAt, picUnreadCountを更新
    var chatData = {
      updatedAt: snap.data().createdAt,
      lastMessage: message,
      messagesExist: true
    }

    if (user != null && !pic) {
      chatData.picUnreadCount = admin.firestore.FieldValue.increment(1)
    } else if (!user && pic != null) {
      chatData.userUnreadCount = admin.firestore.FieldValue.increment(1)
    }

    return admin.firestore()
      .collection('chats').doc(chatId)
      .update(chatData)
      .then(() => {
        console.log('completed.')
      })
      .catch(error => {
        console.log('Error updating document', error)
      })
  })

// 企業から問い合わせがあった時
exports.sendCompanyInquiryMail = functions
  .https
  .onCall((data, context) => {
    var inquiryData = {
      companyName: data.companyName,
      userName: data.userName,
      email: data.email,
      position: data.position,
      type: data.type,
      createdAt: new Date()
    }
    if (data.department) {
      inquiryData.department = data.department
    }
    if (data.content) {
      inquiryData.content = data.content
    }

    return admin.firestore().collection('companyInquiries')
      .add(inquiryData)
      .then(() => {
        var type
        if (data.type == 0) {
          type = '資料請求したい'
        } else if (data.type == 1) {
          type = 'Liploの導入を検討しており、サービスについて詳しく聞きたい'
        } else if (data.type == 2) {
          type = 'すぐに導入したい'
        } else if (data.type == 3) {
          type = 'その他'
        }

        const mailOptions = {
          from: `Liplo <noreply@liplo.jp>`,
          to: 'contact@liplo.jp',
        }
        mailOptions.subject = `${data.companyName}の${data.userName}様からのお問い合わせ`
        mailOptions.html = `
          <p><b>CompanyName: </b>${data.companyName}</p>
          <p><b>Name: </b>${data.userName} 様</p>
          <p><b>Position: </b>${data.position} </p>
          <p><b>Email: </b>${data.email}</p>
          <p><b>Type: </b>${type}</p>
          <p><b>Content: </b>${data.content}</p>
          <p><b>Date: </b>${data.timestamp}</p>
        `
        mailTransport.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err)
          }
          console.log('completed.')
        })
      })
      .catch((error) => {
        console.error("Error", error)
      })
  })

// 問い合わせがあった時
exports.sendContact = functions
  .https
  .onCall((data, context) => {
    return admin.firestore().collection('inquiries')
      .add({
        name: data.name,
        email: data.email,
        content: data.content,
        createdAt: new Date()
      })
      .then(() => {
        const mailOptions = {
          from: `Liplo <noreply@liplo.jp>`,
          to: 'contact@liplo.jp',
        }
        mailOptions.subject = `お問い合わせ`
        mailOptions.html = `
          <p><b>Name: </b>${data.name}</p>
          <p><b>Email: </b>${data.email}</p>
          <p><b>Content: </b>${data.content}</p>
          <p><b>Date: </b>${data.timestamp}</p>
        `
        mailTransport.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err)
          }
          console.log('completed.')
        })
      })
      .catch((error) => {
        console.error("Error", error)
      })
  })

// 請求書の送信先が変更された時
// exports.sendChangeInvoiceEmailConfirmation = functions
//   .https
//   .onCall((data, context) => {
//     const msg = {
//       to: data.newEmail,
//       from: 'Liplo<noreply@liplo.jp>',
//       subject: '[ご確認] 請求書の送信先変更のお知らせ',
//       html: `
//         <p>${data.companyName} 様</p>
//         <p>日頃から Liplo をご利用いただき、ありがとうございます。</p>
//         <p>請求書の送信先の変更が正常に行われたことをお知らせいたします。</p>
//         <p>引き続き、Liploをよろしくお願い致します。</p>
//         <p style="margin-top: 40px">このメールに心当たりがない方は、お手数をおかけしますがこのメールを破棄してください。</p>
//       `,
//     }
//     return sgMail.send(msg).then(() => {
//       console.log('completed.')
//     })
//   })

// 担当者向けのサインアップメール送信
// exports.sendSignUpEmail = functions
//   .https
//   .onCall((data, context) => {
//     const msg = {
//       to: data.email,
//       from: 'Liplo<noreply@liplo.jp>',
//       subject: 'サインアップのご案内',
//       html: `
//         <p>${data.name} 様</p>
//         <p>Liplo をご利用いただき、誠にありがとうございます。</p>
//         <p>サインアップは以下のリンクから行えます。</p>
//         <a href="${data.url}">${data.url}</a><br>
//         <p style="margin-top: 40px">引き続き、Liploをよろしくお願い致します。</p>
//       `,
//     }
//     return sgMail.send(msg).then(() => {
//       console.log('completed.')
//     })
//   })
