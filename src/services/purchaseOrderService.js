import settings from "./settings";
import { authHeader } from "./authHeader";
import { authService } from "./authService";

export function getPurchaseOrders(id) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
  };
  return fetch(
    `${settings.API_URL}product/${id}/purchase_orders`,
    requestOptions
  ).then(authService.handleResponse);
}

export function getAllPurchaseOrders(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}purchase_orders`, requestOptions).then(
    authService.handleResponse
  );
}

export function editSerialNo(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(
    `${settings.API_URL}purchase_order/editserial/${data.id}`,
    requestOptions
  ).then(authService.handleResponse);
}

export function editPrice(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(
    `${settings.API_URL}purchase_order/editprice`,
    requestOptions
  ).then(authService.handleResponse);
}

export function moreOrder(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(
    `${settings.API_URL}purchase_order/add-more`,
    requestOptions
  ).then(authService.handleResponse);
}

export function getSerialNos(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(
    `${settings.API_URL}purchase_order/serials`,
    requestOptions
  ).then(authService.handleResponse);
}

export function getStock(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}stocks`, requestOptions).then(
    authService.handleResponse
  );
}

export function getSales(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}sales`, requestOptions).then(
    authService.handleResponse
  );
}

export function getSinglePurchaseOrder(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(
    `${settings.API_URL}purchase_order/${data.id}`,
    requestOptions
  ).then(authService.handleResponse);
}

export function confirmOrder(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(
    `${settings.API_URL}confirm_order/${data.id}`,
    requestOptions
  ).then(authService.handleResponse);
}

export function returnOrder(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(
    `${settings.API_URL}return_order/${data.id}`,
    requestOptions
  ).then(authService.handleResponse);
}

export function moveOrder(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}move_order/${data.id}`, requestOptions).then(
    authService.handleResponse
  );
}

export function saleOrder(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}sale_order/${data.id}`, requestOptions).then(
    authService.handleResponse
  );
}

export function addSales(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}sale_order`, requestOptions).then(
    authService.handleResponse
  );
}

export function filterAttributes(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}filtered_attributes`, requestOptions).then(
    authService.handleResponse
  );
}

export function addPurchaseOrder(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(`${settings.API_URL}purchase_order`, requestOptions).then(
    authService.handleResponse
  );
}

export function getProduct(id) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  return fetch(`${settings.API_URL}product/${id}`, requestOptions).then(
    authService.handleResponse
  );
}

export function updatePurchaseOrder(data) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  };
  return fetch(
    `${settings.API_URL}updatepurchase_order/${data.id}`,
    requestOptions
  ).then(authService.handleResponse);
}

export function deleteProduct(id) {
  const requestOptions = {
    method: "DELETE",
    headers: authHeader(),
  };
  return fetch(`${settings.API_URL}product/${id}`, requestOptions).then(
    authService.handleResponse
  );
}
