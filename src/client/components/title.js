import React from 'react'

export default function Title (props) {
  return (
    <div id="titleAndHeaderBar">
      <div id="titleBar">
        <a id="title" href="/">NODE Project</a>
      </div>
      <div className="flexGrow"></div>
      <HeaderBar/>
    </div>
  )
}

export function HeaderBar (props) {
  const titleLinks = [
    ['About Us', '/about'],
    ['Volunteer', '/volunteer'],
    ['Developers', '/developers']
  ]
  if(true || props.hasOwnProperty("logged_in") && props.logged_in==true){
    if(true || props.hasOwnProperty("is_verifier") && props.is_verifier==true){
	   titleLinks.push(["Verify Submissions","/verify"]);
    }
    //titleLinks.push(["",""]);
  }
  else{
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
