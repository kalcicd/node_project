import axios from 'axios'
import fs from 'fs'
import path from 'path'
import express from 'express'
import React from 'react'
import { Pool } from 'pg'
import { renderToString } from 'react-dom/server'

import AccountCreated from '../client/components/accountCreated'
import AboutUs from '../client/components/aboutus'
import Developers from '../client/components/developers'
import Error404 from '../client/components/404'
import GeneralError from '../client/components/generalError'
import Index from '../client/components/index'
import Location from '../client/components/location'
import Login from '../client/components/login'
import NewAccount from '../client/components/newAccount'
import Officeholder from '../client/components/officeholder'
import Verify from '../client/components/verify'
import Volunteer from '../client/components/volunteer'

import config from '../../config/default.json'
import { gisLocationQuery } from './gis'
import {
  getPendingChanges,
  updateField,
  updateData,
  deletePendingData,
  getOfficeholderData,
  getLocationProps,
  addPendingData
} from './sql'

const pathToTemplate = path.join(__dirname, './views/layout.html')
const template = fs.readFileSync(pathToTemplate, 'utf8')
// cookie session
const session = require('express-session')
// bcrypt for password hashing
const bcrypt = require('bcrypt')
const bcryptSaltRounds = 15

const databasePool = new Pool({
  host: config.postgresql.address,
  user: config.postgresql.user,
  password: config.postgresql.pass
})

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
  let statusDict = { 'loggedIn': false, 'isVerifier': false };
  if (req.session === undefined || req.session.user === undefined) {
    return statusDict;
  }
  statusDict['loggedIn'] = true;
  statusDict['username'] = req.session.user;
  if (req.session.isVerifier !== true) {
    return statusDict;
  }
  statusDict['isVerifier'] = true;
  return statusDict;
}

app.get('/', (req, res, next) => {
  let userStatus = userLoginStatus(req);
  const renderedContent = renderToString(
    <Index user={userStatus} />
  )
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/index.css');
  res.status(200).send(page);
})

app.get('/about', (req, res, next) => {
  let userStatus = userLoginStatus(req)
  const renderedContent = renderToString(
    <AboutUs user={userStatus} />
  )
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/aboutus.css')
  res.status(200).send(page)
})

app.get('/volunteer', (req, res, next) => {
  let userStatus = userLoginStatus(req)
  const renderedContent = renderToString(
    <Volunteer user={userStatus} />
  )
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/volunteer.css')
  res.status(200).send(page)
})

app.get('/developers', (req, res, next) => {
  let userStatus = userLoginStatus(req)
  const renderedContent = renderToString(
    <Developers user={userStatus} />
  )
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/developers.css')
  res.status(200).send(page)
})

// show a selection of unverified submissions
app.get('/verify', async (req, res, next) => {
  let userStatus = userLoginStatus(req)
  if (userStatus.isVerifier !== true) {
    // redirect the user back to the landing page if they are not a verifier
    const renderedContent = renderToString(
      <GeneralError user={userStatus} errorHeader='403 Denied'
        errorMessage='You do not have permission to access this page' />
    )
    let page = template.replace('<!-- CONTENT -->', renderedContent)
    res.status(403).send(page)
    return
  }
  // todo: need to retrieve current field value in addition to pending value
  const submissions = await getPendingChanges().catch((err) => { res.status(500).send(err) })
  const renderedContent = renderToString(<Verify submissions={submissions} user={userStatus} />)
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/verify.css')
  page = page.replace('<!--SCRIPT-->', '<script src="/js/verify.js" defer></script>')
  res.status(200).send(page)
})
app.post('/verify', async (req, res, next) => {
  // check that the required fields were passed
  let hasRequiredFields = req.body.id !== undefined;
  hasRequiredFields = hasRequiredFields && req.body.accept !== undefined;
  hasRequiredFields = hasRequiredFields && req.body.reason !== undefined;
  if (!hasRequiredFields) {
    res.status(400).send('Missing fields');
    return;
  }
  //check that the user is a verifier
  let userStatus = userLoginStatus(req);
  if(userStatus.isVerifier === false){
    res.status(403).send('Access denied');
    return;
  }
  // update/create new data
  if (req.body.accept === 'true') {
    let acceptSuccess = await updateData(
      req.body.id, req.body.updateTarget, req.body.updateChanges
    ).catch(() => { res.status(500).send('') })
    if (acceptSuccess !== undefined) res.status(200).send('');
  }
  else {
    let deleteSuccess = await deletePendingData(req.body.id).catch(() => { res.status(500).send('') });
    if (deleteSuccess !== undefined) res.status(200).send('');
  }
})

