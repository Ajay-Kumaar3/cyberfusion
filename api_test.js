
const API_KEY = "AIzaSyAE5WCnPqS0_v358E8dRYnlyLfevKEqk9A";
const URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

async function test() {
  console.log("Pinging Gemini...");
  try {
    const resp = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "API Check: Respond with SUCCESS" }] }] })
    });
    const data = await resp.json();
    if (data.candidates) {
      console.log("SUCCESS:", data.candidates[0].content.parts[0].text);
    } else {
      console.log("FAILURE:", JSON.stringify(data));
    }
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}
test();
