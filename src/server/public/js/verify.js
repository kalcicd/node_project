//This script adds event listeners to the Show/Hide buttons
//This was done this way because React would not add the onclick property to the buttons
let buttons = document.querySelectorAll(".submissionShowHideButton,.submissionRejectButton");
for(let i=0; i<buttons.length; i++){
	let buttonTarget = buttons[i].dataset.target;
	buttons[i].addEventListener("click",()=>{
		document.getElementById(buttonTarget).classList.toggle("hidden");
	});
}

//For the same reason, the onchange property must be set in this file
let radios = document.querySelectorAll(".submissionRejectReasonLabel>input");
for(let i=0; i<radios.length; i++){
	let changeFunction = radios[i].dataset.change;
	radios[i].addEventListener("change",changeFunction);
}
