import React from 'react'
import Title from './title'

export default function AboutUs (props) {
  let loggedIn = (props.logged_in !== undefined) ? props.logged_in : false
  let isVerifier = (props.is_verifier !== undefined) ? props.is_verifier : false
  return (
    <div id='app'>
      <Title logged_in={loggedIn} is_verifier={isVerifier} />
      <div id='mainColumn'>
        <div id='sectionHeader'>About Us</div>
        <p>
          This project was started with an OSU Capstone Project for CS 461. The inital developers
          were Davic Kalcic, Owen Haggerty, and Matt Kerr. The Project Managers were Emily
          Fowler, Chris Styles, and Jim Cupples of Terrapin Data, Inc.
        </p>
        <p>
          We developed this tool because we felt that information that pertained to vital civic
          engagement was too scattered, and that the hard work of data collection and
          standardization was being duplicated for civic tech projects.
        </p>
        <p>
          Questions? Comments? You can reach us at info@nodeproject.org
        </p>
      </div>
    </div>
  )
}
