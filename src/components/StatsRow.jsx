import { useTranslation } from 'react-i18next';
import GlassCard from "./GlassCard";
import { useTheme } from "../context/ThemeContext";

export default function StatsRow({usage}){
 const { t } = useTranslation();
 const { theme } = useTheme();
 const total = Object.values(usage||{}).reduce((a,b)=>a+b,0);

 return(
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
   <Card title={t('todayUsage')||'Today Usage'} value={total} theme={theme} delay={0}/>
   <Card title={t('appsUsed')||'Apps Used'} value={Object.keys(usage||{}).length} theme={theme} delay={120}/>
   <Card title={t('planLabel')||'Plan'} value={t('free')||'Free'} theme={theme} delay={240}/>
   <Card title={t('statusLabel')||'Status'} value={t('active')||'Active'} theme={theme} delay={360}/>
  </div>
 )
}

function Card({title,value,theme,delay}){
 return(
  <GlassCard
   theme={theme}
   className="glass-card-float p-4 rounded-xl"
   style={{ "--float-delay": `${delay}ms` }}
  >
   <p className="text-xs opacity-60">{title}</p>
   <p className="text-xl font-bold">{value}</p>
  </GlassCard>
 )
}
