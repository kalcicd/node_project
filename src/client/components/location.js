import React from 'react'
import Title from './title'

export default function Location (props) {
  let logged_in = (props.logged_in!=undefined)?props.logged_in:false;
  let isVerifier = (props.isVerifier!=undefined)?props.isVerifier:false;
  return (
    <div id="app">
      <Title logged_in={logged_in} isVerifier={isVerifier}/>
      <div id="mainColumn">
        <div id="searchBarWrapper">
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
          <img src='/icons/mapsEmbed.png' id='mapsPhoto' />
        </div>
      </div>
      <div id='locationResults'>
        <h3>Federal</h3>
        <ul>
          <li>President: Donald Trump</li>
        </ul>
        <h3>State</h3>
        <ul>
          <li>Governor: Kate Brown</li>
        </ul>
        <h3>County</h3>
        <ul>
          <li>County Commissioner: Joe Berney</li>
        </ul>
        <h3>City</h3>
        <ul>
          <li>Mayor: Biff Traber</li>
        </ul>
        <h3>School</h3>
        <ul>
          <li>Superintendent: Ryan Noss</li>
        </ul>
        <h3>Local</h3>
        <ul>
          <li>Utility Board Member: Jane Doe</li>
        </ul>
      </div>
    </div>
  )
}
