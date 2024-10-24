import settings from './settings';
import { authHeader } from './authHeader';
import { authService } from './authService';


export function getSuppliers(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}suppliers`, requestOptions).then(authService.handleResponse);
}

export function addSuppliers(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}addsuppliers`, requestOptions).then(authService.handleResponse);
}

export function getSupplier(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${settings.API_URL}supplier/${id}`, requestOptions).then(authService.handleResponse);
}

export function updateSupplier(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}updatesupplier/${data.id}`, requestOptions).then(authService.handleResponse);
}

export function deleteSupplier(id) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader()
    };
    return fetch(`${settings.API_URL}deletesupplier/${id}`, requestOptions).then(authService.handleResponse);
}



