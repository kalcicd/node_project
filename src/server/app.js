import axios from 'axios'
import fs from 'fs'
import path from 'path'
import express from 'express'
import React from 'react'
import { renderToString } from 'react-dom/server'

import Index from '../client/components/index'
import AboutUs from '../client/components/aboutus'
import Volunteer from '../client/components/volunteer'
import Developers from '../client/components/developers'
import Error404 from '../client/components/404'
import Location from '../client/components/location'
import Login from '../client/components/login'
import Verify from '../client/components/verify'
import Officeholder from '../client/components/officeholder'
import config from '../../config/default.json'
import { gisLocationQuery } from './gis'

const pathToTemplate = path.join(__dirname, './views/layout.html')
const template = fs.readFileSync(pathToTemplate, 'utf8')

const session = require('express-session')

const bcrypt = require('bcrypt')
const bcryptSaltRounds = 15

const app = express()
// use body-parser to handle post requests
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('./src/server/public'))

// setup session secret
app.use(session({
  secret: config.sessionSecret.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {}
}))

const userLoginStatus = (req) => {
  // extracts the relevant user data from the active session and returns it in a dict
  let statusDict = { 'logged_in': false, 'is_verifier': false }
  if (req.session === undefined || req.session.user === undefined) {
    return statusDict
  }
  statusDict['logged_in'] = true
  statusDict['username'] = req.session.user
  if (req.session.is_verifier === undefined || req.session.is_verifier === false) {
    return statusDict
  }
  statusDict['is_verifier'] = true
  return statusDict
}

app.get('/', (req, res, next) => {
  let userStatus = userLoginStatus(req)
  const renderedContent = renderToString(
    <Index logged_in={userStatus.logged_in} is_verifier={userStatus.is_verifier} />
  )
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/index.css')
  res.status(200).send(page)
})

app.get('/about', (req, res, next) => {
  let userStatus = userLoginStatus(req)
  const renderedContent = renderToString(
    <AboutUs logged_in={userStatus.logged_in} is_verifier={userStatus.is_verifier} />
  )
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/aboutus.css')
  res.status(200).send(page)
})

app.get('/volunteer', (req, res, next) => {
  let userStatus = userLoginStatus(req)
  const renderedContent = renderToString(
    <Volunteer logged_in={userStatus.logged_in} is_verifier={userStatus.is_verifier} />
  )
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/volunteer.css')
  res.status(200).send(page)
})

app.get('/developers', (req, res, next) => {
  let userStatus = userLoginStatus(req)
  const renderedContent = renderToString(
    <Developers logged_in={userStatus.logged_in} is_verifier={userStatus.is_verifier} />
  )
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/developers.css')
  res.status(200).send(page)
})

// show a selection of unverified submissions
app.get('/verify', (req, res, next) => {
  let userStatus = userLoginStatus(req)
  if (userStatus.is_verifier !== true) {
    // redirect the user back to the landing page if they are not a verifier
    res.redirect(403, '/')
    return
  }
  // todo: fetch submissions from database
  let submissions = [ // temporary submissions list
    {
      'title': 'Corvalis',
      'type': 'location',
      'reference': 'https://en.wikipedia.org',
      'id': 0,
      'updates': [['Location', 'Corvalis', 'Corvallis']]
    },
    {
      'title': 'Corvallis City Council Member',
      'type': 'office',
      'reference': 'https://en.wikipedia.org',
      'id': 0,
      'updates': [['OfficeTitle', 'City Council Member', 'City Councilor']]
    }
  ]
  const renderedContent = renderToString(<Verify
    submissions={submissions} logged_in={userStatus.logged_in} is_verifier={userStatus.is_verifier}
  />)
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/verify.css')
  page = page.replace('<!--SCRIPT-->', '<script src="/js/verify.js" defer></script>')
  res.status(200).send(page)
})

// User login page
app.get('/login', (req, res, next) => {
  let showLoginError = (req.query.verificationFailed !== undefined)
  const renderedContent = renderToString(<Login />)
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/login.css')
  // page = page.replace('<!--SCRIPT-->','<script src="/js/verify.js" defer></script>');
  res.status(200).send(page)
})

