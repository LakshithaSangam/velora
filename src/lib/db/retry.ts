// Neon's free-tier database suspends itself after a period of inactivity;
// the first query after a gap can transiently fail (sometimes surfacing as
// a confusing, unrelated Prisma error) while it wakes back up, and an
// immediate retry succeeds. Wrap a write that's sensitive to this in a
// single retry rather than surfacing a misleading error to the user.
export async function withTransientRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    return await fn();
  }
}
