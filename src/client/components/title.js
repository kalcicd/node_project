import React from 'react'

export default function Title (props) {
  let user = (props.user !== undefined) ? props.user : {'loggedIn': false, 'isVerifier': false}
  return (
    <div id='titleAndHeaderBar'>
      <div id='titleBar'>
        <button id='menuButton' className='desktopHidden'>&#8801;</button>
        <a id='title' href='/'>NODE Project</a>
      </div>
      <div className='flexGrow' />
      <HeaderBar user={user} />
    </div>
  )
}

export function HeaderBar (props) {
  const titleLinks = [
    {'name': 'About Us', 'url': '/about'},
    {'name': 'Developers', 'url': '/developers'}
  ]
  // check if the user is logged in and if they are a verifier
  if (props.user.loggedIn === true) {
    if (props.user.isVerifier === true) {
      titleLinks.push({'name': 'Verify Submissions', 'url': '/verify'})
    }
    titleLinks.push({
      'name': props.user.username,
      'dropdown': [
        {'name': 'Account Information', 'url': '/aboutme'},
        {'name': 'Log Out', 'url': '/logout'}
      ]
    })
  } else {
    titleLinks.push({'name': 'Create Account', 'url': '/newAccount'})
    titleLinks.push({'name': 'Log In', 'url': '/login'})
  }
  const titleElems = []
  titleLinks.forEach((link, i) => {
    titleElems.push(<HeaderLink link={link} key={i} />)
  })
  return (
    <div id='headerBar' className='mobileHidden'>{titleElems}</div>
  )
}

export function HeaderLink (props) {
  if (props.link === undefined) {
    return null // return nothing if no data was passed
  }
  if (props.link.dropdown !== undefined) {
    let dropdownOptions = []
    props.link.dropdown.forEach((option, i) => {
      dropdownOptions.push(<HeaderLink link={option} key={i} />)
    })
    return (
      <div className='headerDropdown'>
        <div className='headerDropdownTitle'>{props.link.name}</div>
        <div className='headerDropdownOptions'>
          {dropdownOptions}
        </div>
      </div>
    )
  }
  return (
    <a href={props.link.url} className='headerLink'>{props.link.name}</a>
  )
}
