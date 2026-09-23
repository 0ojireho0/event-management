"use client";

import useSWR from "swr";

import api from "@/lib/api";

export async function getAuthenticatedUser() {
  const { data } = await api.get("/api/user");

  return data;
}

export async function login(credentials) {
  await api.get("/sanctum/csrf-cookie");
  await api.post("/api/login", credentials);

  return getAuthenticatedUser();
}

export async function logout() {
  await api.post("/api/logout");
}

export function useAuthenticatedUser() {
  return useSWR("authenticated-user", getAuthenticatedUser, {
    refreshInterval: (currentUser) => (currentUser ? 5000 : 0),
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshWhenHidden: false,
    shouldRetryOnError: false,
  });
}

export function getApiErrorMessage(error, fallbackMessage) {
  const errors = error.response?.data?.errors;

  if (errors) {
    return Object.values(errors).flat().join("\n");
  }

  return error.response?.data?.message || fallbackMessage;
}
