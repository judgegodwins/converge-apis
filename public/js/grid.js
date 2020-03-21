
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
    dropdown = document.getElementById("dropdown");

var showDropDown = function(e){
        dropdown.classList.add("show");
};
var hideDropDown = function(e){
    if(e.target !== more){
        // console.log(e.target);
        dropdown.classList.remove("show");
    }    
}

more.addEventListener("click", showDropDown);
window.addEventListener("click", hideDropDown);             