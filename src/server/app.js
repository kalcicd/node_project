import axios from 'axios';
import fs from 'fs';
import path from 'path';
import express from 'express';
import React from 'react';
import { Pool } from 'pg';
import { renderToString } from 'react-dom/server';
import { Parser } from 'json2csv';

import AccountCreated from '../client/components/accountCreated';
import AboutUs from '../client/components/aboutus';
import AboutAccount from '../client/components/aboutAccount.js';
import Developers from '../client/components/developers';
import Error404 from '../client/components/404';
import GeneralError from '../client/components/generalError';
import Index from '../client/components/index';
import Location from '../client/components/location';
import Login from '../client/components/login';
import NewAccount from '../client/components/newAccount';
import Officeholder from '../client/components/officeholder';
import Verify from '../client/components/verify';

import config from '../../config/default.json';
import { gisLocationQuery } from './gis';
import {
  getPendingChanges,
  updateField,
  updateData,
  deletePendingData,
  getOfficeholderData,
  getLocationProps,
  addPendingData,
  accountExists,
  createAccount
} from './sql';

const pathToTemplate = path.join(__dirname, './views/layout.html');
const template = fs.readFileSync(pathToTemplate, 'utf8');
// cookie session
const session = require('express-session');
// bcrypt for password hashing
const bcrypt = require('bcrypt');
const bcryptSaltRounds = 15;
// nodemailer to send users emails
const nodemailer = require('nodemailer');

const databasePool = new Pool({
  host: config.postgresql.address,
  user: config.postgresql.user,
  password: config.postgresql.pass
});

const app = express();
// use body-parser to handle post requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('./src/server/public'));

// setup session secret
app.use(session({
  secret: config.sessionSecret.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {}
}));

// configure nodemailer
const mail = nodemailer.createTransport({
  service: config.mail.service,
  auth: {
    user: config.mail.username,
    pass: config.mail.password
  }
});
const mailTemplate = fs.readFileSync(path.join(__dirname, './views/email.html'), 'utf8');

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

const sendGeneralError = (res, header, message, statusCode = 500, user = null) => {
  const renderedContent = renderToString(
    <GeneralError errorHeader={header} errorMessage={message} user={user} />
  );
  const page = template.replace('<!-- CONTENT -->', renderedContent);
  res.status(statusCode).send(page);
}

app.get('/', (req, res, next) => {
  let userStatus = userLoginStatus(req);
  const renderedContent = renderToString(
    <Index user={userStatus} />
  );
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/index.css');
  res.status(200).send(page);
});

app.get('/about', (req, res, next) => {
  let userStatus = userLoginStatus(req);
  const renderedContent = renderToString(
    <AboutUs user={userStatus} />
  );
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/aboutus.css');
  res.status(200).send(page);
});

app.get('/developers', (req, res, next) => {
  let userStatus = userLoginStatus(req);
  const renderedContent = renderToString(
    <Developers user={userStatus} />
  );
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/developers.css');
  res.status(200).send(page);
});

app.get('/download', async (req, res, next) => {
  // get params
  const { level, state } = req.query;
  let userStatus = userLoginStatus(req);
  // set level number and query string
  const levelNum = (level === 'state' ? 1 : (level === 'county' ? 2 : 3));
  const queryString = 'SELECT * FROM Locations a, LocationTypes b, Offices c, Officeholders d WHERE a.TypeId = b.TypeId AND b.LevelNum = $1 AND c.LocationId = a.LocationId AND d.HolderId = c.CurrentHolder';

  // run query
  const dataRes = await databasePool.query(queryString, [levelNum]).catch((err) => {;
    console.error(err);
    return res.status(500).send('A server error occurred, please try again');
  });

  if (dataRes['rows'].length > 0) {
    // set field mapping
    const fields = [
      {
        label: 'locationid',
        value: 'locationid'
      },
      {
        label: 'typename',
        value: 'typename'
      },
      {
        label: 'locationname',
        value: 'locationname'
      },
      {
        label: 'holderid',
        value: 'holderid'
      },
      {
        label: 'name',
        value: 'name'
      },
      {
        label: 'contactphone',
        value: 'contactphone'
      }
    ];

    // convert to csv
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(dataRes['rows']);
    res.header('Content-Type', 'text/csv');
    res.attachment(state + '-' + level + '.csv');
    res.status(200).send(csv);
  } else {
    const renderedContent = renderToString(
      <Developers logged_in={userStatus.loggedIn} isVerifier={userStatus.isVerifier} />
    );
    let page = template.replace('<!-- CONTENT -->', renderedContent);
    page = page.replace('<!-- STYLESHEET -->', '/css/developers.css');
    res.status(200).send(page);
  };
});

