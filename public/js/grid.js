
export function friendClick() {
    var persons = document.querySelectorAll('.message');
    var msgArea = document.querySelector('.messages-area');
    var mainArea = document.querySelector('.main-area')
    var backBtn = document.querySelector('.back')
    var accountArea = document.querySelector('.account-actions')
    var menu = document.querySelector('.menu');
    var inactiveCloser = document.querySelector('.inactive-closer');

    persons.forEach((person) => {
        person.addEventListener('click', function(e) {

            let username = this.dataset.username;

            window.history.pushState({username}, username, `/messages/${username}`);

            mainArea.style.right = 0;
    
            console.log(this.childNodes)
    
            let fullName = this.children[1].children[0].children[0].innerText;
            
            let nameSpan = document.querySelector('#header-username');
            nameSpan.innerText = fullName;
    
            let headerImg = document.querySelector('#header-img');

            headerImg.src = this.dataset.img

            backBtn.addEventListener('click', back);

        })
    })
    
    function moveback(e) {
        if(mainArea.style.right != '-100%') {
            mainArea.style.right = '-100%';
        }
    }

    window.addEventListener('popstate', moveback)

    let clicks = 0

    function back(e) {
        e.preventDefault();
        backBtn.removeEventListener('click', back);
        window.history.go(-1);
        
        $('.search-box').removeClass('inactive')
    }

    menu.addEventListener('click', (e) => {
        accountArea.classList.add('open')
    })

    inactiveCloser.addEventListener('click', (e) => {
        console.log('clicked inCloser')
        accountArea.classList.remove('open')
    });

} 

var more = document.getElementById("more"), 
    dropdown = document.getElementById("dropdown"),
    container = document.querySelector(".container");

var showDropDown = function(e, el){
    el.classList.add("show");
    var x = e.target.getBoundingClientRect().x,
        y = e.target.getBoundingClientRect().y; 
    el.style.top = y + "px";   
    // el.style.left = x + "px";   
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
