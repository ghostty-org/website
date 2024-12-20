import React from 'react';

import Link, { LinkProps } from 'next/link';

interface HashLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
}

const HashLink: React.FC<HashLinkProps> = ({ children, onClick, ...props }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = props.href.toString();
    const hash = href.split('#')[1];

    if (hash) {
      e.preventDefault();

      // Remove the hash first to force re-trigger
      window.location.hash = '';

      // Wait for the browser to update the window.location.hash
      setTimeout(() => {
        window.location.hash = hash;
      }, 0);
    }

    if (onClick) onClick(e);
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default HashLink;
