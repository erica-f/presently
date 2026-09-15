import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type IconPosition = 'left' | 'right'

type ButtonBaseProps = {
  children: ReactNode
  className?: string
  icon?: ReactNode
  iconPosition?: IconPosition
  variant?: ButtonVariant
}

type ButtonProps = ButtonBaseProps & (
  | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps | 'href'>)
  | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps>)
)

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-active',
  secondary: 'gap-2 border-2 border-primary bg-transparent text-primary hover:bg-primary/5 active:bg-primary/10',
  ghost: 'gap-1.5 bg-transparent text-muted-foreground hover:bg-secondary/40 hover:text-primary active:bg-secondary',
}

/*
 * Primary is the default; secondary and ghost are also available.
 * Icons go on the left unless you set iconPosition="right". Use className
 * for layout tweaks like w-full. Native button props such as onClick and
 * disabled work as usual. Set href to render a link with the same styling.
 */
export function Button({
  className = '',
  children,
  icon,
  iconPosition = 'left',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const iconElement = icon ? (
    <span
      aria-hidden="true"
      className={`inline-flex size-3.5 shrink-0 items-center justify-center ${variant === 'primary' ? 'text-accent' : ''}`}
    >
      {icon}
    </span>
  ) : null

  const sharedClasses = `inline-flex box-border items-center justify-center rounded-button border border-transparent px-4 py-2.5 text-xs leading-4 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:border-transparent disabled:bg-border/60 disabled:text-muted-foreground disabled:shadow-none disabled:hover:bg-border/60 disabled:hover:text-muted-foreground ${variantClasses[variant]} ${className}`
  const content = (
    <>
      {iconPosition === 'left' && iconElement}
      {children}
      {iconPosition === 'right' && iconElement}
    </>
  )

  if ('href' in props && typeof props.href === 'string') {
    const { href, ...anchorProps } = props as { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
    return <a className={sharedClasses} href={href} {...anchorProps}>{content}</a>
  }

  const { type: buttonType = 'button', ...buttonProps } = props as ButtonHTMLAttributes<HTMLButtonElement>
  return <button className={sharedClasses} type={buttonType} {...buttonProps}>{content}</button>
}
