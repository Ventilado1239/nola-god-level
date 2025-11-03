import { Link, useLocation } from "react-router-dom";
export default function TopNav(){
  const { pathname } = useLocation();
  const link = (to:string,label:string)=>(
    <Link to={to} className={`px-3 py-2 rounded-xl text-sm ${pathname===to?'bg-gray-900 text-white':'text-gray-700 hover:bg-gray-100'}`}>{label}</Link>
  );
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">Nola Analytics</div>
        <nav className="flex gap-2">
          {link("/dashboard","Dashboard")}
          {link("/explore","Explorar")}
        </nav>
      </div>
    </header>
  );
}
