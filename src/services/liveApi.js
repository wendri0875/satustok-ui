

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export async function getLiveStatus(token) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const res = await fetch(`${backendUrl}/ai/live/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  return res.json();
}

export async function getLiveComments() {
  const res = await fetch(`${backendUrl}/ai/live/comments`);
  return res.json();
}