import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type LogoProps = {
  to?: string;
  href?: string;
  src?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
};

const Logo = ({
  to = "/",
  href,
  src = "/Noorwall-logo.png",
  alt = "Logo",
  className,
  imgClassName,
}: LogoProps) => {
  const content = (
    <img src={src} alt={alt} className={cn("w-60 h-40", imgClassName)} />
  );

  if (href) {
    return (
      <a href={href} className={cn("flex items-center", className)}>
        {content}
      </a>
    );
  }

  return (
    <Link to={to} className={cn("flex items-center", className)}>
      {content}
    </Link>
  );
};

export default Logo;
