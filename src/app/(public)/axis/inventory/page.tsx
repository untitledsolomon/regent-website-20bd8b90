import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { AxisModulePage } from '@/components/AxisModulePage'
import { AXIS_MODULES } from '@/lib/axisModules'

const mod = AXIS_MODULES.find((m) => m.slug === 'inventory')!

export const metadata: Metadata = {
  title: { absolute: mod.title },
  description: mod.description,
  openGraph: {
    title: mod.ogTitle,
    description: mod.description,
    type: 'website',
    url: '/axis/inventory',
  },
  twitter: {
    card: 'summary_large_image',
    title: mod.ogTitle,
    description: mod.description,
  },
  alternates: {
    canonical: '/axis/inventory',
  },
}

export default function AxisInventoryPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Axis', href: '/axis' }, { name: 'Inventory', href: '/axis/inventory' }]} />
      <AxisModulePage module={mod} />
    </>
  )
}
