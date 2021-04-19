//Mobile menu button
let menuButton = document.getElementById("menuButton");
if(menuButton !== undefined){
	menuButton.addEventListener("click",(e)=>{
		let collapsableMenu = document.getElementById("headerBar");
		if(collapsableMenu === undefined){
			console.log("Error: could not find headerBar");
			return;
		}
		collapsableMenu.classList.toggle("mobileHidden");
	});
}

//Submission popup
const buttons = document.getElementsByClassName("submissionButton");
for(let i=0; i<buttons.length; i++){
	//add listeners to buttons on the page which should show the popup
	buttons[i].setAttribute("onclick","showSubmissionPopup()");
}
const popupBackground = document.getElementById("submissionPopupWrapper");
popupBackground.addEventListener("click",hideSubmissionPopup);
const popupSelect = document.getElementById("submissionPopupSelect");
popupSelect.addEventListener("change",updateSubmissionPopupInput);
const popupCancel = document.getElementById("submissionPopupCancelButton");
popupCancel.addEventListener("click",hideSubmissionPopup);

function showSubmissionPopup(){
	/*Shows the submission popup*/
	updateSubmissionPopupInput();
	const submissionPopup = document.getElementById("submissionPopupWrapper");
	submissionPopup.classList.remove("hidden");
}

function hideSubmissionPopup(event){
	/*Hides the submission popup and clears the fields in it*/
	if(event !== undefined){
		//check if the call was due to event bubbling
		if(
			event.target.id !== "submissionPopupWrapper" &&
			event.target.id !== "submissionPopupCancelButton"
		){
			return;
		}
	}
	//Hide the popup
	document.getElementById("submissionPopupWrapper").classList.add("hidden");
	//Clear the values from the hidden popups
	document.getElementById("submissionPopupTable").value = "";
	document.getElementById("submissionPopupId").value = "";
	//Clear the name from the popup input
	document.getElementById("submissionPopupInput").removeAttribute("name");
}

function updateSubmissionPopupInput(){
	/*This function should be called in order to update the type of the input field in the submission
	popup*/
	const options = document.getElementsByClassName("submissionPopupOption");
	let selectedOption = null;
	//Find which option is selected
	for(let i=0; i<options.length; i++){
		if(options[i].selected){
			selectedOption = options[i];
			break;
		}
	}
	if(selectedOption === null) return;

	//Get the selected option's description
	let description = null;
	try{
		description = JSON.parse(selectedOption.dataset.description);
	}
	catch(e){
		return;
	}
	//Set the values on the hidden inputs
	document.getElementById("submissionPopupTable").value = description.table;
	document.getElementById("submissionPopupId").value = description.tableId;
	//Modify the input
	const input = document.getElementById("submissionPopupInput");
	input.setAttribute("type",description.type);
	input.setAttribute("name",description.rowName);
	if(description.maxlength!==null) input.setAttribute("maxlength",description.maxlength);
	else input.removeAttribute("maxlength");
}
