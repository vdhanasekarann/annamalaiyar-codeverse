export default function LoaderScreen(){
 return(
  <div className="fixed inset-0 bg-black flex items-center justify-center flex-col">
    <img src="/logo.svg" className="w-20 animate-pulse"/>
    <div className="mt-4 text-sm opacity-70">Loading CodeVerse OS...</div>
  </div>
 )
}