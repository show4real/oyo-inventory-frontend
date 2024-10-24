import settings from '../../services/settings';
import { authHeader } from '../../services/authHeader';
import { authService } from '../../services/authService';


let productss=()=> {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
    };
    return fetch(`${settings.API_URL}products`, requestOptions).then(authService.handleResponse);
}
export default productss;