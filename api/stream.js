export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { secure_id } = req.body;
    
    const response = await fetch(`https://api.github.com/repos/${process.env.GH_OWNER}/${process.env.GH_REPO}/dispatches`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GH_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
            event_type: 'start_stream',
            client_payload: { secure_id: secure_id }
        })
    });

    if (response.ok) {
        res.status(200).json({ success: true });
    } else {
        res.status(500).json({ error: "Failed to trigger GitHub Actions" });
    }
}
