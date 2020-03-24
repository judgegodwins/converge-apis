var input = document.querySelector('#username');
console.log(input)
input.addEventListener('keyup', (e) => {
    console.log('keyup', input.value);
    input.value = input.value.replace(/\s/gi, '');
    input.value = input.value.toLowerCase();
});