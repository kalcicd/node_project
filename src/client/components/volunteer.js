import React from 'react'
import Title from './title'

export default function Volunteer (props) {
  let loggedIn = (props.logged_in !== undefined) ? props.logged_in : false
  let isVerifier = (props.is_verifier !== undefined) ? props.is_verifier : false
  return (
    <div id='app'>
      <Title logged_in={loggedIn} is_verifier={isVerifier} />
      <div id='mainColumn'>
        <div id='sectionHeader'>Volunteer Sign Up</div>
        <form action='/signup' method='POST' id='signUpForm'>
          <div className='formInputRow'>
            <label htmlFor='nameInput' className='formLabel'>Name:</label>
            <input type='text' id='nameInput' className='formInput' />
          </div>
          <div className='formInputRow'>
            <label htmlFor='' className='formLabel'>Email:</label>
            <input type='text' id='' className='formInput' />
          </div>
          <div className='formInputRow'>
            <label htmlFor='' className='formLabel'>Phone:</label>
            <input type='text' id='' className='formInput' />
          </div>
          <div className='formInputRow'>
            <label htmlFor='' className='formLabel'>Zip code:</label>
            <input type='text' id='' className='formInput' />
          </div>
          <div className='formInputRow'>
            <label htmlFor='' className='formLabel'>
              What state/city are you interested in helping us crowdsource?
            </label>
            <input type='text' id='' className='formInput' />
          </div>
          <div className='formInputRow'>
            <label htmlFor='' className='formLabel'>
              Did we miss an elected position in your community?
            </label>
            <input type='text' id='' className='formInput' />
          </div>
        </form>
      </div>
    </div>
  )
}
