import React from 'react'

export default function SubmissionPopup (props) {
  if (props.user === undefined || props.user.loggedIn !== true) {
    return null
  }
  let selectOptions = []
  switch (props.page) {
    case 'officeholder':
      selectOptions = [
        {
          'name': 'Name',
          'rowName': 'newname',
          'maxlength': 100,
          'pattern': null,
          'type': 'text',
          'table': 'officeholder',
          'tableId': props.currentValues.holderId
        },
        {
          'name': 'Phone Number',
          'rowName': 'newphone',
          'maxlength': 100,
          'pattern': null,
          'type': 'tel',
          'table': 'officeholder',
          'tableId': props.currentValues.holderId
        },
        {
          'name': 'Email',
          'rowName': 'newemail',
          'maxlength': 100,
          'pattern': null,
          'type': 'email',
          'table': 'officeholder',
          'tableId': props.currentValues.holderId
        },
        {
          'name': 'Meetings',
          'rowName': 'newmeeting',
          'maxlength': 150,
          'pattern': null,
          'type': 'text',
          'table': 'officeholder',
          'tableId': props.currentValues.holderId
        }
      ]
      props.currentValues.offices.forEach((elem) => {
        // add option to update termStart
        selectOptions.push({
          'name': 'Term start date for ' + elem.officeTitle,
          'rowName': 'termstart',
          'maxlength': null,
          'pattern': null,
          'type': 'date',
          'table': 'office',
          'tableId': elem.officeId
        })
        // add option to update termEnd
        selectOptions.push({
          'name': 'Term end date for ' + elem.officeTitle,
          'rowName': 'termend',
          'maxlength': null,
          'pattern': null,
          'type': 'date',
          'table': 'office',
          'tableId': elem.officeId
        })
      })
      break
    case 'search':
      break
  }
  // create option tags to be placed into the dropdown select
  let optionTags = []
  selectOptions.forEach((elem, i) => {
    optionTags.push(
      <option data-description={JSON.stringify(elem)} key={'option' + i}
        className='submissionPopupOption'>
        {elem.name}
      </option>
    )
  })
  return (
    <div id='submissionPopupWrapper' className='hidden'>
      <form id='submissionPopupBody' method='POST' action='/submit'>
        <div id='submissionPopupTitleWrapper' className='submissionPopupRow'>
          <h2 id='submissionPopupTitle'>Suggest an Update</h2>
        </div>
        <label id='submissionPopupSelectWrapper' className='submissionPopupRow'>
          Field to update
          <select id='submissionPopupSelect'>
            {optionTags}
          </select>
        </label>
        <input name='table' id='submissionPopupTable' className='hidden' />
        <input name='id' id='submissionPopupId' className='hidden' />
        <label id='submissionInputWrapper' className='submissionPopupRow'>
          New Value
          <input id='submissionPopupInput' />
        </label>
        <label id='submissionReferenceWrapper' className='submissionPopupRow'>
          Reference Source Link
          <input type='url' id='submissionPopupReference' name='referenceLink' />
        </label>
        <div id='submissionPopupButtonWrapper' className='submissionPopupRow'>
          <button id='submissionPopupCancelButton' className='submissionPopupButton' type='button'>
            Cancel
          </button>
          <button id='submissionPopupConfirmButton' className='submissionPopupButton' type='submit'>
            Confirm
          </button>
        </div>
      </form>
    </div>
  )
}
