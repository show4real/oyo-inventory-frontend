import settings from './settings';
import { authHeader } from './authHeader';
import { authService } from './authService';


export function getProducts(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}products`, requestOptions).then(authService.handleResponse);
}

export function addProduct(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}product`, requestOptions).then(authService.handleResponse);
}
export function addAttributeOptions(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}addproductattributes`, requestOptions).then(authService.handleResponse);
}


export function getProduct(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch(`${settings.API_URL}product/${id}`, requestOptions).then(authService.handleResponse);
}

export function updateProduct(data) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}product/${data.id}`, requestOptions).then(authService.handleResponse);
}

export function deleteProduct(id) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader()
    };
    return fetch(`${settings.API_URL}deleteproduct/${id}`, requestOptions).then(authService.handleResponse);
}

