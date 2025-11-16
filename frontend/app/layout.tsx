import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BadgerFlix - Netflix for University Lectures',
  description: 'AI-Generated Episodes, AI Tutor, and Anonymous Q&A for Introverts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


