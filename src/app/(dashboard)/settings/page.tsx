import { auth } from "@/lib/auth/auth";
import { withMinDelay } from "@/lib/utils/min-delay";
import { MascotPicker } from "@/components/settings/MascotPicker";

export default async function SettingsPage() {
  const session = await withMinDelay(auth());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">⚙️ Settings</h1>
      <div className="max-w-md space-y-2 text-sm">
        <div>
          <span className="text-gray-500">Name: </span>
          {session?.user.name ?? "—"}
        </div>
        <div>
          <span className="text-gray-500">Email: </span>
          {session?.user.email}
        </div>
      </div>
      <MascotPicker />
    </div>
  );
}
