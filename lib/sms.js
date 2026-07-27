// 📱 Fast2SMS Integration Utility Function
export async function sendOrderSMS(phone, message) {
  const apiKey = process.env.NEXT_PUBLIC_FAST2SMS_API_KEY

  if (!apiKey) {
    console.warn('Fast2SMS API Key missing in env file!')
    return
  }

  // Phone number me se sirf digits rakho (10 digit format)
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10)

  if (cleanPhone.length !== 10) {
    console.error('Invalid phone number for SMS:', phone)
    return
  }

  try {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q', // Quick SMS Route
        message: message,
        language: 'english',
        flash: 0,
        numbers: cleanPhone,
      }),
    })

    const data = await res.json()
    console.log('Fast2SMS Response:', data)
    return data
  } catch (error) {
    console.error('Error sending Fast2SMS:', error)
  }
}