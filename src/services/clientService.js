import settings from "./settings";
import { authHeader } from "./authHeader";
import { authService } from "./authService";
const authuser = JSON.parse(localStorage.getItem("user"));

export function getClients(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}clients`, requestOptions).then(
    authService.handleResponse
  );
}

export function getClientPayments(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}client/payments`, requestOptions).then(
    authService.handleResponse
  );
}

export function editClient(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(
    `${settings.API_URL}updateclient/${data.id}`,
    requestOptions
  ).then(authService.handleResponse);
}

export function deleteClient(id) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
  };
  return fetch(`${settings.API_URL}deleteclient/${id}`, requestOptions).then(
    authService.handleResponse
  );
}
