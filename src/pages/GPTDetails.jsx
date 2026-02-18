export default function GPTDetails() {
 const { id } = useParams();
 const [reviews,setReviews]=useState([]);
 const [rating,setRating]=useState(5);
 const [text,setText]=useState("");

 useEffect(()=>{
  apiFetch(`/api/reviews/${id}`)
   .then(r=>r.json())
   .then(setReviews);
 },[id]);

 const submit=async()=>{
  await apiFetch(`/api/reviews/${id}`,{
   method:"POST",
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({rating,review:text})
  });
  setText("");
  const res=await apiFetch(`/api/reviews/${id}`);
  setReviews(await res.json());
 };

 return(
 <div className="p-6 text-white">
  <h1 className="text-xl mb-4">Reviews</h1>

  <div className="mb-6 space-y-2">
   <select value={rating} onChange={e=>setRating(Number(e.target.value))} className="text-black">
    {[5,4,3,2,1].map(n=><option key={n}>{n}</option>)}
   </select>

   <textarea
    value={text}
    onChange={e=>setText(e.target.value)}
    className="w-full p-2 text-black"
    placeholder="Write review..."
   />

   <button onClick={submit} className="bg-indigo-600 px-4 py-2 rounded">
    Submit
   </button>
  </div>

  {reviews.map(r=>(
   <div key={r.id} className="mb-3 bg-zinc-900 p-4 rounded">
    ⭐ {r.rating}
    <p>{r.review}</p>
   </div>
  ))}
 </div>
 );
}
