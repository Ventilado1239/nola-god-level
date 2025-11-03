export default function Badge({children, tone="neutral"}:{
  children:React.ReactNode; tone?: "positive"|"negative"|"neutral"
}){
  const map = {
    positive: "text-green-700 bg-green-50 border border-green-200",
    negative: "text-red-700 bg-red-50 border border-red-200",
    neutral:  "text-gray-700 bg-gray-50 border border-gray-200",
  }[tone];
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map}`}>{children}</span>;
}
