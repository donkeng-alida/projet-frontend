// Appel API pour récupérer le cycle du coordonnateur
export async function fetchCoordinatorCycle(token) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const res = await fetch(`${apiBase}/api/accounts/coordinator/cycle/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error('Impossible de récupérer le cycle du coordonnateur');
  const data = await res.json();
  // On suppose que la réponse est { cycle: "BTS" }
  return data.cycle;
}
