import type { AnchorHTMLAttributes } from "react";
import { sitePath } from "../lib/site-path";

type InternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
};

export function InternalLink({ href, children, ...props }: InternalLinkProps) {
  return <a href={sitePath(href)} {...props}>{children}</a>;
}
