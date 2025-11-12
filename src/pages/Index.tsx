import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Shield, LayoutDashboard } from "lucide-react";
import { Layout } from "@/components/Layout";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout title="Dashboard" icon={LayoutDashboard}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg border p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-bold mb-2">¡Bienvenido al Sistema!</h2>
          <p className="text-muted-foreground mb-6">
            Has iniciado sesión exitosamente. Utiliza el menú lateral para navegar entre los módulos.
          </p>
          <div className="text-left max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
            <p>✓ Autenticación segura configurada</p>
            <p>✓ Sistema de roles y permisos activo</p>
            <p>✓ Auditoría de accesos habilitada</p>
            <p>✓ Validación de entrada robusta</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
