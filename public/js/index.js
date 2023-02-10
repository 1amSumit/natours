import { login } from './login';
import '@babel/polyfill';
import { displayMap } from './mapbox';

const loginForm = document.querySelector('.form');

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

const DOMel = document.getElementById('map');

if (DOMel) {
  const locations = JSON.parse(DOMel.dataset.locations);
  displayMap(locations);
}
