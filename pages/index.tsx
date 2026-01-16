import Head from 'next/head'
import Terminal from '@/components/Terminal'

export default function Home() {
  return (
    <>
      <Head>
        <title>About Sai Mahesh</title>
        <meta name="description" content="Terminal-style portfolio" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="noise min-h-screen bg-[#050608] text-[#E6E6E6]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <Terminal />

          <div className="mt-6 text-xs text-white/45">
            Tip: type <span className="text-white/80">help</span> • Try <span className="text-white/80">sudo about</span> • <span className="text-white/80">projects</span> • <span className="text-white/80">contact</span>
          </div>
        </div>
      </main>
    </>
  )
}
