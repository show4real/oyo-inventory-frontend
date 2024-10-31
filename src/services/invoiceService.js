import settings from "./settings";
import { authHeader } from "./authHeader";
import { authService } from "./authService";
const authuser = JSON.parse(localStorage.getItem("user"));

export function getInvoices(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };

  if (authuser && authuser.admin === 1) {
    return fetch(`${settings.API_URL}invoices`, requestOptions).then(
      authService.handleResponse
    );
  } else {
    return fetch(`${settings.API_URL}invoices2`, requestOptions).then(
      authService.handleResponse
    );
  }
}

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

export function getAllClients(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}all/clients`, requestOptions).then(
    authService.handleResponse
  );
}

export function getCashiers(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}cashiers`, requestOptions).then(
    authService.handleResponse
  );
}

export function addInvoice(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}addinvoice`, requestOptions).then(
    authService.handleResponse
  );
}

export function addClient(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}addclient`, requestOptions).then(
    authService.handleResponse
  );
}

export function addPayment(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}addpayment`, requestOptions).then(
    authService.handleResponse
  );
}

export function updatePayment(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}updatepayment`, requestOptions).then(
    authService.handleResponse
  );
}

export function getInvoice(id) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  if (authuser && authuser.admin === 1) {
    return fetch(`${settings.API_URL}invoice/${id}`, requestOptions).then(
      authService.handleResponse
    );
  } else {
    return fetch(`${settings.API_URL}invoice2/${id}`, requestOptions).then(
      authService.handleResponse
    );
  }
}

export function getInvoiceId() {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  return fetch(`${settings.API_URL}last_invoice`, requestOptions).then(
    authService.handleResponse
  );
}

export function updateInvoice(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(
    `${settings.API_URL}updateinvoice/${data.id}`,
    requestOptions
  ).then(authService.handleResponse);
}

export function deleteInvoice(id) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
  };
  return fetch(`${settings.API_URL}deleteinvoice/${id}`, requestOptions).then(
    authService.handleResponse
  );
}
