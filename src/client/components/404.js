import React from 'react'
import Title from './title'

export default function Error404 (props) {
  let loggedIn = (props.logged_in !== undefined) ? props.logged_in : false
  let isVerifier = (props.is_verifier !== undefined) ? props.is_verifier : false
  return (
    <div id='app'>
      <Title logged_in={loggedIn} is_verifier={isVerifier} />
      <div id='mainColumn'>
        <div id='errorBox'>
          <div id='errorTitle'>404 Error</div>
          <div id='errorMessage'>
            The requested page could not be found
          </div>
        </div>
      </div>
    </div>
  )
}
