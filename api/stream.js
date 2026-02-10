export default async function handler(req, res) {
    // শুধুমাত্র POST রিকোয়েস্ট অ্যালাউ করা হচ্ছে
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { secure_id } = req.body;

    // ইউআরএল মিসিং থাকলে এরর দিবে
    if (!secure_id) {
        return res.status(400).json({ error: 'Secure ID (Encoded URL) is required' });
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${process.env.GH_OWNER}/${process.env.GH_REPO}/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GH_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_type: 'start_stream', // এটি আপনার main.yml এর types এর সাথে মিল থাকতে হবে
                client_payload: { 
                    secure_id: secure_id 
                }
            })
        });

        if (response.ok) {
            // সাকসেস মেসেজ
            return res.status(200).json({ 
                success: true, 
                message: "Deployment signal sent to The Challengers engine!" 
            });
        } else {
            const errorData = await response.json();
            console.error('GitHub API Error:', errorData);
            return res.status(response.status).json({ 
                error: "GitHub Action trigger failed", 
                details: errorData.message 
            });
        }
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
