import { GPTS } from "../data/gpts";
import { apiFetch } from "../lib/apiFetch";

export default function GPTsPage() {

  const openGPT = async (gpt) => {
    try {
      await apiFetch("/usage", {
        method: "POST",
        body: JSON.stringify({ gpt: gpt.id }),
      });

      window.open(gpt.link, "_blank");

      // Refresh usage counter
      setTimeout(() => {
        window.location.reload();
      }, 800);

    } catch (err) {
      console.error("Usage update failed", err);
      window.open(gpt.link, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-slate-20">
      <div className="max-w-1xl mx-auto px-1 py-1">
        <h1 className="text-sm font-bold mb-1">
          CodeVerse GPT Tools
        </h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GPTS.map((gpt) => (
            <div key={gpt.id} className="bg-black rounded-xl shadow-sm border p-5">

              <img src={gpt.logo} className="h-12 mb-3" />
              <h3 className="font-semibold text-blue-500">{gpt.title}</h3>

              <p className="text-sm text-slate-300 mt-1">
                {gpt.description}
              </p>

              <p className="text-xs mt-3 text-white">
                <span className="font-medium">Free:</span> {gpt.freeLimit}
              </p>

              <div className="mt-3 flex gap-2">

                <button
                  onClick={() => openGPT(gpt)}
                  className="flex-1 text-center rounded-lg bg-black border text-white px-1 py-3 text-sm"
                >
                  Open GPT
                </button>

                <a
                  href="/premium"
                  className="flex-1 text-center rounded-lg bg-black border text-white px-1 py-3 text-sm"
                >
                  Unlock Premium
                </a>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
