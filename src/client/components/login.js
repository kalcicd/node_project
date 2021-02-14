import React from 'react'
import Title from './title'

export default class Login extends React.Component{
  constructor(props){
    super(props);
    this.props = props;
  }

  render(){
    return(
      <div id="app">
        <Title/>
        <div id="mainColumn">
          <form id="userLoginForm" method="POST" action="/login">
            <label className="formLabel">
              Username
              <input type="text" name="user"></input>
            </label>
            <label className="formLabel">
              Password
              <input type="password" name="pass"></input>
            </label>
            <button type="submit" id="loginButton">
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }
}
