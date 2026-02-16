import { useState } from "react";
import { GPTS } from "../data/gpts";

export default function useSearch(){
 const [query,setQuery]=useState("");

 const results = GPTS.filter(g =>
   g.title.toLowerCase().includes(query.toLowerCase())
 );

 return {query,setQuery,results};
}
