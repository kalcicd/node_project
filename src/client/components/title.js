import React from 'react'

export default function Title (props) {
  let logged_in = (props.logged_in!=undefined)?props.logged_in:false;
  let isVerifier = (props.isVerifier!=undefined)?props.isVerifier:false;
  return (
    <div id='titleAndHeaderBar'>
      <div id='titleBar'>
        <button id="menuButton" className="desktopHidden">&#8801;</button>
        <a id='title' href='/'>NODE Project</a>
      </div>
      <div className="flexGrow" />
      <HeaderBar logged_in={logged_in} isVerifier={isVerifier}/>
    </div>
  )
}

export function HeaderBar (props) {
  const titleLinks = [
    {'name':'About Us', 'url':'/about'},
    {'name':'Developers', 'url':'/developers'}
  ]
  //check if the user is logged in and if they are a verifier
  if(props.hasOwnProperty("logged_in") && props.logged_in===true){
    if(props.hasOwnProperty("isVerifier") && props.isVerifier===true){
	   titleLinks.push({'name':"Verify Submissions",'url':"/verify"});
    }
    titleLinks.push({'name':"Log Out",'url':"/logout"});
  }
  else{
    titleLinks.push({'name':"Create Account",'url':"/newAccount"});
  	 titleLinks.push({'name':"Log In",'url':"/login"});
  }
  const titleElems = []
  titleLinks.forEach((link, i) => {
    titleElems.push(<a href={link['url']} className='headerLink' key={i}>{link['name']}</a>)
  })
  return (
    <div id='headerBar' className="mobileHidden">{titleElems}</div>
  )
}
