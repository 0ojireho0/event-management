"use client";

import useSWR, { useSWRConfig } from "swr";

import api from "@/lib/api";
import { runUserRequest } from "@/lib/user-request.mjs";

export function useUsers() {
  const { mutate: mutateCache } = useSWRConfig();
  const revalidateUser = () => mutateCache("/api/user");
  const { data, error, isLoading, mutate } = useSWR(
    "/api/users",
    () => runUserRequest(() => api.get("/api/users").then((response) => response.data.data), revalidateUser),
  );

  const createUser = async (payload) => {
    const response = await runUserRequest(() => api.post("/api/users", payload), revalidateUser);
    await mutate();
    return response.data.data;
  };

  const updateUser = async (id, payload) => {
    const response = await runUserRequest(() => api.put(`/api/users/${id}`, payload), revalidateUser);
    await mutate();
    return response.data.data;
  };

  const deleteUser = async (id) => {
    await runUserRequest(() => api.delete(`/api/users/${id}`), revalidateUser);
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