// show a selection of unverified submissions
app.get('/verify', async (req, res, next) => {
  let userStatus = userLoginStatus(req);
  if (userStatus.isVerifier !== true) {
    // redirect the user back to the landing page if they are not a verifier
    sendGeneralError(res, '403 Denied', 'You do not have permission to access this page', 403, userStatus);
    return;
  };
  // todo: need to retrieve current field value in addition to pending value
  const submissions = await getPendingChanges().catch(() => {
    sendGeneralError(res, '500 Error', 'A server error occurred, please try again', 500, userStatus);
  });
  const renderedContent = renderToString(<Verify submissions={submissions} user={userStatus} />);
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/verify.css');
  page = page.replace('<!--SCRIPT-->', '<script src="/js/verify.js" defer></script>');
  res.status(200).send(page);
});

app.post('/verify', async (req, res, next) => {
  const userStatus = userLoginStatus(req);
  // check that the user is a verifier
  if (userStatus.isVerifier === false) {
    sendGeneralError(
      res, 'Access Denied', 'You do not have permission to verify submissions', 403, userStatus
    );
    return;
  };
  // check that the required fields were passed
  let hasRequiredFields = req.body.id !== undefined;
  hasRequiredFields = hasRequiredFields && req.body.accept !== undefined;
  hasRequiredFields = hasRequiredFields && req.body.reason !== undefined;
  if (!hasRequiredFields) {
    sendGeneralError(res, 'Missing Fields', 'The request was missing important fields', 400, userStatus);
    return;
  };
  // update/create new data
  if (req.body.accept === 'true') {
    // accept the submission
    let acceptSuccess = await updateData(
      req.body.id, req.body.updateTarget, req.body.updateChanges
    ).catch(() => {
      sendGeneralError(res, '500 Error', 'A server error occurred, please try again later', 500, userStatus);
    });
    if (acceptSuccess !== undefined) res.status(200).send('');
  } else {
    // reject the submission
    const deleteSuccess = await deletePendingData(req.body.id).catch(() => {
      sendGeneralError(res, '500 Error', 'A server error occurred, please try again', 500, userStatus);
    });
    if (deleteSuccess !== undefined) {
      // fetch the data about the submission user
      let submitUser = await databasePool.query(
        'SELECT * FROM Users WHERE username=$1', [req.body.submissionUser]
      ).catch(() => {
        sendGeneralError(res, '500 Server Error', 'A server error occurred, please try again');
      });
      submitUser = submitUser.rows[0];
      // check that the user has an email and the user wants to receive emails
      if (submitUser.email !== null && submitUser.email.length > 0 && submitUser.wantsemails === true) {
        // create the email from the template
        let mailHtml = mailTemplate.replace('<!-- REASON -->', req.body.reason);
        if (submitUser.name !== null && submitUser.name.length > 0) {
          mailHtml = mailHtml.replace('<!-- NAME -->', submitUser.name);
        } else {
          mailHtml = mailHtml.replace('<!-- NAME -->', submitUser.username);
        }
        // send the user an email
        const mailOptions = {
          from: config.mail.username,
          to: submitUser.email,
          subject: 'NODE Project: Submission Rejected',
          html: mailHtml
        };
        mail.sendMail(mailOptions, (err, inf) => {
          if (err) {
            console.log('Failed to send rejection email to ' + submitUser.username);
          }
        });
      }
      // send the submission user an email
      res.status(200).send('');
    }
  }
});

