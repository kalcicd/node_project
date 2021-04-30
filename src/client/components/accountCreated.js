import React from 'react'
import Title from './title'

export default class AccountCreated extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render () {
    return (
      <div id='app'>
        <Title />
        <div id='mainColumn'>
          <h2 id='successHeader'>Success</h2>
          <div id='successMessage'>
            Your account was successfully created! Click <a href='/login'>here</a> to login.
          </div>
        </div>
      </div>
    )
  }
}
