

export default class Controller {
    constructor() {
        this.persons = document.querySelectorAll('.message');
        this.msgArea = document.querySelector('.messages-area');
        this.mainArea = document.querySelector('.main-area');
        this.backBtn = document.querySelector('.back');
        this.accountArea = document.querySelector('.account-actions');
        this.menu = document.querySelector('.menu');
        this.inactiveCloser = document.querySelector('.inactive-closer');
        this.profile = document.querySelector('.you-profile');
        this.settings = document.querySelector('.settings');
        this.setBack = document.querySelector('.back2');
        this.profileImg = document.querySelectorAll('.profile-img-det');
        this.profileInput = document.querySelector('#file');
        this.form = document.querySelector('.update-img');
        this.msgTarget = '';
        this.callClick = this.callClick.bind(this);
        this.updatePersons = this.updatePersons.bind(this);
        this.moveback = this.moveback.bind(this);
        this.openSettings = this.openSettings.bind(this);
        this.more = document.getElementById("more");
        this.dropdown = document.getElementById("dropdown");
        this.container = document.querySelector(".container");


        window.addEventListener('popstate', this.moveback)
        

        this.menu.addEventListener('click', (e) => {
            this.accountArea.classList.add('open')
        });

        this.settings.addEventListener('click', this.openSettings);

        this.profileInput.addEventListener('change', function(e) {
            
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('avatar', this.profileInput.files[0]);

            fetch(`${document.location.origin}/updateprofile`, {
                method: 'POST',
                body: formData
            })
            .then(res => {
                console.log('first res: ', res);
                return res.json();
            })
            .then(data => {

                this.profileImg.forEach(img => {
                    img.src = data.url
                })
            })
        }.bind(this));

        this.inactiveCloser.addEventListener('click', (e) => {
            this.accountArea.classList.remove('open')
        });

        this.more.addEventListener("click", function(e){
            this.showDropDown(e, this.dropdown);
        }.bind(this));

        this.container.addEventListener("click", function(e){
            this.hideDropDown(e, this.dropdown);
        }.bind(this));

        this.profileInput.addEventListener('change', function(e) {
        }.bind(this));
        
    }

    updatePersons() {
        this.persons = document.querySelectorAll('.message');
    }

    callClick() {
        this.persons.forEach(person => {
            person.addEventListener('click', function(e) {
                this.msgClick(person, this.backBtn, this.mainArea, this.back)
            }.bind(this));
        })
    }

    msgClick(target, backBtn, mainArea, back) {

        let username = target.dataset.username;

        window.history.pushState({username}, username, `/messages/${username}`);

        mainArea.classList.add('right-open');

        let fullName = target.children[1].children[0].children[0].innerText;
        
        let nameSpan = document.querySelector('#header-username');
        nameSpan.innerText = fullName;

        let headerImg = document.querySelector('#header-img');

        headerImg.src = target.dataset.img

        backBtn.addEventListener('click', back);
    }

    moveback(e) {

        if(this.mainArea.classList.contains('right-open')) {

            this.mainArea.classList.remove('right-open');

        } else if(this.profile.classList.contains('right-open')) {

            this.profile.classList.remove('right-open');
        }
    }

    back(e) {
        e.preventDefault();
        console.log('e-target: ', e.target)
        e.target.removeEventListener('click', this.back);
        window.history.go(-1);
        
        $('.search-box').removeClass('inactive');
    }

    openSettings(e) {
        window.history.pushState({profile: 'my-profile'}, 'Profile', '/profile');

        this.profile.classList.add('right-open');
        this.accountArea.classList.remove('open')

        this.setBack.addEventListener('click', this.back);
    }

    showDropDown(e, el) {
        el.classList.add("show");
        var x = e.target.getBoundingClientRect().x,
            y = e.target.getBoundingClientRect().y; 
        el.style.top = y + "px";   
        el.style.left = x + "px";   
    };

    hideDropDown(e, el) {
        if(e.target !== more){
            // console.log(e.target);
            el.classList.remove("show");
        }    
    }
    
}
