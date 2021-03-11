import React from 'react'
import Title from './title'
import SearchBar from './searchBar'

/**
 * Template of the Officeholder information page. Displays officeTitle, officeholderName, termStart, termEnd,
 * nextElectionDate, phone, email, and meetings from the props object.
 * @param {Object} props
 */
export default function Officeholder (props) {
  let term = `${props.termStart} - ${props.termEnd}`
  for (const propName in props) {
    if (props[propName] === null && (propName === 'termStart' || propName === 'termEnd')) {
      term = null
    }
  }

  return (
    <div id='app'>
      <Title />
      <div id='mainColumn'>
        <SearchBar />
        <div className='pageHeader'>
          <h2>{props.officeTitle} {props.officeholderName}'s Information:</h2>
        </div>
        <div id='officeholderInfo'>
          <OfficeholderProperty title={'Term'} value={term} />
          <OfficeholderProperty title={'Next Election Date'} value={props.nextElectionDate} />
          <OfficeholderProperty title={'Phone Contact'} value={props.phone} />
          <OfficeholderProperty title={'Email Contact'} value={props.email} />
          <OfficeholderProperty title={'Meetings'} value={props.meetings} />
          <div id='mapContent'>
            <h3 className='infoHeader'>District Map</h3>
            <img src='/icons/mapsEmbed.png' id='mapsPhoto' />
          </div>
        </div>
      </div>
    </div>
  )
}

export class OfficeholderProperty extends React.Component {
  constructor (props) {
    super(props)
    this.submitReport = this.submitReport.bind(this)
  }
  submitReport () {
    console.log('boop.')
  }
  render () {
    const isUnavailable = (this.props.value === null)
    const value = (isUnavailable) ? 'Data Unavailable' : this.props.value
    return (
      <div id='officeholderProperty'>
        <h3 className='infoHeader'>{this.props.title}</h3>
        <button className='reportButton' onClick={this.submitReport}>Incorrect or Unavailable?</button>
        <div className='infoDiv'>{value}</div>
      </div>
    )
  }
}
