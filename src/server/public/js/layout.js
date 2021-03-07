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
