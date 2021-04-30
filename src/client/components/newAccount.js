import React from 'react'
import Title from './title'

const stateAbbr = ['AL', 'AK', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WI', 'WV', 'WY']

export default class NewAccount extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render () {
    /* This component does not check if the user is logged in since logged in users should not
    be able to access this page */
    let stateList = []
    for (let i = 0; i < stateAbbr.length; i++) {
      stateList.push(<option value={stateAbbr[i]} key={'state' + i}>{stateAbbr[i]}</option>)
    }
    // check for errors to show
    let headerError = ''
    if (this.props.hasError === true && this.props.errorReason !== undefined) {
      headerError = <div id='headerError'>
        Error: {this.props.errorReason}
      </div>
    }
    return (
      <div id='app'>
        <Title />
        <div id='mainColumn'>
          <h2 className='pageHeader'>Create Account</h2>
          {headerError}
          <div id='headerMessage'>
            Fields <span className='required'>highlighted in blue</span> are required
          </div>
          <form method='POST' action='/newAccount' id='newAccountForm'>
            <div className='formRow'>
              <label className='formLabel'>
                Username
                <input className='formTextInput' type='text' name='username' maxLength='50' required />
              </label>
            </div>
            <div className='formRow'>
              <label className='formLabel'>
                Name
                <input className='formTextInput' type='text' name='name' maxLength='300' />
              </label>
            </div>
            <div className='formRow'>
              <label className='formLabel'>
                Email
                <input className='formTextInput' type='email' name='email' maxLength='' required />
              </label>
            </div>
            <div className='formRow'>
              <label className='formLabel'>
                Phone Number
                <input className='formPhoneInput' type='tel' name='phone' />
              </label>
            </div>
            <div className='formRow'>
              <label className='formLabel'>
                Address Line 1
                <input className='formTextInput' type='text' name='address' maxLength='150' />
              </label>
            </div>
            <div className='formRow'>
              <label className='formLabel'>
                Address Line 2
                <input className='formTextInput' type='text' name='address2' maxLength='150' />
              </label>
            </div>
            <div className='formRow'>
              <label className='formLabel'>
                City
                <input className='formTextInput' type='text' name='city' maxLength='75' />
              </label>
            </div>
            <div className='formRow'>
              <label className='formLabel'>
                State
                <select className='formSelect' name='state'>
                  {stateList}
                </select>
              </label>
              <label className='formLabel'>
                Zip Code
                <input className='formNumberInput' type='number' name='zip' max='99999' />
              </label>
            </div>
            <div className='formRow'>
              <label className='formLabel'>
                Password
                <input className='formPasswordInput' type='password' name='pass' maxLength='72' required />
              </label>
            </div>
            <div className='formRow'>
              <label className='formLabel'>
                Confirm Password
                <input className='formPasswordInput' type='password' name='pass2' maxLength='72' required />
              </label>
            </div>
            <div className='formRow'>
              <button type='submit' className='formButton'>Create Account</button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}
