const nav = document.querySelector('.header__nav');
const button = document.querySelector('.header__button');

button.addEventListener('click',() => {
  if (nav.classList.contains('header__nav--closed')) {
    nav.classList.remove('header__nav--closed')
    nav.classList.add('header__nav--opened')
  } else {
  nav.classList.add('header__nav--closed')
  nav.classList.remove('header__nav--opened')
  }
})
