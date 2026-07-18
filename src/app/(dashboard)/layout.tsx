import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { MascotCat } from "@/components/MascotCat";
import { AskVelora } from "@/components/AskVelora";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <DashboardNav userLabel={session.user.email ?? session.user.name ?? "Account"} />
      <div className="flex-1 px-6 py-8">{children}</div>
      <MascotCat />
      <AskVelora />
    </div>
  );
}
