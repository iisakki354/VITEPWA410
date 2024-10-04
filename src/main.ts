import {fetchData} from './functions';
import {UpdateResult} from './interfaces/UpdateResult';
import {UploadResult} from './interfaces/UploadResult';
import {LoginUser, UpdateUser, User} from './interfaces/User';
import {apiUrl, uploadUrl} from './variables';

// PWA code

// select forms from the DOM
const loginForm = document.querySelector(
  '#login-form'
) as HTMLFormElement | null;
const profileForm = document.querySelector(
  '#profile-form'
) as HTMLFormElement | null;
const avatarForm = document.querySelector(
  '#avatar-form'
) as HTMLFormElement | null;

// select inputs from the DOM
const usernameInput = document.querySelector('#username') as HTMLInputElement;
const passwordInput = document.querySelector('#password') as HTMLInputElement;

const profileUsernameInput = document.querySelector(
  '#profile-username'
) as HTMLInputElement;
const profileEmailInput = document.querySelector(
  '#profile-email'
) as HTMLInputElement;

// select profile elements from the DOM
const usernameTarget = document.querySelector(
  '#username-target'
) as HTMLSpanElement | null;
const emailTarget = document.querySelector(
  '#email-target'
) as HTMLSpanElement | null;
const avatarTarget = document.querySelector(
  '#avatar-target'
) as HTMLImageElement | null;
const logoutButton = document.querySelector('#logout');
logoutButton?.addEventListener('click', () => {
  localStorage.removeItem('token');
  if (!emailTarget || !usernameTarget || !avatarTarget) {
    return;
  }
  emailTarget.innerText = '';
  usernameTarget.innerText = '';
  avatarTarget.src = '';
});
// TODO: function to login
const login = async (): Promise<LoginUser> => {
  if (!passwordInput || !usernameInput) {
    throw new Error('Missing input fields');
  }
  const password = passwordInput.value;
  const username = usernameInput.value;

  const data = {
    username,
    password,
  };
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  const result = await fetchData<LoginUser>(apiUrl + '/auth/login', options);
  return result;
};

// TODO: function to update user data
const updateUserData = async (
  user: UpdateUser,
  token: string
): Promise<UpdateResult> => {
  const options: RequestInit = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer' + token,
    },
    body: JSON.stringify(user),
  };

  const updateResult = await fetchData<UpdateResult>(
    apiUrl + '/users',
    options
  );
  return updateResult;
};

//function to add userdata (email, username and avatar image) to the
// Profile DOM and Edit Profile Form
const addUserDataToDom = (user: User): void => {
  if (!usernameTarget || !emailTarget || !avatarTarget) {
    throw new Error('Missing target elements');
  }
  emailTarget.innerText = user.email;
  usernameTarget.innerText = user.username;
  avatarTarget.src = uploadUrl + user.avatar;
};

// function to get userdata from API using token
const getUserData = async (token: string): Promise<User> => {
  const options: RequestInit = {
    headers: {
      Authorization: 'Bearer' + token,
    },
  };
  return await fetchData<User>(apiUrl + '/users/token', options);
};

//function to check local storage for token and if it exists fetch
// userdata with getUserData then update the DOM with addUserDataToDom
const checkToken = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('no token');
    return;
  }
  const user = await getUserData(token);
  addUserDataToDom(user);
};

// call checkToken on page load to check if token exists and update the DOM
checkToken();

// TODO: login form event listener
// event listener should call login function and save token to local storage
// then call addUserDataToDom to update the DOM with the user data
if (loginForm) {
  loginForm.addEventListener('submit', async (evt) => {
    try {
      evt.preventDefault();
      const loginResult = await login();
      console.log(loginResult);
      localStorage.setItem('token', loginResult.token);
      addUserDataToDom(loginResult.data);
    } catch (error) {
      alert((error as Error).message);
    }
  });
}
// TODO: profile form event listener
// event listener should call updateUserData function and update the DOM with
// the user data by calling addUserDataToDom or checkToken
if (profileForm) {
  profileForm.addEventListener('submit', async (evt) => {
    try {
      evt.preventDefault();
      const token = localStorage.getItem('token');
      if (!token) {
        alert('please login');
        return;
      }
      if (!profileEmailInput || !profileUsernameInput) {
        throw new Error('Missing input fields');
      }
      const email = profileEmailInput.value;
      const username = profileUsernameInput.value;
      const data = {
        email,
        username,
      };
      const userResponse = await updateUserData(data, token);
      addUserDataToDom(userResponse.data);
      alert('User data updated');
    } catch (error) {
      console.error((error as Error).message);
    }
  });
}
//   const email = profileEmailInput.value;
//    const username = profileUsernameInput.value;
//    const data = {
//     email,
//    username,
//   };
// avatar form event listener
// event listener should call uploadAvatar function and update the DOM with
// the user data by calling addUserDataToDom or checkToken
if (avatarForm) {
  avatarForm.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const tokan = localStorage.getItem('token');
    if (!tokan) {
      alert('please login');
      return;
    }
    const fd = new FormData(avatarForm);
    const options: RequestInit = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + tokan,
      },
      body: fd,
    };
    const uploadResult = await fetchData<UploadResult>(
      apiUrl + '/users/avatar',
      options
    );
    console.log(uploadResult);
  });
}
