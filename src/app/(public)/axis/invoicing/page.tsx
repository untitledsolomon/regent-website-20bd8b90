import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { AxisModulePage } from '@/components/AxisModulePage'
import { AXIS_MODULES } from '@/lib/axisModules'

const mod = AXIS_MODULES.find((m) => m.slug === 'invoicing')!

export const metadata: Metadata = {
  title: { absolute: mod.title },
  description: mod.description,
  openGraph: {
    title: mod.ogTitle,
    description: mod.description,
    type: 'website',
    url: '/axis/invoicing',
    images: [{ url: '/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: mod.ogTitle,
    description: mod.description,
    images: ['/og-image.png']
  },
  alternates: {
    canonical: '/axis/invoicing',
  },
}

export default function AxisInvoicingPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Axis', href: '/axis' }, { name: 'Invoicing', href: '/axis/invoicing' }]} />
      <AxisModulePage module={mod} />
    </>
  )
}
