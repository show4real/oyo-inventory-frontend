import settings from './settings';
import { authHeader } from './authHeader';
import { authService } from './authService';


export function getcategories(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}categories`, requestOptions).then(authService.handleResponse);
}

export function addCategories(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}addcategories`, requestOptions).then(authService.handleResponse);
}
export function editCategory(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}updatecategory/${data.id}`, requestOptions).then(authService.handleResponse);
}