// Create new account page
app.get('/newAccount', (req, res, next) => {
  let userStatus = userLoginStatus(req);
  if (userStatus.loggedIn === true) {
    // redirect if the user is already logged in
    sendGeneralError(
      res, 'You Are Logged In', 'You cannot create a new account, you already have an account',
      403, userStatus
    )
    return;
  }
  const renderedContent = renderToString(<NewAccount />);
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/newAccount.css');
  res.status(200).send(page);
});
// Handle new account creation
app.post('/newAccount', async (req, res, next) => {
  const userStatus = userLoginStatus(req);

  const accountCreationFailed = (reason) => {
    const renderedContent = renderToString(<NewAccount hasError errorReason={reason} />);
    let page = template.replace('<!-- CONTENT -->', renderedContent);
    page = page.replace('<!-- STYLESHEET -->', '/css/newAccount.css');
    res.status(400).send(page);
  }

  const { username, email, pass, pass2, phone, address, address2, city, state, zip } = req.body;

  // check that all required fields were passed
  let hasRequiredFields = true;
  hasRequiredFields = hasRequiredFields && (username !== undefined && username !== '');
  hasRequiredFields = hasRequiredFields && (email !== undefined && email !== '');
  hasRequiredFields = hasRequiredFields && (pass !== undefined && pass !== '');
  hasRequiredFields = hasRequiredFields && (pass2 !== undefined && pass2 !== '');

  if (!hasRequiredFields) {
    accountCreationFailed('Missing Required field(s)');
    return;
  }
  // check that the password and confirm password field match
  if (pass !== pass2) {
    accountCreationFailed('The password and confirm password fields do not match');
    return;
  }

  if (address !== '' || city !== '' || zip !== '') {
    if (address === '' || city === '' || state === undefined || zip === '') {
      // send an error that only part of the address was filled out
      const errorContent = renderToString(
        <NewAccount hasError
          errorMessage='Only some of the address fields were filled out, please either fill out all of the fields or leave them all blank' />
      );
      let page = template.replace('<!-- CONTENT -->', errorContent);
      page = page.replace('<!-- STYLESHEET -->', '/css/newAccount.css');
      res.status(400).send(page);
      return;
    }
  }

  // check username is unique
  const exists = await accountExists(username).catch((err) => {
    console.log(err);
    sendGeneralError(res, '500 Internal Server Error', 'A server error occurred, please try again', 500, userStatus);
  });

  if (exists) {
    accountCreationFailed('The username is already taken');
    return;
  }

  const userData = {
    username,
    email,
    passwd: pass,
    phone: (phone !== '') ? String(phone).replace(/[^0-9]/g, '') : null,
    addressline1: (address !== '') ? address : null,
    addressline2: (address2 !== '') ? address2 : null,
    addresscity: (city !== '') ? city : null,
    addressstate: state,
    addresszip: (zip !== '') ? zip : null,
    wantsemails: true
  };

  await createAccount(userData).catch((err) => {
    console.log(err);
    sendGeneralError(res, '500 Internal Server Error', 'A server error occurred, please try again later', 500, userStatus);
  });

  // send success page
  const renderedContent = renderToString(<AccountCreated />);
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/accountCreated.css');
  res.status(200).send(page);
});

