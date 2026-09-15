import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type IconPosition = 'left' | 'right'

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode
  icon?: ReactNode
  iconPosition?: IconPosition
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-active',
  secondary: 'gap-2 border-2 border-primary bg-transparent text-primary hover:bg-primary/5 active:bg-primary/10',
  ghost: 'gap-1.5 bg-transparent text-muted-foreground hover:bg-secondary/40 hover:text-primary active:bg-secondary',
}

/*
 * Import Button from './components/Button' (adjust the path if needed).
 * Primary is the default; secondary and ghost are also available.
 * Icons go on the left unless you set iconPosition="right". Use className
 * for layout tweaks like w-full. Native props such as onClick and disabled
 * work as usual; set type="submit" when the button should submit a form.
 *
 * <Button>Call to Action</Button>
 * <Button variant="ghost" icon={<span>&larr;</span>}>Back</Button>
 * <Button variant="secondary" icon={<span>&#127873;</span>} iconPosition="right">Gift</Button>
 */
export function Button({
  className = '',
  children,
  icon,
  iconPosition = 'left',
  type = 'button',
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

  return (
    <button
      className={`inline-flex box-border items-center justify-center rounded-button border border-transparent px-4 py-2.5 text-xs leading-4 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:border-transparent disabled:bg-border/60 disabled:text-muted-foreground disabled:shadow-none disabled:hover:bg-border/60 disabled:hover:text-muted-foreground ${variantClasses[variant]} ${className}`}
      type={type}
      {...props}
    >
      {iconPosition === 'left' && iconElement}
      {children}
      {iconPosition === 'right' && iconElement}
    </button>
  )
}
