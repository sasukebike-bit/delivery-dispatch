import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user?.role !== "DRIVER") redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg text-primary">配車管理</h1>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {session.user?.name ?? session.user?.email}
          </p>
          <p className="text-xs text-muted-foreground">ドライバー</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/driver/dashboard"
            className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ダッシュボード
          </Link>
          <Link
            href="/driver/orders"
            className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            担当注文一覧
          </Link>
        </nav>
        <Separator />
        <div className="p-3">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
              ログアウト
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