// About user page
app.get('/aboutme', async (req, res, next) => {
  const userStatus = userLoginStatus(req);
  if (userStatus.loggedIn === false) {  // check if the user is not logged in
    res.status(304).redirect('/login?redirect=/aboutme');
    return;
  }
  // fetch user data from the database
  const userData = await databasePool.query(
    'SELECT * FROM Users WHERE username=$1', [userStatus.username]
  ).catch(() => {
    sendGeneralError(
      res, '500 Error',
      'A server error occurred, please try again or contact an administrator if the problem persists',
      500, userStatus
    );
  });
  // todo: check if the user could not be found
  // extract the first row
  const userRow = userData.rows[0];
  const renderedContent = renderToString(<AboutAccount userRow={userRow} />);
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/aboutAccount.css');
  page = page.replace('<!--SCRIPT-->', '<script src="/js/aboutAccount.js" defer></script>');
  res.status(200).send(page);
});

// Handle updating user information
app.post('/updateAccount', async (req, res, next) => {
  const userStatus = userLoginStatus(req);
  if (userStatus.loggedIn === false) {  // check if the user is not logged in
    sendGeneralError(
      res, 'Permission Denied', 'You must be logged in to update your account information', 403, userStatus
    );
    return;
  };
  // fetch user data from the database
  let oldUserData = await databasePool.query(
    'SELECT * FROM Users WHERE username=$1', [userStatus.username]
  ).catch(() => {
    // if the query caused an error, render the aboutAccount page with an error message
    const renderedContent = renderToString(
      <AboutAccount userRow={oldUserData}
        errorMessage='A server error occurred, please try again or contact an administrator if the problem persists' />
    );
    let page = template.replace('<!-- CONTENT -->', renderedContent);
    page = page.replace('<!-- STYLESHEET -->', '/css/aboutAccount.css');
    page = page.replace('<!--SCRIPT-->', '<script src="/js/aboutAccount.js" defer></script>');
    res.status(500).send(page);
  });
  // check if the user could not be found
  if (oldUserData.rows === undefined || oldUserData.rows[0] === undefined) {
    sendGeneralError(
      res, 'Failed to Find User',
      'The server could not find the user information, please try again or contact an administrator if the problem persists',
      500, userStatus
    );
    return;
  }
  oldUserData = oldUserData.rows[0];

  // create a function to send query to update the database
  const updateUserData = async (queryStr, oldUserData) => {
    // send the update query to the database
    let updatedUser = await databasePool.query(queryStr).catch(() => {
      // if the query caused an error, render the aboutAccount page with an error message
      const renderedContent = renderToString(
        <AboutAccount userRow={oldUserData}
          errorMessage='A server error occurred, please try again or contact an administrator if the problem persists' />
      );
      let page = template.replace('<!-- CONTENT -->', renderedContent);
      page = page.replace('<!-- STYLESHEET -->', '/css/aboutAccount.css');
      page = page.replace('<!--SCRIPT-->', '<script src="/js/aboutAccount.js" defer></script>');
      res.status(500).send(page);
    });
    // check if the query was successful
    if (
      updatedUser !== undefined && updatedUser[1] !== undefined &&
      updatedUser[1].rows !== undefined && updatedUser[1].rows[0] !== undefined
    ) {
      updatedUser = updatedUser[1].rows[0];
      // if the query was successful, render the aboutAccount page with the updated information
      const renderedContent = renderToString(<AboutAccount userRow={updatedUser} success />);
      let page = template.replace('<!-- CONTENT -->', renderedContent);
      page = page.replace('<!-- STYLESHEET -->', '/css/aboutAccount.css');
      page = page.replace('<!--SCRIPT-->', '<script src="/js/aboutAccount.js" defer></script>');
      res.status(200).send(page);
    } else {
      // if the query caused an error, render the aboutAccount page with an error message
      const renderedContent = renderToString(
        <AboutAccount userRow={oldUserData}
          errorMessage='A server error occurred, please try again or contact an administrator if the problem persists' />
      );
      let page = template.replace('<!-- CONTENT -->', renderedContent);
      page = page.replace('<!-- STYLESHEET -->', '/css/aboutAccount.css');
      page = page.replace('<!--SCRIPT-->', '<script src="/js/aboutAccount.js" defer></script>');
      res.status(500).send(page);
    }
  }

  // check which fields were updated
  const possibleFields = [
    'name', 'email', 'phone', 'addressline1', 'addressline2', 'addresscity', 'addressstate', 'addresszip'
  ];
  let hasUpdate = false;
  possibleFields.forEach((elem) => {
    if (req.body.hasOwnProperty(elem)) hasUpdate = true;
  });
  if (hasUpdate) {
    // build query to update user
    let queryStr = 'UPDATE Users SET ';
    possibleFields.forEach((elem) => {
      if (req.body.hasOwnProperty(elem)) {
        if (req.body[elem].length === 0) {
          // if the new value is an empty string, set the database value to null
          queryStr += elem + '=NULL,';
        } else {
          queryStr += elem + '=\'' + req.body[elem] + '\',';
        }
      }
    });
    queryStr = queryStr.slice(0, -1);  // remove trailing comma
    queryStr += ' WHERE username=\'' + userStatus.username + '\';';
    // add a query for the update information
    queryStr += ' SELECT * FROM Users WHERE username=\'' + userStatus.username + '\';';
    // send the query to the database
    updateUserData(queryStr, oldUserData);
    return;
  }

  // check if the user's preferences were updated
  if (req.body.hasOwnProperty('preferences')) {
    const possibleColumns = ['wantsemails'];
    let queryStr = 'UPDATE Users SET ';
    possibleColumns.forEach((elem) => {
      let newColValue = (req.body.hasOwnProperty(elem)) ? 'TRUE' : 'FALSE';
      queryStr += elem + '=' + newColValue + ',';
    });
    queryStr = queryStr.slice(0, -1);  // remove trailing comma
    queryStr += ' WHERE username=\'' + userStatus.username + '\';';
    // add a query for the update information
    queryStr += ' SELECT * FROM Users WHERE username=\'' + userStatus.username + '\';';
    // send the query to the database
    updateUserData(queryStr, oldUserData);
    return;
  }

  // check if the password field was updated
  if (req.body.hasOwnProperty('new_pass')) {
    // todo: check if new_pass and confirm_new_pass match
    // hash the new password
    bcrypt.hash(req.body.new_pass, bcryptSaltRounds, (err, hash) => {
      if (err) {
        const renderedContent = renderToString(
          <AboutAccount userRow={oldUserData}
            errorMessage='A server error occurred, please try again or contact an administrator if the problem persists' />
        );
        let page = template.replace('<!-- CONTENT -->', renderedContent);
        page = page.replace('<!-- STYLESHEET -->', '/css/aboutAccount.css');
        page = page.replace('<!--SCRIPT-->', '<script src="/js/aboutAccount.js" defer></script>');
        res.status(500).send(page);
        return;
      }
      // If there is no error, build the query for the database
      let query = 'UPDATE Users SET passwd=\'' + hash + '\'';
      query += ' WHERE username=\'' + oldUserData.username + '\';';
      query += ' SELECT * FROM Users WHERE username=\'' + oldUserData.username + '\'';
      // send the query to the database
      updateUserData(query, oldUserData);
    });
  } else {
    // if no fields were updated, return the default aboutAccount page
    const renderedContent = renderToString(<AboutAccount userRow={oldUserData} />);
    let page = template.replace('<!-- CONTENT -->', renderedContent);
    page = page.replace('<!-- STYLESHEET -->', '/css/aboutAccount.css');
    page = page.replace('<!--SCRIPT-->', '<script src="/js/aboutAccount.js" defer></script>');
    res.status(200).send(page);
  }
});

