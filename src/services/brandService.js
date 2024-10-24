import settings from './settings';
import { authHeader } from './authHeader';
import { authService } from './authService';


export function getbrands(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}brands`, requestOptions).then(authService.handleResponse);
}

export function addBrands(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}addbrands`, requestOptions).then(authService.handleResponse);
}

export function editBrand(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}updatebrand/${data.id}`, requestOptions).then(authService.handleResponse);
}


