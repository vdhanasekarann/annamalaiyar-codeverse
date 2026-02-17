import { useTranslation } from 'react-i18next';

export default function StatsRow({usage}){
 const { t } = useTranslation();
 const total = Object.values(usage||{}).reduce((a,b)=>a+b,0);

 return(
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
   <Card title={t('todayUsage')||'Today Usage'} value={total}/>
   <Card title={t('appsUsed')||'Apps Used'} value={Object.keys(usage||{}).length}/>
   <Card title={t('planLabel')||'Plan'} value={t('free')||'Free'}/>
   <Card title={t('statusLabel')||'Status'} value={t('active')||'Active'}/>
  </div>
 )
}

function Card({title,value}){
 return(
  <div className="glass-gold p-4 rounded-xl border border-white/10">
   <p className="text-xs opacity-60">{title}</p>
   <p className="text-xl font-bold">{value}</p>
  </div>
 )
}
