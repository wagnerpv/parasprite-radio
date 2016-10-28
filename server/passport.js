import { Strategy as TwitterStrategy } from 'passport-twitter'
import { Strategy as OAuth2Strategy } from 'passport-oauth2'
import User from './models/user'
import config from '../scripts/config'
import { fetchJSON } from '../scripts/fetcher'

export default function (passport) {
  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    // console.log("SERIALIZE", user.id)
    done(null, user.id)
  })

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    // console.log "UNSERIALIZE", id
    User.findById(id, (err, user) => done(err, user))
  })

  if (config.passport.poniverse && config.passport.poniverse.clientID) {
    const poniverse = new OAuth2Strategy(config.passport.poniverse, function (accessToken, refreshToken, profile, done) {
      let provider = 'poniverse'
      fetchJSON('https://api.poniverse.net/v1/users/me?access_token=' + accessToken, null, function (err, data) {
        if (err) {
          done(err, null)
          return
        }

        let userInfo = {
          provider: provider,
          accessToken: accessToken,
          refreshToken: refreshToken,
          uid: data.id,

          username: data.username,
          displayName: data.display_name,
          email: data.email,
          level: 0,
          avatarUrl: ''
        }

        User.handleAuth(userInfo, done)
      })
    })

    poniverse.name = 'poniverse' // replace 'oauth2'
    passport.use(poniverse)
  }

  if (config.passport.twitter && config.passport.twitter.consumerKey) {
    passport.use(new TwitterStrategy(config.passport.twitter, function (accessToken, refreshToken, profile, done) {
      let provider = 'twitter'

      let userInfo = {
        provider: provider,
        accessToken: accessToken,
        refreshToken: refreshToken,
        uid: profile.id,

        username: profile.username,
        displayName: profile.displayName,
        level: 0,
        avatarUrl: profile.photos[0].value
      }

      process.nextTick(() => User.handleAuth(userInfo, done))
    }))
  }
}
