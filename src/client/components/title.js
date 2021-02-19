import React from 'react'

export default function Title (props) {
  let logged_in = (props.logged_in!=undefined)?props.logged_in:false;
  let isVerifier = (props.isVerifier!=undefined)?props.isVerifier:false;
  return (
    <div id="titleAndHeaderBar">
      <div id="titleBar">
        <a id="title" href="/">NODE Project</a>
      </div>
      <div className="flexGrow"></div>
      <HeaderBar logged_in={logged_in} isVerifier={isVerifier}/>
    </div>
  )
}

export function HeaderBar (props) {
  const titleLinks = [
    ['About Us', '/about'],
    ['Volunteer', '/volunteer'],
    ['Developers', '/developers']
  ]
  //check if the user is logged in and if they are a verifier
  if(props.hasOwnProperty("logged_in") && props.logged_in===true){
    if(props.hasOwnProperty("isVerifier") && props.isVerifier===true){
	   titleLinks.push(["Verify Submissions","/verify"]);
    }
    titleLinks.push(["Log Out","/logout"]);
  }
  else{
    titleLinks.push(["Create Account","/newAccount"]);
  	 titleLinks.push(["Log In","/login"]);
  }
  const titleElems = []
  titleLinks.forEach((link, i) => {
    titleElems.push(<a href={link[1]} className="headerLink" key={i}>{link[0]}</a>)
  })
  return (
    <div id="headerBar">{titleElems}</div>
  )
}
