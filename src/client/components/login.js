import React from 'react'
import Title from './title'

export default class Login extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render(){
    let message = <div></div>;
    if(this.props.loginFailed!==undefined && this.props.loginFailed===true){
      message = <div id="loginErrorMessage">Username or password was incorrect</div>;
	 }
    return(
      <div id="app">
        <Title/>
        <div id="mainColumn">
          <h2 className="pageHeader">Log In</h2>
		      {message}
          <form id="userLoginForm" method="POST" action="/login">
            <label className="formLabel">
              Username
              <input type='text' name='user' />
            </label>
            <label className='formLabel'>
              Password
              <input type='password' name='pass' />
            </label>
            <button type='submit' id='loginButton'>
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }
}
