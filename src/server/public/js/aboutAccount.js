function initialize(){
  //Add onclick listeners to showFormButtons
  const buttons = Array.prototype.slice.apply(document.getElementsByClassName("showFormButton"));
  buttons.forEach((b)=>{
    let onclick = "document.getElementById('"+b.dataset.target+"').classList.toggle('hidden')";
    b.setAttribute("onclick",onclick);
  });

  //Add submit listener to the change password form
  const submitForm = document.getElementById("passForm");
  const submitFunc = (e) => {
    const newPass = document.getElementsByName("new_pass")[0];
    const confirmPass = document.getElementsByName("new_pass_confirm")[0];
    //Check if one or both of the inputs could not be found
    if(newPass===undefined || confirmPass===undefined){
      e.preventDefault();
    }
    //Chec if the passwords don't match
    if(newPass.value !== confirmPass.value){
      e.preventDefault();
      const errorPopup = document.getElementById("passError");
      errorPopup.classList.remove("hidden");
      errorPopup.textContent = "The new password does not match the confirm new password";
    }
  }
  passForm.addEventListener("submit",submitFunc);
}

initialize();
