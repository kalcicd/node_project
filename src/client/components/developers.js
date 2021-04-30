import React from 'react'
import Title from './title'

export default function Developers (props) {
  return (
    <div id='app'>
      <Title user={props.user} />
      <div id='mainColumn'>
        <h2 className='pageHeader'>Developers</h2>
        <p className='mainColumnText'>
          Interested in using our data for your own awesome civic tech project? Awesome! All of our
          data is available under the open source MIT License -<span />
          <a href='https://mit-license.org/'>
            details to be found here
          </a>
        </p>
        <form action='/download' method='GET' id='downloadForm'>
          <div className='selectLabel'>State</div>
          <StateSelect class='formSelect' />
          <div className='selectLabel'>Layer of Government</div>
          <LevelSelect class='formSelect' />
          <div className='selectLabel'>Shapefiles Included</div>
          <ShapefileSelect class='formSelect' />
          <button type='submit' id='submitButton'>Submit</button>
        </form>
      </div>
    </div>
  )
}

export function StateSelect (props) {
  const states = ['Oregon']
  const options = []
  states.forEach((elem, i) => {
    options.push(<option value={elem.toLowerCase()} key={i}>{elem}</option>)
  })
  return (
    <select className={props.class} name='state'>{options}</select>
  )
}

export function LevelSelect (props) {
  const levels = ['State', 'County', 'City']
  const options = []
  levels.forEach((elem, i) => {
    options.push(<option value={elem.toLowerCase()} key={i}>{elem}</option>)
  })
  return (
    <select className={props.class} name='level'>{options}</select>
  )
}

export function ShapefileSelect (props) {
  const shapefiles = ['No', 'Yes']
  const options = []
  shapefiles.forEach((elem, i) => {
    options.push(<option value={elem.toLowerCase()} key={i}>{elem}</option>)
  })
  return (
    <select className={props.class} name='shapefiles'>{options}</select>
  )
}
