export default function DateRangePicker({
  start, end, onChange
}:{start:string; end:string; onChange:(s:string,e:string)=>void}){
  return (
    <div className="flex items-center gap-2">
      <input type="date" value={start} onChange={e=>onChange(e.target.value, end)} className="border rounded-lg px-2 py-1 text-sm bg-white" />
      <span className="text-sm text-muted">até</span>
      <input type="date" value={end} onChange={e=>onChange(start, e.target.value)} className="border rounded-lg px-2 py-1 text-sm bg-white" />
    </div>
  );
}
