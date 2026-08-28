import { useState } from 'react'
import { Landmark, LoaderCircle, LockKeyhole } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const result = await supabase.auth.signInWithPassword({ email, password })

    if (result.error) setError(result.error.message)
    setLoading(false)
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="card w-full max-w-sm p-6 sm:p-8">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-900 text-white"><Landmark size={22} /></div>
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight">Money desk by <span className="signature text-3xl text-brand-600">Ktoo</span></h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to securely sync your exchange records.</p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <AuthInput label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
          <AuthInput label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" minLength={6} />
          {error && <p className="text-sm font-semibold text-rose-600" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 font-bold text-white transition hover:bg-brand-700 disabled:bg-slate-300">
            {loading ? <LoaderCircle className="animate-spin" size={18} /> : <LockKeyhole size={17} />}
            Sign in securely
          </button>
        </form>
      </section>
    </main>
  )
}

function AuthInput({ label, type, value, onChange, ...props }) {
  return (
    <label className="input-shell block px-3.5 py-2.5">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <input {...props} required type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-0.5 w-full bg-transparent text-base font-semibold outline-none" />
    </label>
  )
}
