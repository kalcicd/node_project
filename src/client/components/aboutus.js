import React from 'react'
import Title from './title'

export default function AboutUs (props) {
  return (
    <div id="app">
      <Title user={props.user}/>
      <div id="mainColumn">
        <h2 className="pageHeader">About Us</h2>
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
          Questions? Comments? You can reach us at
			 <a href="mailto:info@nodeproject.org"> info@nodeproject.org</a>
        </p>
      </div>
    </div>
  )
}
