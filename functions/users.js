"use client";

import useSWR from "swr";

import api from "@/lib/api";

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/users",
    () => api.get("/api/users").then((response) => response.data.data),
  );

  const createUser = async (payload) => {
    const response = await api.post("/api/users", payload);
    await mutate();
    return response.data.data;
  };

  const updateUser = async (id, payload) => {
    const response = await api.put(`/api/users/${id}`, payload);
    await mutate();
    return response.data.data;
  };

  const deleteUser = async (id) => {
    await api.delete(`/api/users/${id}`);
    await mutate();
  };

  return {
    users: data || [],
    error,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
  };
}
