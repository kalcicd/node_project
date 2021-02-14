import React from 'react'
import Title from './title'

export default function Error404 (props) {
  let logged_in = (props.logged_in!=undefined)?props.logged_in:false;
  let is_verifier = (props.is_verifier!=undefined)?props.is_verifier:false;
  return (
    <div id="app">
      <Title logged_in={logged_in} is_verifier={is_verifier}/>
      <div id="mainColumn">
        <div id="errorBox">
          <div id="errorTitle">404 Error</div>
          <div id="errorMessage">
            The requested page could not be found
          </div>
        </div>
      </div>
    </div>
  )
}
