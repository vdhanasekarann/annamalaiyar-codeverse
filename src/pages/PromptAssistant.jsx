import { useState } from "react";

const tones = ["Professional", "Friendly", "Persuasive", "Creative", "Technical"];
const languages = ["English", "Tamil", "Hindi", "Malayalam", "Kannada", "Telugu"];
const styles = ["Detailed", "Concise", "Bullet Points", "Story Format", "Step-by-Step"];
const formats = ["Plain Text", "Markdown", "Table", "JSON"];

export default function PromptAssistant() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    goal: "",
    tone: "",
    language: "",
    style: "",
    format: ""
  });

  const [result, setResult] = useState("");

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const generatePrompt = () => {
    const prompt = `
You are an expert AI assistant.

Task: ${form.goal}

Requirements:
- Tone: ${form.tone}
- Language: ${form.language}
- Style: ${form.style}
- Output Format: ${form.format}

Make the output high-quality, well-structured and optimized.
    `.trim();

    setResult(prompt);
    setStep(6);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
      <div className="max-w-2xl mx-auto bg-zinc-900 rounded-xl p-6 shadow-xl">

        <h1 className="text-2xl font-bold mb-6">🤖 Ask AI Prompt Assistant</h1>

        {step === 1 && (
          <>
            <label className="block mb-2 text-sm">What do you want to generate?</label>
            <textarea
              className="w-full p-3 rounded bg-zinc-800"
              rows={4}
              value={form.goal}
              onChange={e => setForm({...form, goal: e.target.value})}
            />
            <button onClick={next} className="mt-4 bg-indigo-600 px-4 py-2 rounded">Next</button>
          </>
        )}

        {step === 2 && (
          <>
            <SelectStep title="Select Tone" options={tones}
              onSelect={(v) => setForm({...form, tone: v})}
            />
            <NavButtons back={back} next={next}/>
          </>
        )}

        {step === 3 && (
          <>
            <SelectStep title="Select Language" options={languages}
              onSelect={(v) => setForm({...form, language: v})}
            />
            <NavButtons back={back} next={next}/>
          </>
        )}

        {step === 4 && (
          <>
            <SelectStep title="Select Style" options={styles}
              onSelect={(v) => setForm({...form, style: v})}
            />
            <NavButtons back={back} next={next}/>
          </>
        )}

        {step === 5 && (
          <>
            <SelectStep title="Select Output Format" options={formats}
              onSelect={(v) => setForm({...form, format: v})}
            />
            <div className="flex justify-between mt-4">
              <button onClick={back}>Back</button>
              <button onClick={generatePrompt} className="bg-indigo-600 px-4 py-2 rounded">
                Generate Prompt
              </button>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <h2 className="text-lg mb-3">✨ Optimized Prompt</h2>
            <pre className="bg-black p-4 rounded text-xs overflow-auto">
              {result}
            </pre>
            <button onClick={() => navigator.clipboard.writeText(result)}
              className="mt-4 bg-green-600 px-4 py-2 rounded">
              Copy
            </button>
          </>
        )}

      </div>
    </div>
  );
}

function SelectStep({ title, options, onSelect }) {
  return (
    <>
      <h2 className="mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {options.map(opt => (
          <button key={opt}
            onClick={() => onSelect(opt)}
            className="bg-zinc-800 hover:bg-indigo-600 px-3 py-2 rounded text-sm">
            {opt}
          </button>
        ))}
      </div>
    </>
  );
}

function NavButtons({ back, next }) {
  return (
    <div className="flex justify-between mt-4">
      <button onClick={back}>Back</button>
      <button onClick={next} className="bg-indigo-600 px-4 py-2 rounded">Next</button>
    </div>
  );
}
