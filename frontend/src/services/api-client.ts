import Axios, { InternalAxiosRequestConfig } from 'axios';
import { ENVS } from "@/config/env";
import { HOT_FAIR_LOCAL_STORAGE_ACCESS_TOKEN_KEY } from '@/app/providers/auth-provider';


/**
 * The global axios API client.
 */
export const apiClient = Axios.create({
    baseURL: ENVS.REACT_APP_BASE_API_URL,
});

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
    if (config.headers) {
        config.headers.Accept = 'application/json';
    }
    return config;
}

/**
 * Interceptors
 */
apiClient.interceptors.request.use(authRequestInterceptor);
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // if unauthorized request, simply clear the local storage to log them out.
        // we can also show an alert here.
        if (!error.response) {
            console.error("Network error");
        }
        if (error.response?.status === 401) {
            console.error("Unauthorized, logging out...");
            localStorage.removeItem(HOT_FAIR_LOCAL_STORAGE_ACCESS_TOKEN_KEY)
        }
        // should we handle more errors here?
        return Promise.reject(error);
    },
);