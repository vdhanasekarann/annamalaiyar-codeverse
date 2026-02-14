export default function LoaderScreen(){
 return(
  <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">

    <img
      src="/logo.svg"
      className="w-20 animate-[pulse_2s_ease-in-out_infinite]"
    />

    <div className="mt-6 w-40 h-1 bg-zinc-800 rounded overflow-hidden">
      <div className="h-full bg-indigo-500 animate-[load_2s_linear_infinite]" />
    </div>

  </div>
 )
}