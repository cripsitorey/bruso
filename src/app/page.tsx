
import Link from "next/link";
import { Shield, Home, DollarSign } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Fetch profile to know where to redirect
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      if (profile.role === "admin") redirect("/admin");
      if (profile.role === "guard") redirect("/guard/scan");
      if (profile.role === "resident") redirect("/resident");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
          brusO
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Plataforma integral para la gestión de urbanizaciones.
          Seguridad, Finanzas y Comunidad en un solo lugar.
        </p>

        <div className="flex justify-center mt-8">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition shadow-lg"
          >
            Iniciar Sesión
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-400">
          MVP Demo - v0.1.0
        </div>
      </div>
    </div>
  );
}
