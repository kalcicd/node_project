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
import Officeholder from '../client/components/officeholder'

import config from '../../config/default.json'

const pathToTemplate = path.join(__dirname, './views/layout.html')
const template = fs.readFileSync(pathToTemplate, 'utf8')

const app = express()

app.use(express.static('./src/server/public'))

app.get('/', (req, res, next) => {
  const renderedContent = renderToString(<Index />)
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/index.css')
  res.status(200).send(page)
})
app.get('/about', (req, res, next) => {
  const renderedContent = renderToString(<AboutUs />)
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/aboutus.css')
  res.status(200).send(page)
})
app.get('/volunteer', (req, res, next) => {
  const renderedContent = renderToString(<Volunteer />)
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/volunteer.css')
  res.status(200).send(page)
})
app.get('/developers', (req, res, next) => {
  const renderedContent = renderToString(<Developers />)
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/developers.css')
  res.status(200).send(page)
})

// Generate Results page
app.get('/location', (req, res, next) => {
  const { lat, lon } = req.query
  const renderedContent = renderToString(React.createElement(Location, {lat, lon}))
  let page = template.replace('<!-- CONTENT -->', renderedContent)
  page = page.replace('<!-- STYLESHEET -->', '/css/location.css')
  res.status(200).send(page)
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
    res.redirect('/404')
  }
  const geocodingConfig = config.geocoding
  axios.get(geocodingConfig.apiUrl, {
    params: {
      address: address,
      key: geocodingConfig.apiKey
    }
  }).then((response) => {
    const topResult = response.data.results[0]
    const { lat, lng } = topResult['geometry']['location']
    console.log('lat: ', lat)
    console.log('lng: ', lng)
    res.status(200).send()
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
