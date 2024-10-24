import settings from './settings';
import { authHeader } from './authHeader';
import { authService } from './authService';


export function addPImage(data) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(data)
    };
    return fetch(`${settings.API_URL}product/image/${data.product_id}`, requestOptions).then(authService.handleResponse);
}