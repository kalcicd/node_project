import React from 'react'
import Title from './title'

export default function Officeholder (props) {
  return (
    <div id='app'>
      <Title/>
      <div id='mainColumn'>
        <div id='searchBarWrapper'>
          <a href='/location'>
            <img src='/icons/search.svg' id='searchIcon'/>
          </a>
          <input
            type='text' id='searchBar'
            className='flexGrow'
            placeholder='Enter address for officeholders, contact information, and meetings'/>
        </div>
        <div id='resultsTitle'>
          <h2>{props.officeTitle} {props.officeholderName}'s Information:</h2>
        </div>
      </div>
      <div id='officeholderInfo'>
        <h3>Term</h3>
        <ul>
          <li>{props.termStart} - {props.termEnd}</li>
        </ul>
        <h3>Next Election Date</h3>
        <ul>
          <li>{props.nextElectionDate}</li>
        </ul>
        <h3>Phone Contact</h3>
        <ul>
          <li>{props.phone}</li>
        </ul>
        <h3>Email Contact</h3>
        <ul>
          <li>{props.email}</li>
        </ul>
        <h3>Meetings</h3>
        <ul>
          <li>{props.meetings}</li>
        </ul>
      </div>
      <div id='reportButton'>
        <button>Any information incorrect? Submit an info update request here.</button>
      </div>
      <div id='mapContent'>
        <div id='resultsTitle'>
          <h2>District Map</h2>
        </div>
        <img src='/icons/mapsEmbed.png' id='mapsPhoto'/>
      </div>
      <div id='reportButton'>
        <button>Map information incorrect? Submit an info update request here.</button>
      </div>
    </div>
  )
}
