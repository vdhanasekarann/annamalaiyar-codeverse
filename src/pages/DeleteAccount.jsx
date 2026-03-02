export default function DeleteAccount() {
  return (
    <div className="min-h-screen text-white px-3 sm:px-6 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-5">
        <section className="glass-panel border border-white/10 p-6 sm:p-8 rounded-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold">CodeVerse AI Account Deletion</h1>
          <p className="text-zinc-300 mt-3">
            Public Account Deletion URL:{" "}
            <a
              href="https://app.aicodeverse.com/delete-account"
              className="underline hover:text-white break-all"
            >
              https://app.aicodeverse.com/delete-account
            </a>
          </p>
          <p className="text-zinc-300 mt-3">
            To delete your account:
          </p>
          <ol className="list-decimal ml-6 mt-2 space-y-1 text-zinc-200">
            <li>
              Email us at{" "}
              <a
                href="mailto:codeverseteam@aicodeverse.com?subject=Delete%20Account"
                className="underline hover:text-white"
              >
                codeverseteam@aicodeverse.com
              </a>
            </li>
            <li>Use subject: Delete Account</li>
            <li>Include registered email</li>
          </ol>
        </section>

        <section className="glass-panel border border-white/10 p-6 sm:p-8 rounded-2xl">
          <h2 className="text-xl font-semibold">Deleted Data</h2>
          <ul className="list-disc ml-6 mt-2 space-y-1 text-zinc-200">
            <li>Account information</li>
            <li>AI history</li>
            <li>Profile data</li>
          </ul>
        </section>

        <section className="glass-panel border border-white/10 p-6 sm:p-8 rounded-2xl">
          <h2 className="text-xl font-semibold">Retained Data</h2>
          <ul className="list-disc ml-6 mt-2 space-y-1 text-zinc-200">
            <li>Payment invoices (legal requirement)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
