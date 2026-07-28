export async function sendOrderSMS(phoneNumber, message) {
  const apiKey = process.env.NEXT_PUBLIC_FAST2SMS_API_KEY;

  if (!apiKey) {
    throw new Error('Fast2SMS API key is missing from environment variables.');
  }

  try {
    console.log('Sending SMS to:', phoneNumber); // Debugging ke liye
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        language: 'english',
        numbers: phoneNumber,
      }),
    });

    const data = await res.json();
    console.log('Fast2SMS Response:', data); // Response check karne ke liye
    return data;
  } catch (error) {
    console.error('Detailed Fetch Error:', error.message);
    return { success: false, error: error.message };
  }
}