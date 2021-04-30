import React from 'react'
import Title from './title'

const stateAbbr = ["AL","AK","AR","AZ","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WI","WV","WY"];

export default class AboutAccount extends React.Component{
  constructor(props){
    super(props);
    this.props = props;
  }

  render(){
    /* The user is assumed to be logged in in order to render this page */
    const userRow = this.props.userRow;
    const userData = {"loggedIn":true,"isVerifier":userRow["isverifier"],"username":userRow["username"]};
    //fields for data groups
    const usernameGroup = [
      {"name":"Username","value":userRow.username,"modifiable":false},
      {"name":"Name","value":userRow.name,"column":"name","modifiable":true,"inputType":"text","inputName":"name","maxlength":100}
    ];
    const contactGroup = [
      {"name":"Email","value":userRow.email,"column":"email","modifiable":true,"inputType":"email","maxlength":300},
      {"name":"Phone","value":userRow.phone,"column":"phone","modifiable":true,"inputType":"tel","maxlength":15,"pattern":"^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$"}
    ];  //phone number regex from https://ihateregex.io/expr/phone/
    const preferencesGroup = [
      {"name":"Receive Emails When A Submission Is Rejected","value":"true","checked":userRow.wantsemails,"column":"wantsemails","modifiable":true,"inputType":"checkbox"},
      {"inputType":"hidden","value":true,"modifiable":true,"column":"preferences"}
    ];
    const addressGroup = [
      {"name":"Address Line 1","value":userRow.addressline1,"column":"addressline1","modifiable":true,"inputType":"text","maxlength":150},
      {"name":"Address Line 2","value":userRow.addressline2,"column":"addressline2","modifiable":true,"inputType":"text","maxlength":150},
      {"name":"City","value":userRow.addresscity,"column":"addresscity","modifiable":true,"inputType":"text","maxlength":100},
      {"name":"State Abbreviation","value":userRow.addressstate,"column":"addressstate","modifiable":true,"inputType":"text","minlength":2,"maxlength":2,"title":"The abbreviation for the state",list:"states"},
      {"name":"Zip Code","value":userRow.addresszip,"column":"addresszip","modifiable":true,"inputType":"number","min":10000,"max":99999}
    ];

    //create error message div if needed
    let errorDiv = null;
    if(this.props.errorMessage !== undefined && this.props.errorMessage.length > 0){
      errorDiv = <div className="errorDiv">{this.props.errorMessage}</div>
    }
    //create success message div if specified
    let successDiv = null;
    if(this.props.success !== undefined && this.props.success === true){
      successDiv = <div className="successDiv">Successfully updated account information</div>
    }

    //create datalist of valid state abbreviations
    let stateList = []
    stateAbbr.forEach((elem,i)=>{
      stateList.push(<option value={elem} key={"state"+i} />);
    });

    //render the three field groups and the password group, which has to be done differently
    return (
      <div id='app'>
        <Title user={userData} />
        <div id='mainColumn'>
          <h2 className="pageHeader">Account Information</h2>
          {errorDiv}
          {successDiv}
          <DataGroup fields={usernameGroup} id="username" />
          <div id="passwordGroup" className="dataGroup">
            <button className="showFormButton" data-target="pass" style={{"marginBottom":"0.4rem"}}>Change Password</button>
            <div className="modifyFormWrapper hidden" id="pass">
              <div id="passError" className="hidden errorDiv" />
              <form className="modifyForm" id="passForm" method="POST" action="/updateAccount">
                <label className="formLabel">
                  Old Password
                  <input className="formInput" type="password" name="old_pass" maxLength="72" required />
                </label>
                <label className="formLabel">
                  New Password
                  <input className="formInput" type="password" name="new_pass" maxLength="72" required />
                </label>
                <label className="formLabel">
                  Confirm New Password
                  <input className="formInput" type="password" name="new_pass_confirm" maxLength="72" required />
                </label>
                <button type="submit" className="formSubmit" id="passSubmit">Submit</button>
              </form>
            </div>
          </div>
          <DataGroup fields={contactGroup} id="contact" />
          <DataGroup fields={preferencesGroup} id="preferences" />
          <DataGroup fields={addressGroup} id="address" />
          <datalist id="states">
            {stateList}
          </datalist>
        </div>
      </div>
    );
  }
}

export function DataGroup(props){
  if(props.fields === undefined || props.id == undefined){
    return null;
  }
  //create table rows for the fields
  let fieldRows = [];
  props.fields.forEach((elem,i)=>{
    if(elem.inputType === "hidden") return; //skip hidden inputs
    let value = (elem.value!==null && elem.value!==undefined)?elem.value:"<None>";
    if(elem.inputType === "checkbox"){
      value = (elem.checked)?"Yes":"No";
    }
    fieldRows.push(
      <tr className={"row"+i%2} key={props.id+"Row"+i}>
        <td className="dataTableNameCell">{elem.name}</td>
        <td className="dataTableValueCell">{value}</td>
      </tr>
      );
  });
  
  //create inputs for the modify form
  let fieldFormInputs = [];
  let hasModifiableField = false;
  props.fields.forEach((elem,i)=>{
    if(elem.modifiable){  //check if the element can be modified
      hasModifiableField = true;
      fieldFormInputs.push(
        <label className="formLabel" key={props.id+"Label"+i}>
          {elem.name}
          <input className="formInput" type={elem.inputType} defaultValue={elem.value || undefined}
            name={elem.column} minLength={elem.minlength} maxLength={elem.maxlength} min={elem.min}
            max={elem.max} pattern={elem.pattern} title={elem.title} list={elem.list} 
            defaultChecked={elem.checked} />
        </label>
      );
    }
  });
  
  //create 'Change' button to show modify form if at least one field in the group can be modified
  let button = null;
  if(hasModifiableField){
    button = <button className="showFormButton" data-target={props.id}>Change</button>
  }
  return (
    <div className='dataGroup'>
      <table className='dataTable'>
        <tbody>
          {fieldRows}
        </tbody>
      </table>
      {button}
      <div className="modifyFormWrapper hidden" id={props.id}>
        <form className="modifyForm" method="POST" action="/updateAccount">
          {fieldFormInputs}
          <button type="submit" className="formSubmit">Submit</button>
        </form>
      </div>
    </div>
  );
}
