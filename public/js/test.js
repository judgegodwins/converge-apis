var btns = document.querySelectorAll('.callout');
var first = document.querySelector('.first')
var second = document.querySelector('.second')
var third = document.querySelector('.third')
var firstCall = document.querySelector('.call')
var divs = [first, second, third];
var btnLeft = document.querySelector('.call-left')

console.log('init')
firstCall.addEventListener('click', (e) => {
    divs[0].classList.add('active');
})
btns[1].addEventListener('click', (e) => {

    divs[2].style.right = 0;
    console.log('clicked calling...', divs[2])
})

btnLeft.addEventListener('click', () => {
    divs[0].style.left = 0;
})

btns[0].addEventListener('click', (e) => {
    divs[0].style.left = '-100%';

})

// btns[2].addEventListener('click', (e) => {
//     divs[2].style.right = '-100%';
// });