import settings from "./settings";
import { authHeader } from "./authHeader";
import { authService } from "./authService";

const authuser = JSON.parse(localStorage.getItem("user"));

export function addSales(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}pos_order`, requestOptions).then(
    authService.handleResponse
  );
}

export function editSales(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}edit/pos_order`, requestOptions).then(
    authService.handleResponse
  );
}

export function getProducts() {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
  };
  return fetch(`${settings.API_URL}pos/products`, requestOptions).then(
    authService.handleResponse
  );
}

export function getPosTransactions(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  if (authuser && authuser.admin === 1) {
    return fetch(`${settings.API_URL}pos_sales`, requestOptions).then(
      authService.handleResponse
    );
    //return fetch(`${settings.API_URL}invoice/${id}`, requestOptions).then(authService.handleResponse);
  } else {
    return fetch(`${settings.API_URL}pos_sales2`, requestOptions).then(
      authService.handleResponse
    );
  }
}

export function getTransactionDetails(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };

  if (authuser && authuser.admin === 1) {
    return fetch(`${settings.API_URL}transaction_details`, requestOptions).then(
      authService.handleResponse
    );
  } else {
    return fetch(
      `${settings.API_URL}transaction_details2`,
      requestOptions
    ).then(authService.handleResponse);
  }
}
