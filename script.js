document.addEventListener('DOMContentLoaded', () => {
    // Webhook URL
    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1466803005214036113/uWgzBMMii_-cGY3jr-8g6rpEHb8fwQYPhMY_t4DGGQnD5AIOvE3epfKKf8-XweZinFEa';

    // Simple visit notifier (Real-time)
    // NOTE: This runs on every page load.
    // Daily aggregated notification at 24:00 requires a backend/server script (like GAS).
    // The code below sends a notification immediately upon visit.

    function notifyVisit() {
        const payload = {
            content: `📢 **We have a new visitor!** \nTime: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`
        };

        fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                console.log('Notification sent to Discord.');
            } else {
                console.error('Failed to send notification:', response.status);
            }
        })
        .catch(error => console.error('Error sending notification:', error));
    }

    // Attempt to notify
    notifyVisit();
});
