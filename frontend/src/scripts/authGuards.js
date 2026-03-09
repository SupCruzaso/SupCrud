/**
 * SupCrud Security Guard
 * Protege las rutas según el rol y la existencia del JWT.
 */

(function () {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}"); // Suponiendo que guardas el user al loguear
  const currentPath = window.location.pathname;

  // 1. Verificar si existe el token
  if (!token) {
    console.warn("Acceso denegado: No hay token.");
    window.location.href = "/frontend/src/pages/workspace/login.html";
    return;
  }

  // 2. Control de Acceso por Rol (RBAC)
  // Si la ruta es de 'owner' pero el usuario no es OWNER, lo mandamos al dashboard normal
  if (currentPath.includes("/pages/owner/") && user.role !== "OWNER") {
    console.error("Acceso prohibido: Se requiere rol de OWNER.");
    window.location.href = "/frontend/src/pages/workspace/dashboard.html";
    return;
  }

  // 3. Verificar expiración (Opcional si el backend ya lo hace, pero pro para la UI)
  const payload = JSON.parse(atob(token.split(".")[1]));
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp < now) {
    alert("Tu sesión ha expirado.");
    localStorage.clear();
    window.location.href = "/frontend/src/pages/workspace/login.html";
  }
})();
