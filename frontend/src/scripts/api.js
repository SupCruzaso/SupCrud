async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  options.headers = { ...defaultHeaders, ...options.headers };

  const response = await fetch(url, options);

  if (response.status === 401 || response.status === 403) {
    localStorage.clear();
    window.location.href = "/frontend/src/pages/workspace/login.html";
    return;
  }
  return response;
}
