
export function friendClick() {
    var persons = document.querySelectorAll('.message');
    var msgArea = document.querySelector('.messages-area');
    var mainArea = document.querySelector('.main-area')
    var backBtn = document.querySelector('.back')


    persons.forEach((person) => {
        person.addEventListener('click', function(e) {
    
            msgArea.classList.remove('active-area')
            mainArea.classList.add('active-area');
    
            console.log(this.childNodes)
    
            let fullName = this.children[1].children[0].children[0].innerText;
            
            let nameSpan = document.querySelector('#header-username');
            nameSpan.innerText = fullName;
    
            let headerImg = document.querySelector('#header-img');

            headerImg.src = this.dataset.img

        })
    })
    
    backBtn.addEventListener('click', function(e) {
    
        mainArea.classList.remove('active-area');
        msgArea.classList.add('active-area');
    
    })
} 

var more = document.getElementById("more"), 
    dropdown = document.getElementById("dropdown"),
    moreIcon = document.getElementById('more-icon');

var showDropDown = function(e){
        dropdown.classList.add("show");
        console.log('trying dropdown')
};
var hideDropDown = function(e){
    if(e.target !== more){
        // console.log(e.target);
        dropdown.classList.remove("show");
        console.log('hiding dropdown');
    }    
}

more.addEventListener("click", showDropDown);
moreIcon.addEventListener("click", showDropDown);
window.addEventListener("click", hideDropDown);             