import { login, logout } from './login';
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { updateData } from './updateUser';

const loginForm = document.querySelector('.form--login');
const logOut = document.querySelector('.nav__el--logout');
const userForm = document.querySelector('.form--user');
const formPassword = document.querySelector('.form-user-password');

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

if (logOut) {
  logOut.addEventListener('click', (e) => {
    logout();
  });
}

if (userForm) {
  userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateData({ name, email }, 'data');
  });
}

if (formPassword) {
  formPassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn-save--password').textContent = 'updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    await updateData(
      { passwordCurrent, password, confirmPassword },
      'password'
    );
    document.querySelector('.btn-save--password').textContent = 'save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
