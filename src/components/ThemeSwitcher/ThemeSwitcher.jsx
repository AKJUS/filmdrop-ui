import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentTheme } from '../../redux/slices/mainSlice'
import { applyTheme, saveThemeToStorage } from '../../utils/themeHelper'
import SunIcon from '../../assets/sun-icon.svg?react'
import MoonIcon from '../../assets/moon-icon.svg?react'
import './ThemeSwitcher.css'

const ThemeSwitcher = () => {
  const dispatch = useDispatch()
  const currentTheme = useSelector((state) => state.mainSlice.currentTheme)

  const handleThemeSwitch = () => {
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light'
    dispatch(setCurrentTheme(nextTheme))
    applyTheme(nextTheme)
    saveThemeToStorage(nextTheme)
  }

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'light':
        return <SunIcon />
      case 'dark':
        return <MoonIcon />
      default:
        return <SunIcon />
    }
  }

  const getThemeLabel = () => {
    switch (currentTheme) {
      case 'light':
        return 'Light mode'
      case 'dark':
        return 'Dark mode'
      default:
        return 'Light mode'
    }
  }

  return (
    <button
      className="theme-switcher"
      onClick={handleThemeSwitch}
      title={`Current: ${getThemeLabel()}. Click to switch themes.`}
      aria-label={`Switch theme. Currently ${getThemeLabel()}`}
    >
      <span className="theme-switcher-icon" aria-hidden="true">
        {getThemeIcon()}
      </span>
    </button>
  )
}

export default ThemeSwitcher
