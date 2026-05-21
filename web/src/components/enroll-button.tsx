"use client";

interface EnrollButtonProps {
  course: string;
  className: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function EnrollButton({ course, className, style, children }: EnrollButtonProps) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    window.location.hash = `enroll-form?course=${course}`;
    const target = document.getElementById("enroll-form");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <a
      href={`#enroll-form?course=${course}`}
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
