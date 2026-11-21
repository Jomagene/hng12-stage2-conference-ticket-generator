// template.js remounts on every navigation, which gives each page its fade-in.
export default function Template({ children }) {
  return <div className="animate-page-in motion-reduce:animate-none">{children}</div>;
}
