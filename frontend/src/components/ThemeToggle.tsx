"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-[48px] h-[20px] rounded-full bg-neutral-200 dark:bg-mine-800" />
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <label className="ui-switch">
      <input 
        type="checkbox" 
        checked={isDark} 
        onChange={() => setTheme(isDark ? "light" : "dark")} 
      />
      <div className="slider">
        <div className="circle"></div>
      </div>
    </label>
  )
}
