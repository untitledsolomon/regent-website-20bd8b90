import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen" role="main">
        {children}
      </main>
      <Footer />
    </>
  )
}