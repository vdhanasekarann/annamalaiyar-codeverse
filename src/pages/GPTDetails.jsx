import { Link, useNavigate } from "react-router-dom";
const [reviews,setReviews]=useState([]);

useEffect(()=>{
 apiFetch(`/api/reviews/${id}`)
  .then(r=>r.json())
  .then(setReviews);
},[id]);

apiFetch(`/api/reviews/${gpt.id}`)
