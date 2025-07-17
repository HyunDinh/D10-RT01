// Gọi API Gemini backend
export async function askGemini(prompt) {
  const res = await fetch('/api/ai/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error('Lỗi khi gọi Gemini backend');
  return res.text();
} 