// Create new account page
app.get('/newAccount', (req, res, next) => {
  let userStatus = userLoginStatus(req);
  if (userStatus.loggedIn === true) {
    // redirect if the user is already logged in
    const renderedContent = renderToString(
      <GeneralError user={userStatus} errorHeader='You are logged in'
        errorMessage='You cannot create a new account, you already have an account' />
    )
    let page = template.replace('<!-- CONTENT -->', renderedContent);
    res.status(403).send(page);
    return;
  }
  const renderedContent = renderToString(<NewAccount />);
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/newAccount.css');
  res.status(200).send(page);
})
// Handle new account creation
app.post('/newAccount', async (req, res, next) => {
  function accountCreationFailed (reason) {
    const renderedContent = renderToString(<NewAccount hasError={true} errorReason={reason} />);
    let page = template.replace('<!-- CONTENT -->', renderedContent);
    page = page.replace('<!-- STYLESHEET -->', '/css/newAccount.css');
    res.status(400).send(page);
  }

  // check that all required fields were passed
  let hasRequiredFields = true
  hasRequiredFields = hasRequiredFields && (req.body['username'] !== undefined && req.body['username'] !== '')
  hasRequiredFields = hasRequiredFields && (req.body['email'] !== undefined && req.body['email'] !== '')
  hasRequiredFields = hasRequiredFields && (req.body['pass'] !== undefined && req.body['pass'] !== '')
  hasRequiredFields = hasRequiredFields && (req.body['pass2'] !== undefined && req.body['pass2'] !== '')
  if (!hasRequiredFields) {
    accountCreationFailed('Not all required fields were filled');
    return;
  }
  // check username is unique
  let existingUser = await databasePool.query(
    'SELECT * FROM Users WHERE username=$1', [req.body.username]
  )
  if (existingUser['rows'].length > 0) {
    accountCreationFailed('The username is already taken');
    return;
  }
  // check that the password and confirm password field match
  if (req.body.pass !== req.body['pass2']) {
    accountCreationFailed('The password and confirm password fields do not match');
    return;
  }
  // hash password for storage in the database
  bcrypt.hash(req.body.pass, bcryptSaltRounds, (err, hash) => {
    if (err) { // show an error page to the user if hashing the password failed
      // todo: log error output to console or file
      const renderedContent = renderToString(<GeneralError errorHeader='500 Internal Server Error'
        errorMessage='An error occurred while creating the user, please try again or contact an administrator if the problem persists' />);
      let page = template.replace('<!-- CONTENT -->', renderedContent);
      res.status(500).send(page);
    } else {
      /*
        newUserQuery is a string which is passed to the databasePool.query function
        newUserData is a list which contains the data associated with the query in the order specified
        in newUserQuery
      */
      let newUserQuery = 'INSERT INTO Users (username,email,passwd';
      let newUserData = [req.body['username'], req.body['email'], hash];
      if (req.body['name'] !== '') { // check if the Name field was filled
        newUserQuery += ',name';
        newUserData.push(req.body.name);
      }
      if (req.body['phone'] !== '') { // check if the Phone Number field was filled
        newUserQuery += ',phone'
        // reduce the phone number to only decimal digits
        let reducedPhoneNumber = String(req.body['phone']).replace(/[^0-9]/g, '')
        newUserData.push(reducedPhoneNumber)
      }
      if (req.body['address'] !== '' || req.body['city'] !== '' || req.body['zip'] !== '') {
        if (req.body['address'] === '' || req.body['city'] === '' || req.body.state === undefined || req.body['zip'] === '') {
          // send an error that only part of the address was filled out
          const errorContent = renderToString(<NewAccount hasError
            errorMessage='Only some of the address fields were filled out, please either fill out all of the fields or leave them all blank' />)
          let page = template.replace('<!-- CONTENT -->', errorContent)
          page = page.replace('<!-- STYLESHEET -->', '/css/newAccount.css')
          res.status(400).send(page)
        }
        newUserQuery += ',addressline1,addresscity,addressstate,addresszip'
        newUserData.push(req.body['address'])
        newUserData.push(req.body['city'])
        newUserData.push(req.body['state'])
        newUserData.push(req.body['zip'])
        if (req.body['address2'] !== '') {
          newUserQuery += ',addressline2'
          newUserData += newUserData.push(req.body['address2'])
        }
      }
      // finish query string with formatting indicators ($1,$2,etc.)
      newUserQuery += ') VALUES ($1,$2,$3'
      for (let i = 3; i < newUserData.length; i++) {
        newUserQuery += ',$' + String(i + 1)
      }
      newUserQuery += ');'
      // add the new user to the database
      databasePool.query(newUserQuery, newUserData, (err, queryRes) => {
        if (err) { // an error occurred while inserting the values into the database
          // log the error
          console.error('An error occurred while adding a user to the database:')
          console.error('\tQuery:' + newUserQuery)
          console.error('\tData:' + String(newUserData))
          console.error('\tError:' + err)
          // send an error message
          const errorContent = renderToString(<NewAccount hasError
            errorMessage='A server error occurred, please try again' />)
          let page = template.replace('<!-- CONTENT -->', errorContent)
          page = page.replace('<!-- STYLESHEET -->', '/css/newAccount.css')
          res.status(500).send(page)
        } else {
          // send success page
          const renderedContent = renderToString(<AccountCreated />)
          let page = template.replace('<!-- CONTENT -->', renderedContent)
          page = page.replace('<!-- STYLESHEET -->', '/css/accountCreated.css')
          res.status(200).send(page)
        }
      })
    }
  })
})