// User login page
app.get('/login', async (req, res, next) => {
  let userStatus = userLoginStatus(req);
  if (userStatus.loggedIn === true) {
    sendGeneralError(
      res, 'Cannot Log In', 'You are already logged in', 403, userStatus
    );
    return;
  }
  let renderedContent = renderToString(<Login />);
  if (req.query.redirect !== undefined) {
    renderedContent = renderToString(<Login redirect={req.query.redirect} />);
  }
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/login.css');
  res.status(200).send(page);
});

// Handle user login submission
app.post('/login', async (req, res, next) => {
  // function to be called if the user's credentials are rejected
  function loginFailed () {
    let renderedContent = renderToString(<Login loginFailed />);
    if (req.body.redirect !== undefined) {
      renderedContent = renderToString(<Login loginFailed redirect={req.body.redirect} />);
    }
    let page = template.replace('<!-- CONTENT -->', renderedContent);
    page = page.replace('<!-- STYLESHEET -->', '/css/login.css');
    res.status(403).send(page);
  }

  let username = req.body.user;
  // todo: sanitize username
  // find user in database
  const userRes = await databasePool.query('SELECT * FROM Users WHERE username=$1', [username]).catch((err) => {
    console.error(err);
    sendGeneralError(res, '500 Error', 'A server error occurred, please try again', 500);
  });
  if (userRes['rows'].length > 0 && userRes['rows'][0].username === username) {
    // the user was found in the database, compare the passwords
    bcrypt.compare(req.body.pass, userRes['rows'][0]['passwd'],
      function (err, result) {
        if (err === undefined) { // no errors occurred
          if (result) { // login was successful
            req.session.user = username;
            req.session.isVerifier = userRes['rows'][0]['isverifier'];
            let redirectLocation = '/';
            if (req.body.redirect !== undefined) {
              redirectLocation = req.body.redirect;
            }
            res.redirect(redirectLocation);
          } else { // login failed
            loginFailed();
          }
        } else { // an error occurred
          sendGeneralError(res, '500 Error', 'A server error occurred, please try again', 500);
        }
      }
    );
  } else { // user does not exist
    loginFailed();
  }
});

