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

export function HeartIcon({ size = 20, title = "" }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}><title>{title}</title><path d="M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity=".06"/></svg>;
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

export function SunIcon({ size = 18, title = "" }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}><title>{title}</title><circle cx="12" cy="12" r="3.7" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2.7v2M12 19.3v2M2.7 12h2M19.3 12h2M5.42 5.42l1.42 1.42M17.16 17.16l1.42 1.42M18.58 5.42l-1.42 1.42M6.84 17.16l-1.42 1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

export function MoonIcon({ size = 18, title = "" }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}><title>{title}</title><path d="M20.1 15.2A8.4 8.4 0 0 1 8.8 3.9 8.5 8.5 0 1 0 20.1 15.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
