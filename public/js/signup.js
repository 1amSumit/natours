import axios from 'axios';
import { showAlert } from './alert';

export const signup = async (name, email, password, confirmPassword) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        confirmPassword,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'successfully signed in');
      window.setTimeout(() => {
        location.assign('/');
      }, 700);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};