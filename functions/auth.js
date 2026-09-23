"use client";

import useSWR from "swr";

import api from "@/lib/api";

async function getAuthenticatedUser() {
  try {
    const { data } = await api.get("/api/user");

    return data;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }

    throw error;
  }
}

export function useAuth() {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/user", getAuthenticatedUser, {
    refreshInterval: (currentUser) => (currentUser ? 5000 : 0),
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshWhenHidden: false,
    shouldRetryOnError: false,
  });

  const csrf = () => api.get("/sanctum/csrf-cookie");

  const login = async (credentials) => {
    await csrf();
    await api.post("/api/login", credentials);
    await mutate();
  };

  const logout = async () => {
    await api.post("/api/logout");
    await mutate(null, { revalidate: false });
  };

  return {
    user,
    error,
    isLoading,
    login,
    logout,
  };
}

export function getApiErrorMessage(error, fallbackMessage) {
  const errors = error.response?.data?.errors;

  if (errors) {
    return Object.values(errors).flat().join("\n");
  }

  return error.response?.data?.message || fallbackMessage;
}
