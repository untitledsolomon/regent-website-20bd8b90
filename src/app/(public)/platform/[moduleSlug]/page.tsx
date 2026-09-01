import { notFound } from 'next/navigation'
import { modules } from '@/data/siteData'
import ModuleDetail from '@/legacy-pages/ModuleDetail'

export function generateStaticParams() {
  return modules.map((m) => ({ moduleSlug: m.slug }))
}

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>
}) {
  const { moduleSlug } = await params

  // ModuleDetail is a client component that previously handled an unknown
  // slug by rendering nothing and redirecting client-side in a useEffect.
  // That serves a 200 with blank/incomplete HTML to crawlers before the JS
  // redirect runs -- a soft 404. Guarding here on the server means an
  // invalid slug gets a real 404 status immediately.
  if (!modules.some((m) => m.slug === moduleSlug)) {
    notFound()
  }

  return <ModuleDetail />
}
