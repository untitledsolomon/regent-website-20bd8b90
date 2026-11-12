import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { AxisModulePage } from '@/components/AxisModulePage'
import { AXIS_MODULES } from '@/lib/axisModules'

const mod = AXIS_MODULES.find((m) => m.slug === 'hr')!

export const metadata: Metadata = {
  title: { absolute: mod.title },
  description: mod.description,
  openGraph: {
    title: mod.ogTitle,
    description: mod.description,
    type: 'website',
    url: '/axis/hr',
  },
  twitter: {
    card: 'summary_large_image',
    title: mod.ogTitle,
    description: mod.description,
  },
  alternates: {
    canonical: '/axis/hr',
  },
}

export default function AxisHrPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Axis', href: '/axis' }, { name: 'HR', href: '/axis/hr' }]} />
      <AxisModulePage module={mod} />
    </>
  )
}
