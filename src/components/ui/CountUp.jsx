import { useEffect,useState } from "react";

export default function CountUp({ value }){
 const [n,setN]=useState(0);

 useEffect(()=>{
  let i=0;
  const t=setInterval(()=>{
    i+=value/20;
    if(i>=value){ setN(value); clearInterval(t); }
    else setN(i.toFixed(1));
  },20);
  return ()=>clearInterval(t);
 },[value]);

 return <>{n}</>;
}