// handle user logout
app.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (!err) { // no errors occurred
      res.redirect(302, '/');
    } else { // an error occurred while trying to logout
      res.redirect(302, '/?logoutFailed=true');
    }
  });
});

// Handle submission of pending data
app.post('/submit', async (req, res) => {
  const userStatus = userLoginStatus(req);
  const { table, referenceLink, id } = req.body;
  // Extract the redirect location if it exists
  let redirect = '/';
  if (req.body.hasOwnProperty('redirect')) redirect = req.body.redirect;
  // Create a copy of the post properties
  let updateChanges = Object.assign({}, req.body);
  delete updateChanges['table'];
  delete updateChanges['referenceLink'];
  delete updateChanges['id'];
  delete updateChanges['redirect'];
  // Check that the user is logged in
  if (userStatus.loggedIn) {
    // Check for the required fields
    for (const field of ['table', 'referenceLink', 'id']) {
      if (req.body[field] === undefined) {
        sendGeneralError(res, 'Missing Field', `Required field '${field}' is missing`, 400, userStatus);
        return;
      }
    }
    await addPendingData(table, userStatus['username'], referenceLink, id, updateChanges).catch((err) => {
      console.error(err);
      sendGeneralError(res, '500 Error', 'A server error occurred, please try again', 500, userStatus);
    });
    res.status(200).redirect(redirect);
  } else {
    sendGeneralError(res, 'Permission Denied', 'You must be logged in to suggest updates', 403, userStatus);
  }
});
// Generate Results page
app.get('/location', async (req, res, next) => {
  // Check that the latitude and longitude were passed
  const { lat, lng } = req.query;
  if (lat === undefined || lng === undefined) {
    res.redirect('/404');
    return;
  }

  const userData = userLoginStatus(req);

  // Get GIS identifiers for location
  const gisResponse = await gisLocationQuery(lat, lng).catch((err) => {
    console.error(err);
    sendGeneralError(res, '500 Error', 'A server error occurred, please try again', 500, userData);
  });
  if(gisResponse===undefined){
    return;
  }

  const locationList = await getLocationProps(gisResponse).catch((err) => {
    console.error(err);
    sendGeneralError(res,'500 Error','A server error occurred, please try again later',500,userData);
  });
  if(locationList===undefined){
    return;
  }

  let locationProps = {
    'user': userData,
    'levels': [
      { 'name': 'Federal', 'results': [] },
      { 'name': 'State', 'results': [] },
      { 'name': 'County', 'results': [] },
      { 'name': 'City', 'results': [] },
      { 'name': 'School', 'results': [] },
      { 'name': 'Local', 'results': [] },
      { 'name': 'Other', 'results': [] }
    ],
    'locations': [],
    'lat': lat,
    'lng': lng
  };

  // add reurned locations to the level arrays
  Array(locationList)[0].forEach((loc, i) => {
    // add the database location ot the locations array
    locationProps.locations.push({
      'name': loc.locationname,
      'id': loc.locationid
    });
    // add the result to the results array
    const levelInd = (locationProps.levels.length <= loc.levelnum) ? 6 : loc.levelnum;
    locationProps.levels[levelInd].results.push({
      'title': loc.officetitle,
      'name': loc.name,
      'id': loc.holderid
    });
  });

  // render the page
  const renderedContent = renderToString(React.createElement(Location, locationProps));
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/location.css');
  page = page.replace('<!--SCRIPT-->', '<script src="/js/location.js" defer></script>');
  return res.status(200).send(page);
});

