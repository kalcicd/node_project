import React from 'react'
import Title from './title'

export default function Index (props) {
  let logged_in = (props.logged_in!=undefined)?props.logged_in:false;
  let is_verifier = (props.is_verifier!=undefined)?props.is_verifier:false;
  return (
    <div id="app">
      <Title logged_in={logged_in} is_verifier={is_verifier}/>
      <div id="mainColumn">
        <div id="searchBarWrapper">
          <a href='/location'>
            <img src="/icons/search.svg" id="searchIcon"/>
          </a>
          <input type="text" id="searchBar" className="flexGrow"
            placeholder="Enter address for officeholders, contact information, and meetings">
          </input>
        </div>
        <div id="descriptionText">
          <p>
            Welcome to the NODE Project - a place to find information about your elected officials and
            when/where they meet.
          </p>
          <p>
            This project was started at Oregon State University but depends upon crowd sources from
            throughout the United States to help add and maintain the data so that they are as
            accurate as possible.
          </p>
          <p>
            NODE stands for National Open Database for Elections. All of the data you will find on
            this site is open data and available for developers to build upon with their own tools.
            The data is available under the terms of the MIT License.
          </p>
        </div>
      </div>
    </div>
  )
}
