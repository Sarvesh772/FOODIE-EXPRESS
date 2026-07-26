import './globals.css'
import Script from 'next/script'
import SupportWidget from '@/components/SupportWidget'

export const metadata = {
  title: 'Foodie Express - Fast Food Delivery Under 5km',
  description: 'Fastest local food delivery at your doorstep.',
  icons: {
    icon: '/favicon.png',      // Browser tab icon
    shortcut: '/favicon.png',  // Shortcut icon
    apple: '/favicon.png',     // iOS Apple Touch icon
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Floating Help & Support Widget */}
        <SupportWidget restaurantPhone="918957903863" />
        
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}