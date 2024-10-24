import settings from './settings';
import { authHeader } from './authHeader';
import { authService } from './authService';
const authuser=JSON.parse(localStorage.getItem('user'));

export function getCreditors(data) {
   
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    
    return fetch(`${settings.API_URL}creditors`, requestOptions).then(authService.handleResponse);
  
}

export function getExpenses(data) {
   
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    
    return fetch(`${settings.API_URL}expenses`, requestOptions).then(authService.handleResponse);
  
}

export function getProducts(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}products`, requestOptions).then(authService.handleResponse);
}

export function getCashiers(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}cashiers`, requestOptions).then(authService.handleResponse);
}

export function addPayment(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}add/creditor/payment`, requestOptions).then(authService.handleResponse);
}

export function addExpense(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}add/expense`, requestOptions).then(authService.handleResponse);
}

export function updatePayment(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}update/creditor/payment`, requestOptions).then(authService.handleResponse);
}

export function updateExpense(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}update/expense`, requestOptions).then(authService.handleResponse);
}


export function getCreditor(id) {
    
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${settings.API_URL}creditor/${id}`, requestOptions).then(authService.handleResponse);
    
}

