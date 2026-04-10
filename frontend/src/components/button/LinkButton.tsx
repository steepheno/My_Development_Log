import type { ReactNode, MouseEvent } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import style from './Button.module.scss';

type ButtonVariant = 'primary' | 'secondary';

interface LinkButtonProps extends Omit<LinkProps, 'className'> {
  variant?: ButtonVariant;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * 페이지 이동 전용 버튼으로, react-router-dom의 Link를 내부적으로 사용함
 * 액션 실행이 목적이라면 Button을 사용할 것
 */

export function LinkButton({
  variant = 'primary',
  disabled = false,
  children,
  className,
  onClick,
  to,
  ...rest
}: LinkButtonProps) {
  const classes = [
    style.button,
    style[variant],
    disabled && style.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <Link
      to={to}
      className={classes}
      onClick={handleClick}
      tabIndex={disabled ? -1 : undefined}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {children}
    </Link>
  );
}