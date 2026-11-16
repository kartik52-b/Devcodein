import { Link } from 'react-router-dom';

/**
 * Button — the single button primitive for DevVerse.
 *
 * Variants (max five): primary | secondary | tertiary | ghost | danger
 * Sizes (modifiers):  sm | md | lg | icon
 *
 * Renders a react-router <Link> when `to` is provided, an <a> when `href` is
 * provided, and a <button> otherwise, so styling never drifts between CTAs.
 */
const VARIANTS = new Set(['primary', 'secondary', 'tertiary', 'ghost', 'danger']);
const SIZES = new Set(['sm', 'md', 'lg', 'icon']);

export function buttonClasses({ variant = 'secondary', size = 'md', className = '' } = {}) {
  return [
    'btn',
    `btn-${VARIANTS.has(variant) ? variant : 'secondary'}`,
    size !== 'md' && SIZES.has(size) ? `btn-${size}` : '',
    className
  ]
    .filter(Boolean)
    .join(' ');
}

function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  to,
  href,
  type,
  children,
  ...props
}) {
  const classes = buttonClasses({ variant, size, className });

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type || 'button'} className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
