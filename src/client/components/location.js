import React from 'react'
import Title from './title'
import SearchBar from './searchBar'
import SubmissionPopup from './submissionPopup'
import { mapsStatic } from '../../../config/default.json'

export default function Location (props) {
  const mapUrl = `${mapsStatic.apiUrl}?center=${props.lat},${props.lng}&zoom=14&size=960x540&key=${mapsStatic.apiKey}`

  let levels = props.levels;
  let results = [];
  levels.forEach((level,i)=>{
    results.push(<LocationLevel level={level.name} levelResults={level.results} key={i} />);
  });

  let submissionButtonTarget = "popup";
  if(props.user !== undefined && props.user.loggedIn !== true){
    submissionButtonTarget = "login";
  }
  const redirect = "/location?lat="+props.lat+"&lng="+props.lng;

  let propsWithLevels = {'levels':levels};
  Object.assign(propsWithLevels,props);
  return (
    <div id='app'>
      <Title user={props.user} />
      <div id='mainColumn'>
        <SearchBar />
        <h2 className="pageHeader">Here Are the Results We Found in Your Area:</h2>
        <div id='mapContent'>
          <img src={mapUrl} id='mapsPhoto' />
        </div>
        <div id='locationResults'>
          {results}
        </div>
        <button className='submissionButton' data-target={submissionButtonTarget}>
          Missing information? Click here to suggest an update
        </button>
        <SubmissionPopup page='location' currentValues={propsWithLevels}
          user={props.user} redirect={redirect} />
      </div>
    </div>
  )
}

export class LocationLevel extends React.Component{
  /* Renders the results for a single level of government (federal,state,etc.)*/
  constructor(props){
    super(props);
    this.props = props;
  }

  render(){
    let headerKey = this.props.level + "Header";
    let headerText = this.props.level.charAt(0).toUpperCase() + this.props.level.slice(1);
    let bodyId = this.props.level + "Results";
    // create the list of results
    let results = [];
    this.props.levelResults.forEach((loc)=>{
      let officeHolderLink = <span>Not currently occupied</span>;
      if(loc.name!==null){
        officeHolderLink = <a href={'/officeholder/'+loc.id}>{loc.name}</a>;
      }
      results.push(
        <li key={loc.id} className='resultItem'>
          {loc.title}: {officeHolderLink}
        </li>
      );
    });
    // check if there are no results for a certain level
    if(this.props.levelResults.length===0){
      results.push(
        <li key="message" className='resultItem noDataMessage'>
          There are no offices in the database at this level for the location
        </li>
      );
    }
    return(
      <div className='levelWrapper' key={this.props.level}>
        <button className='headerCollapseButton' data-target={bodyId}>
          <h3 className='levelHeader'>{headerText}</h3>
          <div className='headerSpacer' />
          <svg viewBox='0,0,100,100' className='collapsedImage'>
            <polygon points="0,0 100,50 0,100" />
          </svg>
          <svg viewBox='0,0,100,100' className='expandedImage'>
            <polygon points="0,0 100,0 50,100" />
          </svg>
        </button>
        <ul id={bodyId} className='levelResults'>
          {results}
        </ul>
      </div>
    );
  }
}
