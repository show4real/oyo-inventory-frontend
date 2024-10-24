import settings from './settings';

export function authHeader() {
    let user = JSON.parse(localStorage.getItem('user'));

    if (user && user.token) {
        return {
          'Content-Type': 'application/json',
          'Accept' : 'application/json',
          'Authorization': 'Bearer ' + user.token,
          'X-Client-Version': settings.VERSION,
          'X-Client-Type': 'web'
        };
    } else {
      return {
        'Content-Type': 'application/json',
        'X-Client-Version': settings.VERSION,
        'X-Client-Type': 'web'
      };
    }
}
