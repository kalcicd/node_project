import React from 'react'
import Title from './title'

export default function GeneralError (props) {
  let errorHeader = (props.errorHeader !== undefined) ? props.errorHeader : 'Error'
  let errorMessage = (props.errorMessage !== undefined) ? props.errorMessage : 'An error occurred'
  return (
    <div id='app'>
      <Title user={props.user} />
      <div id='mainColumn'>
        <h2 style={{fontSize: '1.5rem', textAlign: 'center'}}>{errorHeader}</h2>
        <div style={{fontSize: '1.2rem', textAlign: 'center'}}>
          {errorMessage}
        </div>
      </div>
    </div>
  )
}
