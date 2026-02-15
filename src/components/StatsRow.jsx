export default function StatsRow({usage}){

 const total = Object.values(usage).reduce((a,b)=>a+b,0);

 return(
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
   <Card title="Today Usage" value={total}/>
   <Card title="Apps Used" value={Object.keys(usage).length}/>
   <Card title="Plan" value="Free"/>
   <Card title="Status" value="Active"/>
  </div>
 )
}

function Card({title,value}){
 return(
  <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10">
   <p className="text-xs opacity-60">{title}</p>
   <p className="text-xl font-bold">{value}</p>
  </div>
 )
}
