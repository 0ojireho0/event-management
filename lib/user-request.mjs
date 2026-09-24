export async function runUserRequest(request, revalidateUser) {
  try {
    return await request();
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      try {
        await revalidateUser();
      } catch {
        // The original request failure is what the caller needs to handle.
      }
    }

    throw error;
  }
}
