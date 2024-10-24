import settings from './settings';
import { authHeader } from './authHeader';
import { authService } from './authService';


export function getattributes(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}attributes`, requestOptions).then(authService.handleResponse);
}




export function addAttribute(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}addattributes`, requestOptions).then(authService.handleResponse);
}




