import settings from './settings';
import { authHeader } from './authHeader';
import { authService } from './authService';

export function searchUsers(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}searchusers`, requestOptions).then(authService.handleResponse);
}

export function getUsers(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}users`, requestOptions).then(authService.handleResponse);
}

export function addUser(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}adduser`, requestOptions).then(authService.handleResponse);
}

export function getUser(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${settings.API_URL}user/${id}`, requestOptions).then(authService.handleResponse);
}

export function getDashboardDetails(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}dashboards`, requestOptions).then(authService.handleResponse);
}

export function updateUser(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}updateuser/${data.id}`, requestOptions).then(authService.handleResponse);
}

export function deleteUser(id) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader()
    };
    return fetch(`${settings.API_URL}deleteuser/${id}`, requestOptions).then(authService.handleResponse);
}

