/** Ensures `promise` takes at least `ms` to resolve, so a loading state has time to actually be seen. */
export async function withMinDelay<T>(promise: Promise<T>, ms = 600): Promise<T> {
  const [result] = await Promise.all([promise, new Promise((resolve) => setTimeout(resolve, ms))]);
  return result;
}
