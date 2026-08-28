type IconProps = { size?: number; title?: string };

export function BagIcon({ size = 20, title = "Корзина" }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}><title>{title}</title><path d="M5 8.5h14l-1 12H6l-1-12Z" stroke="currentColor" strokeWidth="1.6"/><path d="M9 10V6a3 3 0 0 1 6 0v4" stroke="currentColor" strokeWidth="1.6"/></svg>;
}

export function ArrowIcon({ size = 18, title = "" }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true}><path d="M5 12h13M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export function SparkIcon({ size = 22, title = "" }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true}><path d="M12 2c.7 5.4 3.5 8.3 9 9-5.5.7-8.3 3.6-9 11-.7-7.4-3.5-10.3-9-11 5.5-.7 8.3-3.6 9-9Z" stroke="currentColor" strokeWidth="1.3"/></svg>;
}

export function CloseIcon({ size = 20, title = "" }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true}><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}

export function MinusIcon({ size = 16, title = "" }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true}><path d="M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}

export function PlusIcon({ size = 16, title = "" }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true}><path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
