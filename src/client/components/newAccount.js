import React from 'react'
import Title from './title'

export default class NewAccount extends React.Component{
  constructor(props){
    super(props);
    this.props = props;
  }

  render(){
    /* This component does not check if the user is logged in since logged in users should not
    be able to access this page */
    let stateAbbr = ["AL","AK","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WI","WV","WY"];
    let stateList = [];
    for(let i=0; i<stateAbbr.length; i++){
      stateList.push(<option value={stateAbbr[i]} key={"state"+i}>{stateAbbr[i]}</option>);
    }
    return(
      <div id="app">
        <Title />
        <div id="mainColumn">
          <h2 id="header">Create Account</h2>
          <div id="headerMessage">
            Fields highlighted in <span className="required">blue</span> are required
          </div>
          <form method="POST" action="/newAccount" id="newAccountForm">
            <div className="formRow">
              <label className="formLabel">
                First Name
                <input className="formTextInput" type="text" name="firstName" required></input>
              </label>
            </div>
            <div className="formRow">
              <label className="formLabel">
                Last Name
                <input className="formTextInput" type="text" name="lastName"></input>
              </label>
            </div>
            <div className="formRow">
              <label className="formLabel">
                Email
                <input className="formTextInput" type="email" name="email" required></input>
              </label>
            </div>
            <div className="formRow">
              <label className="formLabel">
                Phone Number
                <input className="formPhoneInput" type="phone" name="phone"></input>
              </label>
            </div>
            <div className="formRow">
              <label className="formLabel">
                Address Line 1
                <input className="formTextInput" type="text" name="address"></input>
              </label>
            </div>
            <div className="formRow">
              <label className="formLabel">
                Address Line 2
                <input className="formTextInput" type="text" name="address2"></input>
              </label>
            </div>
            <div className="formRow">
              <label className="formLabel">
                City
                <input className="formTextInput" type="text" name="city"></input>
              </label>
            </div>
            <div className="formRow">
              <label className="formLabel">
                State
                <select className="formSelect" name="State">
                  {stateList}
                </select>
              </label>
              <label className="formLabel">
                Zip Code
                <input className="formNumberInput" type="number" name="zip"></input>
              </label>
            </div>
            <div className="formRow">
              <label className="formLabel">
                Password
                <input className="formPasswordInput" type="password" name="pass" required></input>
              </label>
            </div>
            <div className="formRow">
              <label className="formLabel">
                Confirm Password
                <input className="formPasswordInput" type="password" name="pass2" required></input>
              </label>
            </div>
            <div className="formRow">
              <button type="submit" className="formButton">Create Account</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
