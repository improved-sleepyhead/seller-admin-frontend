import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios"

import { getApiBaseUrl } from "@/shared/config"

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
})

apiClient.interceptors.request.use(config => {
  if (!config.signal) {
    throw new Error("AbortSignal is required for every API request.")
  }

  return config
})

export type ApiRequestConfig<TData = unknown> = Omit<
  AxiosRequestConfig<TData>,
  "signal"
> & {
  signal: AbortSignal
}

export async function apiRequest<TResponse, TData = unknown>(
  config: ApiRequestConfig<TData>
): Promise<TResponse> {
  const response = await apiClient.request<
    TResponse,
    AxiosResponse<TResponse>,
    TData
  >(config)
  return response.data
}

export function apiGet<TResponse>(
  url: string,
  signal: AbortSignal,
  config?: Omit<AxiosRequestConfig, "url" | "method" | "signal">
): Promise<TResponse> {
  return apiRequest<TResponse>({
    ...(config ?? {}),
    method: "get",
    signal,
    url
  })
}

export function apiDelete<TResponse>(
  url: string,
  signal: AbortSignal,
  config?: Omit<AxiosRequestConfig, "url" | "method" | "signal">
): Promise<TResponse> {
  return apiRequest<TResponse>({
    ...(config ?? {}),
    method: "delete",
    signal,
    url
  })
}

export function apiPost<TResponse, TData = unknown>(
  url: string,
  data: TData,
  signal: AbortSignal,
  config?: Omit<AxiosRequestConfig<TData>, "url" | "method" | "data" | "signal">
): Promise<TResponse> {
  return apiRequest<TResponse, TData>({
    ...(config ?? {}),
    data,
    method: "post",
    signal,
    url
  })
}

export function apiPut<TResponse, TData = unknown>(
  url: string,
  data: TData,
  signal: AbortSignal,
  config?: Omit<AxiosRequestConfig<TData>, "url" | "method" | "data" | "signal">
): Promise<TResponse> {
  return apiRequest<TResponse, TData>({
    ...(config ?? {}),
    data,
    method: "put",
    signal,
    url
  })
}
