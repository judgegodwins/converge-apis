
export function friendClick() {
    var persons = document.querySelectorAll('.message');
    var msgArea = document.querySelector('.messages-area');
    var mainArea = document.querySelector('.main-area')
    var backBtn = document.querySelector('.back')


    persons.forEach((person) => {
        person.addEventListener('click', function(e) {
    
            msgArea.classList.remove('active-area')
            mainArea.classList.toggle('active-area');
    
            console.log(this.childNodes)
    
            let username = this.children[1].children[0].children[0].innerText;
            
            let nameSpan = document.querySelector('#header-username');
            nameSpan.innerText = username;
    
            let headerImg = document.querySelector('#header-img');

            headerImg.src = this.dataset.img

        })
    })
    
    backBtn.addEventListener('click', function(e) {
    
        mainArea.classList.remove('active-area');
        msgArea.classList.toggle('active-area');
    
    })
} 

var more = document.getElementById("more"), 
    dropdown = document.getElementById("dropdown"),
    container = document.querySelector(".container");

var showDropDown = function(e, el){
    el.classList.add("show");
    var x = e.target.getBoundingClientRect().x,
        y = e.target.getBoundingClientRect().y; 
    el.style.top = y + "px";   
    el.style.left = x + "px";   
};
var hideDropDown = function(e, el){
    if(e.target !== more){
        // console.log(e.target);
        el.classList.remove("show");
    }    
}

more.addEventListener("click", function(e){
    showDropDown(e, dropdown);
});
container.addEventListener("click", function(e){
    hideDropDown(e, dropdown);
});             