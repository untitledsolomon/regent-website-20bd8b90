interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}

export function SectionHeader({ label, title, subtitle, center }: SectionHeaderProps) {
  return (
    <div className={`mb-14 ${center ? 'text-center' : 'text-left'}`}>
      {label && (
        <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-primary mb-4">
          {label}
        </div>
      )}
      <h2 className={`text-[clamp(28px,4vw,48px)] font-heading font-semibold tracking-[-0.03em] leading-[1.1] text-text-primary mb-4 ${center ? 'max-w-[640px] mx-auto' : ''}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg font-light text-text-secondary leading-relaxed max-w-[600px] ${center ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
