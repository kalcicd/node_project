import React from 'react'
import Title from './title'
import SearchBar from './searchBar'

/**
 * Template of the Officeholder information page. Displays officeTitle, officeholderName, termStart, termEnd,
 * nextElectionDate, phone, email, and meetings from the props object.
 * @param {Object} props
 */
export default function Officeholder (props) {
  return (
    <div id='app'>
      <Title user={props.user} />
      <div id='mainColumn'>
        <SearchBar />
        <div className='pageHeader'>
          <h2>{props.officeTitle} {props.officeholderName}'s Information:</h2>
        </div>
        <div id='officeholderInfo'>
          <h3 className='infoHeader'>Term</h3>
          <div className='infoDiv'>{props.termStart} - {props.termEnd}</div>

          <h3 className='infoHeader'>Next Election Date</h3>
          <div className='infoDiv'>{props.nextElectionDate}</div>

          <h3 className='infoHeader'>Phone Contact</h3>
          <div className='infoDiv'>{props.phone}</div>

          <h3 className='infoHeader'>Email Contact</h3>
          <div className='infoDiv'>{props.email}</div>
          
          <h3 className='infoHeader'>Meetings</h3>
          <div className='infoDiv'>{props.meetings}</div>
        </div>
        <div className='reportButtonWrapper'>
          <button className='reportButton'>
            Any information incorrect? Submit an info update request here.
          </button>
        </div>
        <div id='mapContent'>
          <h3 id='mapTitle'>District Map</h3>
          <img src='/icons/mapsEmbed.png' id='mapsPhoto' />
        </div>
        <div className='reportButtonWrapper'>
          <button className='reportButton'>
            Map information incorrect? Submit an info update request here.
          </button>
        </div>
      </div>
    </div>
  )
}
