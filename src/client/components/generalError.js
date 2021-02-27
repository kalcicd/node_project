import React from 'react'
import Title from './title'

export default function GeneralError(props){
  let logged_in = (props.logged_in !== undefined) ? props.logged_in : false;
  let isVerifier = (props.isVerifier !== undefined) ? props.isVerifier : false;

  let errorHeader = (props.errorHeader !== undefined) ? props.errorHeader : "Error";
  let errorMessage = (props.errorMessage !== undefined) ?props.errorMessage : "An error occurred";
  return (
    <div id="app">
      <Title logged_in={logged_in} isVerifier={isVerifier} />
      <div id='mainColumn'>
        <h2 style={{fontSize:"1.5rem",textAlign:"center"}}>{errorHeader}</h2>
        <div style={{fontSize:"1.2rem",textAlign:"center"}}>
          {errorMessage}
        </div>
      </div>
    </div>
  );
}
