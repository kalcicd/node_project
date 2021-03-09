//This script adds event listeners to the various buttons on the page
//This was done this way because React would not add the onclick property to the buttons

//function to send accept or reject request to the backend
function acceptOrRejectSubmission(submissionObject){
  //todo: type checking
  let postString = "id="+submissionObject.id;
  postString += "&accept="+submissionObject.accept;
  postString += "&reason="+submissionObject.reason;
  postString += "&updateTarget="+submissionObject.updateTarget;
  postString += "&updateChanges="+submissionObject.updateChanges;
  //create callback function for failure
  let failureCallback = (reason)=>{
    //todo: create more polished solution
    alert("The submission could not be processed: "+reason);
  }
  let xmlObj = new XMLHttpRequest();
  xmlObj.open("POST","/verify",true);
  xmlObj.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
  xmlObj.addEventListener("error",()=>{failureCallback("Connection error")});
  xmlObj.addEventListener("abort",()=>{failureCallback("Connection was aborted")});
  xmlObj.addEventListener("timeout",()=>{failureCallback("Connection timed out")});
  xmlObj.addEventListener("load",()=>{
    if(xmlObj.status===200){
      submissionObject.parentElem.remove();
      //todo: create more polished solution
      alert("Success");
    }
    else{
      failureCallback("Server returned a "+xmlObj.status+" error");
      console.log(xmlObj.statusText);
    }
  });
  xmlObj.send(postString);
}

//add listeners to the show/hide buttons
let buttons = document.querySelectorAll(".submissionShowHideButton,.submissionRejectButton");
for(let i=0; i<buttons.length; i++){
  let buttonTarget = buttons[i].dataset.target;
  buttons[i].addEventListener("click",()=>{
    document.getElementById(buttonTarget).classList.toggle("hidden");
  });
}

//add change listeners to rejection radio buttons
let radios = document.querySelectorAll(".submissionRejectReasonLabel>input");
for(let i=0; i<radios.length; i++){
  let changeFunction = (e)=>{
    /* Function called when a radio button is checked/unchecked */
    if(e.target.checked){
      document.getElementById(radios[i].dataset.textbox).textContent = radios[i].dataset.reason;
      if(radios[i].dataset.reason!==""){
        document.getElementById(radios[i].dataset.textbox).setAttribute("disabled","disabled");
      }
      else{
        document.getElementById(radios[i].dataset.textbox).removeAttribute("disabled");
      }
    }
  }
  radios[i].addEventListener("change",changeFunction);
}

//add click listeners to accept and reject buttons
let submissions = Array.prototype.slice.call(document.querySelectorAll(".submissionBody"));
submissions.forEach((sub)=>{
  let submissionElement = sub.parentNode;
  let submissionId = sub.dataset.updateId;
  //extract the list of changes from the interface table
  let tableRows = Array.prototype.slice.call(
    sub.querySelectorAll(".submissionUpdateTableRow:not(.submissionUpdateTableHeaderRow)")
  );
  let changesArr = [];
  tableRows.forEach((row)=>{
    if(row.children.length<3) return; //skip collecting changes for new submissions
    let fieldName = row.children[0].textContent;
    let value = row.children[2].textContent;
    changesArr.push(fieldName+":"+value);
  });
  let changes = changesArr.join(",");
  //traverse up through parent nodes until the submission wrapper is found
  let subTarget = (sub.dataset.updateTarget!==undefined)?sub.dataset.updateTarget:null;
  while(!submissionElement.classList.contains("submission")){
    submissionElement = submissionElement.parentNode;
  }
  //add accept button listener
  let acceptObj = {
    "id": submissionId,
    "accept": true,
    "parentElem": submissionElement,
    "reason": null,
    "updateTarget": subTarget,
    "updateChanges": changes
  };
  let acceptButton = sub.querySelector(".submissionAcceptButton");
  acceptButton.addEventListener("click",()=>{acceptOrRejectSubmission(acceptObj)});
  //add reject button listener
  let rejectButton = sub.querySelector(".submissionConfirmRejectButton");
  rejectButton.addEventListener("click",()=>{
    let subReason = sub.querySelector(".submissionRejectReasonTextArea").value;
    let rejectObj = {
      "id": submissionId,
      "accept": false,
      "parentElem": submissionElement,
      "reason": subReason,
      "updateTarget": subTarget,
      "updateChanges": changes
    };
    acceptOrRejectSubmission(rejectObj);
  });
  //remove dataset from submission
  sub.removeAttribute("data-update-id");
  sub.removeAttribute("data-update-target");
});
