export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
      <span className="animate-bounce text-5xl" role="img" aria-label="Studying owl">
        🦉
      </span>
      <p className="text-sm text-gray-500">Hooting up your notes...</p>
    </div>
  );
}
