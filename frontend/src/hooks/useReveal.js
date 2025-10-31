import { useEffect, useRef, useState } from 'react'

// Simple hook that returns a ref and a visible boolean when the element enters viewport
export default function useReveal(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // delay setting visible by a tiny amount to ensure the browser
            // applies initial styles first so CSS transitions run smoothly.
            // Using requestAnimationFrame + small timeout avoids cases where
            // the element is mounted already visible and the transition is skipped.
            try {
              requestAnimationFrame(() => {
                setTimeout(() => {
                  setVisible(true)
                  try {
                    observer.unobserve(el)
                  } catch (e) {
                    /* ignore */
                  }
                }, 25)
              })
            } catch (e) {
              // fallback
              setVisible(true)
              try {
                observer.unobserve(el)
              } catch (err) {
                /* ignore */
              }
            }
          }
        })
      },
      { threshold: 0.12, ...options }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, options])

  return [ref, visible]
}
