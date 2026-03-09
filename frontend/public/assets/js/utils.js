// Funciones globales de utilidad
const SupCrudUtils = {
  // Guardar el workspace seleccionado para que el Dashboard sepa qué cargar
  setSelectedWorkspace: (wsId) => {
    sessionStorage.setItem("selectedWorkspaceId", wsId);
  },

  getSelectedWorkspace: () => {
    return sessionStorage.getItem("selectedWorkspaceId");
  },

  // Formateador de estados (Active/Suspended)
  formatStatus: (status) => {
    const styles = {
      ACTIVE: "bg-accent/10 text-accent border-accent/25",
      SUSPENDED: "bg-warn/10 text-warn border-warn/25",
    };
    return styles[status] || "bg-muted/10 text-muted border-muted/25";
  },
};
