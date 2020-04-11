

export default class Controller {
    constructor() {
        this.persons = document.querySelectorAll('.message');
        this.msgArea = document.querySelector('.messages-area');
        this.mainArea = document.querySelector('.main-area');
        this.backBtn = document.querySelector('.back');
        this.accountArea = document.querySelector('.account-actions');
        this.menu = document.querySelector('.menu');
        this.inactiveCloser = document.querySelector('.inactive-closer');
        //user profile
        this.profile = document.querySelector('.you-profile');
        this.settings = document.querySelector('.settings');

        //back button in userprofile page
        this.setBack = document.querySelector('.back2');

        //back button in friend profile page. This should tale user back to messages
        this.msgBack = document.querySelector('.back3');
        //user's profile image
        this.profileImg = document.querySelectorAll('.profile-img-det');

        //profile image for friend
        this.profileImgFrnd = document.querySelector('.profile-img-friend');
        this.profileInput = document.querySelector('#file');
        this.form = document.querySelector('.update-img');
        this.frndFullname = document.querySelector('.f-fullname')
        this.mainHeader = document.querySelector('.main-header');
        this.friendProfile = document.querySelector('.friend-profile');
        // send message button in profile page
        this.sm = document.querySelector('.s-m')
        this.more = document.getElementById("more");
        this.dropdown = document.getElementById("dropdown");
        this.container = document.querySelector(".container");
        this.msgTarget = '';
        this.callClick = this.callClick.bind(this);
        this.updatePersons = this.updatePersons.bind(this);
        this.moveback = this.moveback.bind(this);
        this.openSettings = this.openSettings.bind(this);

        window.addEventListener('popstate', this.moveback)
        
        // open menu
        this.menu.addEventListener('click', (e) => {
            this.accountArea.classList.add('open')
        });

        //open friend profile page

        this.mainHeader.addEventListener('click', (e) => {
            this.openProfile(
                $('#header-username').html(),
                $('#lastseen').html(),
                $('#header-username').data('username'),
                this.friendProfile,
                this.msgBack,
                $('.header-img').attr('src'),
                this.profileImgFrnd,
                this.frndFullname,
                this.back
            )
        })

        //open settings page
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

        window.history.pushState({username}, username, `/rd/messages/${username}`);

        mainArea.classList.add('right-open');

        let fullName = target.children[1].children[0].children[0].innerText;
        
        let nameSpan = document.querySelector('#header-username');
        nameSpan.innerText = fullName;

        let headerImg = document.querySelector('#header-img');

        headerImg.src = target.dataset.img

        backBtn.addEventListener('click', back);
    }

    moveback(e) {
        
        var rightPoppers = [this.mainArea, this.profile];

        if(this.friendProfile.classList.contains('right-open')) {
            this.friendProfile.classList.remove('right-open');
        } else {
            rightPoppers.forEach(popper => {
                if(popper.classList.contains('right-open')) {
                    popper.classList.remove('right-open');
                }
            })
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
        // url should always contain 3 params to be able to redirect to
        // homepage on reload.
        window.history.pushState({profile: 'my-profile'}, 'Profile', '/rd/profile/me');

        this.profile.classList.add('right-open');
        this.accountArea.classList.remove('open')

        this.setBack.addEventListener('click', this.back);
    }

 
    openProfile(fullname, lastseen, username, profile, setBack, img, imgTarget, frndfullname, back) {
        console.log('opening profile')
        window.history.pushState({profile: 'my-profile'}, 'Profile', `/rd/profile/${username}`);

        imgTarget.src = img;
        profile.classList.add('right-open');

        frndfullname.innerText = fullname;

        this.sm.addEventListener('click', back);
        setBack.addEventListener('click', back);
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
