import React from 'react'
import Title from './title'
import SearchBar from './searchBar'
import { mapsStatic } from '../../../config/default.json'

export default function Location (props) {
  let loggedIn = (props.logged_in !== undefined) ? props.logged_in : false
  let isVerifier = (props.isVerifier !== undefined) ? props.isVerifier : false
  const mapUrl = `${mapsStatic.apiUrl}?center=${props.lat},${props.lng}&zoom=14&size=960x540&key=${mapsStatic.apiKey}`

  let levels = ['federal','state','county','city','school','local','other'];
  let results = [];
  levels.forEach((level)=>{
    results.push(<LocationLevel level={level} levelResults={props[level]} />);
  });
  return (
    <div id='app'>
      <Title logged_in={loggedIn} isVerifier={isVerifier} />
      <div id='mainColumn'>
        <SearchBar />
        <h2 className="pageHeader">Here Are the Results We Found in Your Area:</h2>
        <div id='mapContent'>
          <img src={mapUrl} id='mapsPhoto' />
        </div>
        <div id='locationResults'>
          {results}
        </div>
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
    let results = [];
    this.props.levelResults.map((loc)=>{
      results.push(
        <li key={loc.id} className='resultItem'>
          {loc.title}: <a href={loc.id}>{loc.name}</a>
        </li>
      );
    });
    if(this.props.levelResults.length===0){
      results.push(
        <li key="message" className='resultItem noDataMessage'>
          There are no elections in the database at this level for your location
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
