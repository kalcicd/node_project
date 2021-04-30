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
const subButtons = document.getElementsByClassName("submissionButton");
for(let i=0; i<subButtons.length; i++){
	if(subButtons[i].dataset.target !== "popup"){
		subButtons[i].setAttribute("onclick","redirectToLogin()");
	}
	else{
		//add listeners to buttons on the page which should show the popup
		subButtons[i].setAttribute("onclick","showSubmissionPopup()");
	}
}
const popupBackground = document.getElementById("submissionPopupWrapper");
if(popupBackground !== null) popupBackground.addEventListener("click",hideSubmissionPopup);
const popupSelect = document.getElementById("submissionPopupSelect");
if(popupSelect !== null) popupSelect.addEventListener("change",updateSubmissionPopupInput);
const popupCancel = document.getElementById("submissionPopupCancelButton");
if(popupCancel !== null) popupCancel.addEventListener("click",hideSubmissionPopup);

function redirectToLogin(){
	const path = window.location.pathname + window.location.search;
	const newPath = "/login?redirect="+escape(path);
	window.open(newPath,"_self");
}

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
	//Delete any old 'otherInformation' inputs
	let oldInputs = document.getElementsByClassName("submissionOtherInformationInput");
	for(let i=0; i<oldInputs.length; i++){
		oldInputs[i].remove();
	}
	//Find which option is selected
	let selectedOption = null;
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
	//Add any 'otherInformation' inputs
	if(description.otherInformation !== undefined){
		for(let i=0; i<Object.keys(description.otherInformation).length; i++){
			const curInfo = Object.keys(description.otherInformation)[i];
			let newInput = document.createElement('input');
			newInput.classList.add('submissionOtherInformationInput');
			newInput.setAttribute("type","hidden");
			newInput.setAttribute("name",curInfo);
			newInput.value = description.otherInformation[curInfo];
			document.getElementById("submissionPopupBody").appendChild(newInput);
		}
	}
	//Modify the input
	const input = document.getElementById("submissionPopupInput");
	input.setAttribute("type",description.type);
	input.setAttribute("name",description.rowName);
	if(description.maxlength!==null) input.setAttribute("maxlength",description.maxlength);
	else input.removeAttribute("maxlength");
}
