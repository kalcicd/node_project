import React from 'react'
import Title from './title'

export default function Verify (props) {
  let forVerification = []
  if (props.hasOwnProperty('submissions') && props.submissions.length > 0) {
    props.submissions.forEach((sub, i) => {
      forVerification.push(<UnverifiedSubmission submission={sub} index={i} key={i} />)
    })
  } else {
    forVerification.push(<div className='noSubmissionMessage'>There are no submissions to review</div>)
  }
  let loggedIn = (props.logged_in !== undefined) ? props.logged_in : false
  let isVerifier = (props.is_verifier !== undefined) ? props.is_verifier : false
  return (
    <div id='app'>
      <Title logged_in={loggedIn} is_verifier={isVerifier} />
      <div id='mainColumn'>
        <div id='verifierColumn'>
          {forVerification}
        </div>
      </div>
    </div>
  )
}

export class UnverifiedSubmission extends React.Component {
  constructor (props) {
    /*
    submission should have the following properties:
    -title: the title of the location, office, etc. which is being updated
    -type: the type of information (such as election) which is being updated
    -reference: the link to the submitted reference material backing up the user's claim
    -id: the id of the submission in the database table
    -updates: an array of arrays which contain the property name, old information, and new information
    */
    super(props)
    this.props = props
    this.state = { rejectionReason: '' }
  }

  render () {
    if (this.props.hasOwnProperty('submission') && this.props.hasOwnProperty('index')) {
      let submission = this.props.submission
      let submissionId = 'submission' + String(this.props.index)
      let submissionRejectId = 'submissionReject' + String(this.props.index)
      let submissionRadios = 'submissionRejectReason' + String(this.props.index)

      let submissionUpdates = []
      submission.updates.forEach((update, i) => {
        submissionUpdates.push(
          <tr className='submissionUpdateTableRow' key={i}>
            <td>{update[0]}</td>
            <td>{update[1]}</td>
            <td>{update[2]}</td>
          </tr>
        )
      })

      return (
        <div className='submission'>
          <div className='submissionHeader'>{submission.title}</div>
          <button type='button' className='submissionShowHideButton' data-target={submissionId}>
            Show/Hide
          </button>
          <div className='submissionBody hidden' id={submissionId}>
            <table className='submissionUpdateTable'>
              <thead>
                <tr className='submissionUpdateTableHeaderRow'>
                  <th>Property</th>
                  <th>Current Data</th>
                  <th>Updated Data</th>
                </tr>
              </thead>
              <tbody>
                {submissionUpdates}
              </tbody>
            </table>
            <div className='submissionLinkWrapper'>
              <a className='submissionLink' href={submission.reference}>Submitted Reference</a>
            </div>
            <div className='submissionAcceptOrRejectInterface'>
              <div className='submissionAcceptOrRejectButtons'>
                <button type='button' className='submissionAcceptButton'>Accept</button>
                <button type='button' className='submissionRejectButton'
                  data-target={submissionRejectId}>Reject
                </button>
              </div>
              <div className='submissionRejectWrapper hidden' id={submissionRejectId}>
                <div className='submissionRejectHeader' checked>Reason for Rejection</div>
                <div className='submissionRejectReasonRadioButtons'>
                  {this.renderRadioButton(submissionRadios, 'Inaccurate Information', 'None')}
                  {this.renderRadioButton(submissionRadios, 'Outdated Information', 'None')}
                  {this.renderRadioButton(submissionRadios, 'Poor Quality Reference', 'None')}
                  {this.renderRadioButton(submissionRadios, 'Custom Reason', 'None')}
                </div>
                <textarea className='submissionRejectReasonTextArea'
                  rows='7' defaultValue={this.state.rejectionReason} />
                <button type='button' className='submissionConfirmRejectButton'>
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      return (<div />)
    }
  }

  renderRadioButton (name, label, reason) {
    let stateUpdateFunction = (newReason) => {
      let newState = this.state.slice()
      newState['rejectionReason'] = newReason
      this.setState(newState)
    }
    return (
      <RejectionReasonRadioButton name={name} label={label} reason={reason}
        reasonUpdate={stateUpdateFunction} />
    )
  }
}

export class RejectionReasonRadioButton extends React.Component {
  // a radio button which describes the reason for rejecting a submission
  constructor (props) {
    super(props)
    this.name = props.name
    this.label = props.label
    this.reason = props.reason
    this.reasonUpdate = props.reasonUpdate
  }

  handleChange (event) {
    if (event.target.checked) {
      let newState = { rejectionReason: this.reason }
      this.reasonUpdate(newState)
    }
  }

  render () {
    return (
      <label className='submissionRejectReasonLabel'>
        <input type='radio' name={this.name} onChange={this.handleChange} />
        {this.label}
      </label>
    )
  }
}
