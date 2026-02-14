import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiFetch";
const [reviews,setReviews]=useState([]);

useEffect(()=>{
 apiFetch(`/api/reviews/${gpt.id}`)
   .then(r=>r.json())
   .then(setReviews);
},[gpt.id]);

export default GPTDetails;