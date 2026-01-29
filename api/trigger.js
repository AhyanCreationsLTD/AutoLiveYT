export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { url } = req.body;
    const GITHUB_TOKEN = process.env.GH_TOKEN;
    const GH_OWNER = process.env.GH_OWNER;
    const GH_REPO = process.env.GH_REPO;

    const response = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/dispatches`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event_type: 'start_stream',
            client_payload: { url: url }
        })
    });

    if (response.ok) {
        res.status(200).json({ success: true });
    } else {
        const errorData = await response.text();
        res.status(500).json({ error: "Failed to trigger engine", details: errorData });
    }
}
