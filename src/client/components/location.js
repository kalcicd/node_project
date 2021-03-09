import React from 'react'
import Title from './title'
import { mapsStatic } from '../../../config/default.json'

export default function Location (props) {
  let loggedIn = (props.logged_in !== undefined) ? props.logged_in : false
  let isVerifier = (props.isVerifier !== undefined) ? props.isVerifier : false
  const mapUrl = `${mapsStatic.apiUrl}?center=${props.lat},${props.lng}&zoom=14&size=960x540&key=${mapsStatic.apiKey}`
  return (
    <div id='app'>
      <Title logged_in={loggedIn} isVerifier={isVerifier} />
      <div id='mainColumn'>
        <div id='searchBarWrapper'>
          <a href='/location'>
            <img src='/icons/search.svg' id='searchIcon' />
          </a>
          <input
            type='text' id='searchBar'
            className='flexGrow'
            placeholder='Enter address for officeholders, contact information, and meetings' />
        </div>
        <div id='resultsTitle'>
          <h2>Here Are the Results We Found in Your Area:</h2>
        </div>
        <div id='mapContent'>
          <img src={mapUrl} id='mapsPhoto' />
        </div>
      </div>
      <div id='locationResults'>
        <h3>Federal</h3>
        <ul>
          {
            props.federal.map(loc =>
              <li key={loc.id}>
                {loc.title}: <a href={loc.id}>{loc.name}</a>
              </li>
            )
          }
        </ul>
        <h3>State</h3>
        <ul>
          {
            props.state.map(loc =>
              <li key={loc.id}>
                {loc.title}: <a href={loc.id}>{loc.name}</a>
              </li>
            )
          }
        </ul>
        <h3>County</h3>
        <ul>
          {
            props.county.map(loc =>
              <li key={loc.id}>
                {loc.title}: <a href={loc.id}>{loc.name}</a>
              </li>
            )
          }
        </ul>
        <h3>City</h3>
        <ul>
          {
            props.city.map(loc =>
              <li key={loc.id}>
                {loc.title}: <a href={loc.id}>{loc.name}</a>
              </li>
            )
          }
        </ul>
        <h3>School</h3>
        <ul>
          {
            props.school.map(loc =>
              <li key={loc.id}>
                {loc.title}: <a href={loc.id}>{loc.name}</a>
              </li>
            )
          }
        </ul>
        <h3>Local</h3>
        <ul>
          {
            props.local.map(loc =>
              <li key={loc.id}>
                {loc.title}: <a href={loc.id}>{loc.name}</a>
              </li>
            )
          }
        </ul>
        <h3>Other</h3>
        <ul>
          {
            props.other.map(loc =>
              <li key={loc.id}>
                {loc.title}: <a href={loc.id}>{loc.name}</a>
              </li>
            )
          }
        </ul>
      </div>
    </div>
  )
}
