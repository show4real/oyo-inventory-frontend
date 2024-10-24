
import settings from './settings';
import { authHeader } from './authHeader';
import { authService } from './authService';

export function addCompanyProfile(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}addcompany`, requestOptions).then(authService.handleResponse);
}

export function getCompany() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${settings.API_URL}company`, requestOptions).then(authService.handleResponse);
}