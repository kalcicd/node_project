import React from 'react'
import Title from './title'

export default function Verify (props) {
  let forVerification = [];
  if (props.hasOwnProperty('submissions') && props.submissions.length > 0) {
    props.submissions.forEach((sub, i) => {
      forVerification.push(<UnverifiedSubmission submission={sub} index={i} key={i}/>);
    })
  } else {
    forVerification.push(<div className='noSubmissionMessage'>There are no submissions to review</div>);
  }
  return (
    <div id='app'>
      <Title user={props.user} />
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
    -id: the id of the submission in the database table
	 -isNew: whether the data is a new submission (true)  or an update to existing data (false)
    -reference: the link to the submitted reference material backing up the user's claim
    -type: the type of information (such as election) which is being updated
    -updates: an array of arrays which each contain the property name, old information, and new
    information. If the submission is a new submission the old information entry will be ignored.
    */
    super(props);
    this.props = props;
  }

  render () {
    if (this.props.hasOwnProperty('submission') && this.props.hasOwnProperty('index')) {
      let submission = this.props.submission;
      let submissionDivId = 'submission' + String(this.props.index);
      let submissionRejectId = 'submissionReject' + String(this.props.index);
      let submissionReasonId = 'submissionReason' + String(this.props.index);
      let submissionRadios = 'submissionRejectReason' + String(this.props.index);

      //assemble table data for updates
      let submissionUpdates = [];
      submission.updates.forEach((update, i) => {
		    let rowData = [];
        update.forEach((data,i)=>{
          //add the 'old information' entry only if the submission is not new
          if(i!==1 || submission.isNew===undefined || submission.isNew===false){
            rowData.push(<td key={i}>{data}</td>);
          }
        });
        //add the new row to the table array
        submissionUpdates.push(
          <tr className='submissionUpdateTableRow' key={i}>
            {rowData}
          </tr>
        )
      })

      //create submission table header
      let submissionHeader = [];
      submissionHeader.push(<th key="headerProperty">Property</th>);
      if(submission.isNew===undefined || submission.isNew===false){
        submissionHeader.push(<th key="headerCurrentData">Current Data</th>);
        submissionHeader.push(<th key="headerUpdatedData">Updated Data</th>);
      }
      else{
        submissionHeader.push(<th key="headerData">Data</th>);
      }

      //create rejection radio buttons
      const rejectionOptions = [
        {
          'title':'Inaccurate Information',
          'reason':'the submitted information was inaccurate'
        },
        {
          'title':'Outdated Information',
          'reason':'the provided information was outdated'
        },
        {
          'title':'Poor Quality Reference',
          'reason':'the reference given was of poor quality or inaccurate'
        },
        {
          'title':'Other',
          'reason':''
        }
      ];
      let rejectionRadios = [];
      rejectionOptions.forEach((elem,i)=>{
        rejectionRadios.push(
          this.renderRadioButton(submissionRadios,elem.title,elem.reason,submissionReasonId,i)
        );
      });

      return (
        <div className='submission'>
          <div className='submissionHeader'>{submission.title}</div>
          <button type='button' className='submissionShowHideButton' data-target={submissionDivId}>
            Show/Hide
          </button>
          <div className='submissionBody hidden' id={submissionDivId} data-submit-user={submission.user}
            data-update-id={submission.id} data-update-target={submission.updateTarget}>
            <table className='submissionUpdateTable'>
              <thead>
                <tr className='submissionUpdateTableHeaderRow'>
                  {submissionHeader}
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
                  {rejectionRadios}
                </div>
                <textarea id={submissionReasonId} className='submissionRejectReasonTextArea' rows='7' />
                <button type='button' className='submissionConfirmRejectButton'>
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (<div />);
    }
  }

  renderRadioButton (name, label, reason, textboxId, index) {
    let stateUpdateFunction = (newReason) => {
      let newState = this.state.slice();
      newState['rejectionReason'] = newReason;
      this.setState(newState);
    }
    return (
      <RejectionReasonRadioButton name={name} label={label} reason={reason} textbox={textboxId}
      key={index} />
    );
  }
}

export class RejectionReasonRadioButton extends React.Component {
  // a radio button which describes the reason for rejecting a submission
  constructor (props) {
    super(props)
    this.name = props.name;
    this.label = props.label;
    this.reason = props.reason;
    this.textbox = props.textbox
  }

  handleChange (event) {
    /* Currently unused */
    if (event.target.checked) {
      let newState = { rejectionReason: this.reason };
      this.reasonUpdate(newState);
    }
  }

  render () {
    return (
      <label className='submissionRejectReasonLabel'>
        <input type='radio' name={this.name} data-reason={this.reason} data-textbox={this.textbox} />
        {this.label}
      </label>
    );
  }
}
