import React from 'react'
import Title from './title'

export default function Verify(props){
  let forVerification = [];
  if(props.hasOwnProperty("submissions") && props.submissions.length>0){
    props.submissions.forEach((sub,i)=>{
      forVerification.push(<UnverifiedSubmission submission={sub} index={i} key={i}/>);
	 });
  }
  else{
    forVerification.push(<div className="noSubmissionMessage">There are no submissions to review</div>);
  }
  return(
    <div id="app">
	   <Title/>
		<div id="mainColumn">
		  <div id="verifierColumn">
          {forVerification}
		  </div>
		</div>
	 </div>
  );
}

export function UnverifiedSubmission(props){
  /*
  submission should have the following properties:
  -title: the title of the location, office, etc. which is being updated
  -type: the type of information (such as election) which is being updated
  -reference: the link to the submitted reference material backing up the user's claim
  -id: the id of the submission in the database table
  -updates: an array of arrays which contain the property name, old information, and new information
  */
  if(props.hasOwnProperty("submission") && props.hasOwnProperty("index")){
    let submission = props.submission;
    let submissionId = "submission"+String(props.index);
    let submissionRadios = "submissionRejectReason"+String(props.index);

    let submissionUpdates = [];
	 submission.updates.forEach((update,i)=>{
      submissionUpdates.push(
		<tr className="submissionUpdateTableRow" key={i}>
		  <td>{update[0]}</td>
		  <td>{update[1]}</td>
		  <td>{update[2]}</td>
		</tr>
		);
	 });

	 return(
	   <div className="submission">
		  <div className="submissionHeader">{submission.title}</div>
		  <div className="submissionButtons">
		    <button type="button" className="submissionShowButton" onClick={()=>{
            document.getElementById(submissionId).classList.toggle('hidden');
          }}>Show/Hide</button>
		  </div>
		  <div className="submissionBody" id={submissionId}>
		    <table className="submissionUpdateTable">
			   <thead>
				  <tr className="submissionUpdateTableHeaderRow">
				    <th>Property</th>
				    <th>Current Data</th>
				    <th>Updated Data</th>
				  </tr>
				</thead>
				<tbody>
				  {submissionUpdates}
				</tbody>
          </table>
          <div className="submissionAcceptOrRejectInterface">
            <button type="button" className="submissionAcceptButton">Accept</button>
            <div className="submissionRejectReasonRadioButtons">
              <label className="submissionRejectReasonLabel">
                <input type="radio" name={submissionRadios}></input>
                Inaccurate Information
              </label>
              <label className="submissionRejectReasonLabel">
                <input type="radio" name={submissionRadios}></input>
                Outdated Information
              </label>
              <label className="submissionRejectReasonLabel">
                <input type="radio" name={submissionRadios}></input>
                Poor Quality Reference
              </label>
              <label className="submissionRejectReasonLabel">
                <input type="radio" name={submissionRadios}></input>
                Custom Reason
              </label>
            </div>
            <textarea className="submissionRejectReasonTextArea" rows="7" defaultValue="Reason for rejection">
            </textarea>
            <button type="button" className="submissionRejectButton">Reject</button>
          </div>
		  </div>
		</div>
	 )
  }
  else{
    return(<div></div>)
  }
}