// User login page
app.get('/login', (req, res, next) => {
  let userStatus = userLoginStatus(req)
  if (userStatus.loggedIn === true) {
    const renderedContent = renderToString(
      <GeneralError user={userStatus} errorHeader='Cannot Log In'
        errorMessage='You are already logged in' />
    )
    let page = template.replace('<!-- CONTENT -->', renderedContent)
    res.status(403).send(page)
    return
  }
  const renderedContent = renderToString(<Login />)
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/login.css')
  res.status(200).send(page)
})

// Handle user login submission
app.post('/login', async (req, res, next) => {
  // function to be called if the user's credentials are rejected
  function loginFailed () {
    const renderedContent = renderToString(<Login loginFailed />)
    let page = template.replace('<!-- CONTENT -->', renderedContent)
    page = page.replace('<!-- STYLESHEET -->', '/css/login.css')
    res.status(403).send(page)
  }

  let username = req.body.user
  // todo: sanitize username
  // probably would be better to use a callback here incase of an error
  // find user in database
  const userRes = await databasePool.query('SELECT * FROM Users WHERE username=$1', [username]).catch((err) => {
    console.error(err)
    return res.status(500).send('A server error occurred, please try again')
  })
  if (userRes['rows'].length > 0 && userRes['rows'][0].username === username) {
    // the user was found in the database, compare the passwords
    bcrypt.compare(
      req.body.pass,
      userRes['rows'][0]['passwd'],
      function (err, result) {
        if (err === undefined) { // no errors occurred
          if (result) { // login was successful
            req.session.user = username
            req.session.isVerifier = userRes['rows'][0]['isverifier']
            res.redirect('/')
          } else { // login failed
            loginFailed()
          }
        } else { // an error occurred
          res.status(500).send('A server error occurred, please try again')
        }
      }
    )
  } else { // user does not exist
    loginFailed()
  }
})

