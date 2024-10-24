import settings from "./settings";
import { authHeader } from "./authHeader";

export const authService = {
  login,
  logout,
  profile,
  handleResponse,
  sendrecovery
};
export function getUser() {
  let user = JSON.parse(localStorage.getItem("user"));
  return user || false;
}
export function login({ username, password }) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  };
  return fetch(`${settings.API_URL}login`, requestOptions)
    .then(handleResponse)
    .then((response) => {
      if (response.user) {
        response.user.token = response.token;
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("company", JSON.stringify(response.company));
      }
      return response;
    });
}

export function register({ email,phone,firstname,lastname, password }) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email,phone,firstname,lastname, password }),
  };
  return fetch(`${settings.API_URL}register`, requestOptions)
    .then(handleResponse)
    .then((response) => {
      if (response.user) {
        response.user.token = response.token;
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      return response;
    });
}

export function sendrecovery({email }) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({email }),
  };
  return fetch(`${settings.API_URL}sendrecovery`, requestOptions)
    .then(handleResponse);
}

export function profile() {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  return fetch(`${settings.API_URL}profile`, requestOptions).then(
    authService.handleResponse
  );
}

export function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}




export function handleResponse(response) {
  return response.text().then((text) => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      if (response.status === 401) {
        logout();
      } else if (response.status === 403) {
        window.location.href = "/";
      }

      const error = data || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}
