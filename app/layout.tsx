import { Analytics } from '@vercel/analytics/react'
import './globals.css' // Ou o arquivo de CSS que você usa

export const metadata = {
  title: 'PeixeBook - Trilhas do Rio',
  description: 'O portal oficial de recordes e resenha da pesca esportiva',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        {/* Este é o sensor que conta os acessos dos pescadores */}
        <Analytics />
      </body>
    </html>
  )
}
