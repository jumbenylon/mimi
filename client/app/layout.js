import './globals.css'

export const metadata = {
  title: 'MIMI Mobile',
  description: 'Institutional Grade Finance',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
