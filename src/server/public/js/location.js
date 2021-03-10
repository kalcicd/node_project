//set event listeners on collapse buttons
let buttons = Array.prototype.slice.call(document.getElementsByClassName('headerCollapseButton'));
buttons.forEach((collapseButton)=>{
  let target = document.getElementById(collapseButton.dataset.target);
  collapseButton.addEventListener('click',()=>{
    target.classList.toggle('collapsed');
    collapseButton.classList.toggle('collapsed');
  });
});
