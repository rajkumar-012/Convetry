import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

api.interceptors.request.use(async (config: AxiosRequestConfig) => { … });
api.interceptors.response.use((res: AxiosResponse) => res, (error: AxiosError) => { … });