app.get('/officeholder/:officeholderId', async (req, res, next) => {
  const userData = userLoginStatus(req);
  const { officeholderId } = req.params;
  let officeholderProps = await getOfficeholderData(officeholderId).catch((err) => {
    if (err.code === '22P02') {
      // catches the case where locationId is not an integer
      sendGeneralError(res, 'Not Found', 'Could not find the requested location in the database', 404, userData);
      return;
    }
    sendGeneralError(res, 'Server Error', 'A server error occurred, please try again', 500, userData);
  });
  // todo: check if getOfficeholderData failed
  if (officeholderProps === undefined || officeholderProps === null) {
    res.redirect('/404');
    return;
  }

  officeholderProps.user = userData;

  const renderedContent = renderToString(React.createElement(Officeholder, officeholderProps));
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/officeholder.css');
  res.status(200).send(page);
});

app.get('/search', (req, res, next) => {
  const address = req.query.q;
  if (!address) { // search query must be present for this endpoint or else we 404
    return res.redirect('/');
  }
  const geocodingConfig = config.geocoding;
  axios.get(geocodingConfig.apiUrl, {
    params: {
      address: address,
      key: geocodingConfig.apiKey
    }
  }).then((response) => {
    const results = response.data.results;
    if (results.length === 0) {
      return res.redirect('/404') // eventually we want to have this redirect to a separate 'no results found' page
    }
    const topResult = results[0];
    const { lat, lng } = topResult['geometry']['location'];
    res.redirect(`/location?lat=${lat}&lng=${lng}`);
  }).catch((error) => {
    console.error(error);
    const userStatus = userLoginStatus(req);
    sendGeneralError(res, '500 Error', 'A server error occurred, please try again', 500, userStatus);
  });
});

// 404 error handling
app.use((req, res, next) => {
  let userStatus = userLoginStatus(req);
  const renderedContent = renderToString(<Error404 user={userStatus} />);
  let page = template.replace('<!-- CONTENT -->', renderedContent);
  page = page.replace('<!-- STYLESHEET -->', '/css/404.css');
  res.status(404).send(page);
});

// Opens a socket and listens for connections only if there is no parent module running the script
if (!module.parent) {
  app.listen(config.server.port, config.server.address, () => {
    console.log(`Server started on port ${config.server.port} at address ${config.server.address}...`);
  });
}

export default app;