// Handle user login submission
app.post('/login', (req, res, next) => {
  // todo: fetch hash from database based on username
  // temporary credentials: username: user (or user2), password: password
  const temporaryUsersTable = {
    'user': { password: '$2b$15$XilY7gUBSvL7l4Yh5uFXkuwYXTV4u9ikB0OvKRxqq5fNWrpi17VTS', is_verifier: true },
    'user2': { password: '$2b$15$XilY7gUBSvL7l4Yh5uFXkuwYXTV4u9ikB0OvKRxqq5fNWrpi17VTS', is_verifier: false }
  }

  // function to be called if the user's credentials are rejected
  function loginFailed () {
    res.redirect(403, '/login?verificationFailed=true')
  }

  let username = req.body.user
  if (temporaryUsersTable.hasOwnProperty(username)) {
    bcrypt.compare(
      req.body.pass,
      temporaryUsersTable[username].password,
      function (err, result) {
        if (err === undefined) { // no errors occurred
          if (result) { // login was successful
            req.session.user = username
            req.session.is_verifier = temporaryUsersTable[username].is_verifier
            res.redirect('/')
          } else { // login failed
            loginFailed()
          }
        } else { // an error occurred
          res.status(500).send('')
        }
      }
    )
  }
})

// handle user logout
app.get('/logout', (req, res, next) => {
  req.session.destroy(function (err) {
    if (!err) { // no errors occurred
      res.redirect(302, '/')
    } else { // an error occurred while trying to logout
      res.redirect(302, '/?logoutFailed=true')
    }
  })
})

// Generate Results page
app.get('/location', async (req, res, next) => {
  const { lat, lng } = req.query
  console.log('lat = ', lat)
  console.log('lng = ', lng)
  if (lat === undefined || lng === undefined) {
    return res.redirect('/404')
  }
  const gisResponse = await gisLocationQuery(lat, lng).catch((err) => {
    console.error(err)
    return res.status(500).send('500')
  })
  console.log(gisResponse)

  const renderedContent = renderToString(React.createElement(Location, { lat, lng }))
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/location.css')
  return res.status(200).send(page)
})

app.get('/officeholder/:officeholderId', (req, res, next) => {
  const { officeholderId } = req.params

  // todo: query db with officeholder id to get officeholderProps. An example response from the db is hardcoded below
  const officeholderProps = {
    officeTitle: 'Lane County Commissioner',
    officeholderName: 'Joe Berney',
    termStart: 'January 2019',
    termEnd: 'May 2022',
    nextElectionDate: 'May 2022',
    phone: '541-746-2583',
    email: 'joe.berney@lanecounty-or.gov',
    meetings: 'Every Monday at 9am at Lance county Courthouse, Eugene, Oregon'
  }
  const renderedContent = renderToString(React.createElement(Officeholder, officeholderProps))
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/officeholder.css')
  res.status(200).send(page)
})

app.get('/search', (req, res, next) => {
  const address = req.query.q
  if (address === undefined) { // search query must be present for this endpoint or else we 404
    return res.redirect('/404')
  }
  const geocodingConfig = config.geocoding
  axios.get(geocodingConfig.apiUrl, {
    params: {
      address: address,
      key: geocodingConfig.apiKey
    }
  }).then((response) => {
    const results = response.data.results
    if (results.length === 0) {
      return res.redirect('/404') // eventually we want to have this redirect to a separate 'no results found' page.
    }
    const topResult = results[0]
    const { lat, lng } = topResult['geometry']['location']
    res.redirect(`/location?lat=${lat}&lng=${lng}`)
  }).catch((error) => {
    console.error(error)
    res.status(500).send()
  })
})

// 404 error handling
app.use((req, res, next) => {
  const renderedContent = renderToString(<Error404 />)
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/404.css')
  res.status(404).send(page)
})

// Opens a socket and listens for connections only if there is no parent module running the script.
if (!module.parent) {
  app.listen(8080, () => {
    console.log('Server started on port 8080...')
  })
}

export default app
