import settings from './settings';
import { authHeader } from './authHeader';
import { authService } from './authService';


export function getBranches(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}branches`, requestOptions).then(authService.handleResponse);
}

export function addBranches(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}addbranches`, requestOptions).then(authService.handleResponse);
}

export function editBranch(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}updatebranch/${data.id}`, requestOptions).then(authService.handleResponse);
}


