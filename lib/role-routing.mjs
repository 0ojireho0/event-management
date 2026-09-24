export function getRoleHome(role) {
  if (role === "Admin") return "/";
  if (role === "Scanner") return "/scanner";
  return null;
}

export function canAccessRoute(role, pathname) {
  if (role === "Admin") {
    return pathname === "/" || pathname === "/manage-users" || pathname === "/scanner";
  }
  if (role === "Scanner") return pathname === "/scanner";
  return false;
}

export function getNavigationForRole(role) {
  if (role === "Admin") {
    return [
      { label: "Dashboard", href: "/" },
      { label: "Check In & Scanner", href: "/scanner" },
    ];
  }
  if (role === "Scanner") return [{ label: "Check In & Scanner", href: "/scanner" }];
  return [];
}
