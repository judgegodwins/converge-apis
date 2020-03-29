console.log("init");

var accountSwitchBtn = document.querySelector("button#switch"),
    accountSlider = document.querySelector("#slider.account-action"),
    signInForm = document.querySelector("form#sign-in"),
    createAccountForm = document.querySelector("form#create-account");


var signIn_Username = signInForm.querySelector("input.username");
var signIn_Pass = signInForm.querySelector("input.password");
var createAccount_Username = createAccountForm.querySelector("input.username");
var createAccount_Pass = createAccountForm.querySelector("input.password");
var createAccount_Email = createAccountForm.querySelector("input.email");

accountSwitchBtn.addEventListener("click", function(){
    accountSlider.classList.toggle("slider-active");
    signInForm.classList.toggle("form-active");
    signInForm.parentElement.classList.toggle("wrapper-inactive");
    createAccountForm.classList.toggle("form-active");
    createAccountForm.parentElement.classList.toggle("wrapper-inactive")

    if(createAccountForm.getAttribute("data-active") == "false"){
        createAccountForm.setAttribute("data-active", "true");
        signInForm.setAttribute("data-active", "false");
        accountSwitchBtn.querySelector("span").textContent = "Have an Account? Log in";
        console.log("false => true");

        signIn_Username.setAttribute("id", "null1");
        signIn_Username.setAttribute("name", "null1");
        signIn_Pass.setAttribute("id", "null2");
        signIn_Pass.setAttribute("name", "null2");

        createAccount_Username.setAttribute("id", "username");
        createAccount_Pass.setAttribute("id", "password");
        createAccount_Username.setAttribute("name", "username");
        createAccount_Pass.setAttribute("name", "password");
        createAccount_Email.setAttribute("id", "email")

    } else{
        createAccountForm.setAttribute("data-active", "false");
        signInForm.setAttribute("data-active", "true");
        accountSwitchBtn.querySelector("span").textContent = "Create An Account";
        console.log("true => false")

        signIn_Username.setAttribute("id", "username");
        signIn_Username.setAttribute("name", "username");
        signIn_Pass.setAttribute("id", "password");
        signIn_Pass.setAttribute("name", "password");

        createAccount_Username.setAttribute("id", "null1");
        createAccount_Pass.setAttribute("id", "null2");
        createAccount_Username.setAttribute("name", "null1");
        createAccount_Pass.setAttribute("name", "null2");

    }

    //write a function that
    //checks if ".slider-active" class is in the accountSlider element
    //if true, listen for "transitionend" event and set the width to 50%
    /*
    accountSlider.getAttribute
    */


})