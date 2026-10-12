import { store } from '../app/store';
import { setAdminLogout } from '../app/slice/adminAuthSlice';
import { setEmployeeLogout } from '../app/slice/employeeAuth';
import { setVendorLogout } from '../app/slice/vendorAuth';
import { setUserLogout } from '../app/slice/userSlice';
import { setEmployeeSignOut as clearEmployeeToken } from '../app/slice/authSlice';
import { setEmployeeSignOut as clearEmployeeData } from '../app/slice/employeeSlice';
import { setLogOut } from '../app/slice/authSlice';

function clearCookies() {
    if (typeof document === 'undefined') return;
    document.cookie.split(';').forEach((entry) => {
        const name = entry.split('=')[0]?.trim();
        if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
    });
}

export function clearWebSession() {
    store.dispatch(setAdminLogout());
    store.dispatch(setEmployeeLogout());
    store.dispatch(setVendorLogout());
    store.dispatch(setUserLogout());
    store.dispatch(clearEmployeeToken());
    store.dispatch(clearEmployeeData());
    store.dispatch(setLogOut());

    if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
    }
    clearCookies();
}
