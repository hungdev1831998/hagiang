import { useEffect, useState } from 'react'

// Router đơn giản theo đường dẫn (không dùng #). BASE_URL là '/' trên Firebase, '/<repo>/' trên GitHub Pages.
const BASE = import.meta.env.BASE_URL
export const to = (path = '') => BASE + path.replace(/^\//, '')
const current = () => decodeURI(location.pathname).slice(BASE.length).replace(/\/+$/, '')

// Link cũ dạng #/lich-trinh → /lich-trinh
if (location.hash.startsWith('#/')) history.replaceState(null, '', to(location.hash.slice(2)))

export function navigate(path) {
  if (to(path) === location.pathname) return
  history.pushState(null, '', to(path))
  dispatchEvent(new Event('routechange'))
}

export function useRoute() {
  const [route, setRoute] = useState(current)
  useEffect(() => {
    const h = () => { setRoute(current()); scrollTo({ top: 0 }) }
    // bấm link nội bộ thì đổi trang tại chỗ, không tải lại
    const click = (e) => {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest('a[href]')
      if (!a || a.target || a.origin !== location.origin || !a.pathname.startsWith(BASE)) return
      e.preventDefault()
      navigate(a.pathname.slice(BASE.length))
    }
    addEventListener('popstate', h); addEventListener('routechange', h); document.addEventListener('click', click)
    return () => { removeEventListener('popstate', h); removeEventListener('routechange', h); document.removeEventListener('click', click) }
  }, [])
  return route
}
