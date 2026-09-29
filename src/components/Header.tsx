import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const { pathname } = useLocation()
  return (
    <header className="border-b border-studio-200 bg-white">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Link to="/" className="text-sm font-semibold text-studio-900">
          StylePT
        </Link>
        {pathname !== '/' && (
          <Link to="/" className="text-xs font-medium text-studio-500 hover:text-studio-700">
            처음으로
          </Link>
        )}
      </div>
    </header>
  )
}