// handle user logout
app.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (!err) { // no errors occurred
      res.redirect(302, '/')
    } else { // an error occurred while trying to logout
      res.redirect(302, '/?logoutFailed=true')
    }
  })
})

// Handle submission of pending data
app.post('/submit', async (req, res) => {
  const userStatus = userLoginStatus(req)
  const { type, referenceLink, referenceId, updateChanges } = req.body
  for (const field of ['type', 'referenceLink', 'referenceId']) {
    if (req.body[field] === undefined) {
      return res.status(400).send(`Required field '${field}' is missing`)
    }
  }
  if (userStatus.isVerifier) {
    await addPendingData(type, userStatus['username'], referenceLink, referenceId, updateChanges).catch((err) => {
      console.error(err)
      return res.status(400).send(err)
    })
    return res.status(200).send()
  } else {
    return res.status(403).send()
  }
})
// Generate Results page
app.get('/location', async (req, res, next) => {
  const { lat, lng } = req.query
  console.log('lat = ', lat)
  console.log('lng = ', lng)
  if (lat === undefined || lng === undefined) {
    return res.redirect('/404');
  }
  // Get GIS identifiers for location
  const gisResponse = await gisLocationQuery(lat, lng).catch((err) => {
    console.error(err);
    return res.status(500).send('500');
  })
  console.log('GIS Response: ' + gisResponse)

  const locationList = await getLocationProps(gisResponse).catch((err) => {
    console.error(err);
    return res.status(500).send('500');
  })

  const locationProps = {
    federal: [],
    state: [],
    county: [],
    city: [],
    school: [],
    local: [],
    other: [],
    lat,
    lng
  }

  for (let i = 0; i < locationList.length; i++) {
    const loc = locationList[i]
    let prop
    switch (loc.levelnum) {
      case 0:
        prop = locationProps.federal
        break
      case 1:
        prop = locationProps.state
        break
      case 2:
        prop = locationProps.county
        break
      case 3:
        prop = locationProps.city
        break
      case 4:
        prop = locationProps.school
        break
      case 5:
        prop = locationProps.local
        break
      default:
        prop = locationProps.other
        break
    }
    prop.push({
      title: loc.officetitle,
      name: loc.name,
      id: `/officeholder/${loc.holderid}`
    })
  }
  const renderedContent = renderToString(React.createElement(Location, locationProps))
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/location.css')
  page = page.replace('<!--SCRIPT-->', '<script src="/js/location.js" defer></script>')
  return res.status(200).send(page)
})

app.get('/officeholder/:officeholderId', async (req, res, next) => {
  const { officeholderId } = req.params
  const officeholderProps = await getOfficeholderData(officeholderId).catch((err) => {
    if (err.code === '22P02') {
      // catches the case where locationId is not an integer
      return res.status(404).redirect('/404');
    }
    return res.status(500).send('500');
  })

  const renderedContent = renderToString(React.createElement(Officeholder, officeholderProps))
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/officeholder.css')
  res.status(200).send(page)
})

app.get('/search', (req, res, next) => {
  const address = req.query.q;
  if (address === undefined) { // search query must be present for this endpoint or else we 404
    return res.redirect('/404');
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
      return res.redirect('/404'); // eventually we want to have this redirect to a separate 'no results found' page.
    }
    const topResult = results[0];
    const { lat, lng } = topResult['geometry']['location'];
    res.redirect(`/location?lat=${lat}&lng=${lng}`);
  }).catch((error) => {
    console.error(error);
    res.status(500).send();
  });
})

// 404 error handling
app.use((req, res, next) => {
  let userStatus = userLoginStatus(req);
  const renderedContent = renderToString(<Error404 user={userStatus} />);
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/404.css');
  res.status(404).send(page);
})

// Opens a socket and listens for connections only if there is no parent module running the script.
if (!module.parent) {
  app.listen(8080, () => {
    console.log('Server started on port 8080...')
  })
}

export default app
