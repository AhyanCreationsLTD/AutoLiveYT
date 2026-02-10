export default async function handler(req, res) {
    // শুধুমাত্র POST মেথড এলাও করা
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { secure_id, url } = req.body;

    // ভ্যালিডেশন: ভিডিওর সোর্স ছাড়া রিকোয়েস্ট প্রসেস করা হবে না
    if (!secure_id && !url) {
        return res.status(400).json({ error: 'Missing Video Identity' });
    }

    const GITHUB_TOKEN = process.env.GH_TOKEN;
    const GH_OWNER = process.env.GH_OWNER;
    const GH_REPO = process.env.GH_REPO;

    // এনভায়রনমেন্ট ভেরিয়েবল চেক (সার্ভার লেভেলে ভুল হলে ধরা পড়বে)
    if (!GITHUB_TOKEN || !GH_OWNER || !GH_REPO) {
        console.error("Missing Environment Variables");
        return res.status(500).json({ error: "Server Configuration Error" });
    }

    try {
        // GitHub API কে ট্রিগার করা
        const response = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`, // Token এর জায়গায় Bearer ব্যবহার করা স্ট্যান্ডার্ড
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_type: 'start_stream',
                client_payload: { 
                    // যদি secure_id না থাকে তবে url কেই base64 করে পাঠানো হচ্ছে ডিকোড করার সুবিধার্থে
                    secure_id: secure_id || Buffer.from(url).toString('base64'), 
                    timestamp: new Date().toISOString() // ট্র্যাকিং এর জন্য টাইমস্ট্যাম্প যোগ করা হলো
                }
            })
        });

        if (response.ok) {
            // সাকসেস মেসেজ
            return res.status(200).json({ 
                success: true, 
                message: "Stealth Engine Deployed Successfully!",
                status: "Live on Cloud" 
            });
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error("GitHub API Error:", errorData);
            return res.status(response.status).json({ 
                error: "Cloud Engine Rejected the Request", 
                details: errorData.message || "Unknown GitHub Error" 
            });
        }
    } catch (error) {
        console.error("Internal Server Error:", error);
        return res.status(500).json({ error: "Internal Connection Failed" });
    }
}
