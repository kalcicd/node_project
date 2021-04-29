import React from 'react'
import Title from './title'
import SearchBar from './searchBar'
import SubmissionPopup from './submissionPopup'

/**
 * Template of the Officeholder information page. Displays officeTitle, officeholderName, termStart, termEnd,
 * nextElectionDate, phone, email, and meetings from the props object.
 * @param {Object} props
 */
export default function Officeholder (props) {
  let officeSections = [];
  for(let i=0; i<props.offices.length; i++){
    officeSections.push(<Office officeInfo={props.offices[i]} key={"office"+i} />);
  }
  //set target for submission button depending on whether the user is logged in
  let buttonTarget = "login";
  if(props.user !== undefined && props.user.loggedIn === true){
    buttonTarget = "popup";
  }
  return (
    <div id='app'>
      <Title user={props.user} />
      <div id='mainColumn'>
        <SearchBar />
        <div className='pageHeader'>
          <h2>{props.officeholderName}'s Information:</h2>
        </div>
        <div id='officeholderInfo'>
          {officeSections}
          <InfoRow header="Phone Contact" body={props.phone} />
          <InfoRow header="Email Contact" body={props.email} />
          <InfoRow header="Meetings" body={props.meetings} />
        </div>
        <div className='reportButtonWrapper'>
          <button className='reportButton submissionButton' data-target={buttonTarget}>
            Any information incorrect? Submit an info update request here.
          </button>
        </div>
        <div id='mapContent'>
          <h3 id='mapTitle'>District Map</h3>
          <img src='/icons/mapsEmbed.png' id='mapsPhoto' />
        </div>
      </div>
      <SubmissionPopup page='officeholder' currentValues={props} user={props.user}/>
    </div>
  )
}

export function InfoRow(props){
  if(props.header===undefined || props.body===undefined){
    return null;
  }
  else if(props.header===null || props.body===null){
    return null;
  }
  return(
    <div className='infoWrapper'>
      <h3 className='infoHeader'>{props.header}</h3>
      <div className='infoDiv'>{props.body}</div>
    </div>
  )
}

export function Office(props){
  const officeInfo = props.officeInfo;

  let termEndRow = null;
  if(officeInfo.termEnd!==undefined && officeInfo.termEnd!==null){
    termEndRow = <div className='officeRow'>Current term ends on {officeInfo.termEnd}</div>;
  }
  return(
    <div className='officeWrapper'>
      <h3 className='officeHeader'>{officeInfo.officeTitle}</h3>
      <div className='officeRow'>Current term started on {officeInfo.termStart}</div>
      {termEndRow}
    </div>
  )
}
