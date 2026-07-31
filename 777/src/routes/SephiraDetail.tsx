import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getByNumber } from '../data/sephiroth'
import SephiraDetail from '../components/SephiraDetail'

export default function SephiraDetailRoute() {
  const { number } = useParams()
  const navigate = useNavigate()
  const n = Number(number)
  const s = getByNumber(n)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && n > 1) navigate(`/sephiroth/${n - 1}`)
      if (e.key === 'ArrowRight' && n < 10) navigate(`/sephiroth/${n + 1}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [n, navigate])

  if (!s) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-ink-soft">No sphere with number {number}.</p>
        <Link to="/sephiroth" className="text-gilt link-gilt">
          ← Back to the ten
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <Link
        to="/sephiroth"
        className="no-print font-mono text-xs uppercase tracking-[0.18em] text-ink-faint link-gilt"
      >
        ← Spheres
      </Link>
      <SephiraDetail s={s} />
    </div>
  )
}
