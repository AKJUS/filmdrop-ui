import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import mainSliceReducer from '../../redux/slices/mainSlice'
import ThemeSwitcher from './ThemeSwitcher'
import * as themeHelper from '../../utils/themeHelper'

// Mock the theme helper functions
vi.mock('../../utils/themeHelper', () => ({
  applyTheme: vi.fn(),
  saveThemeToStorage: vi.fn()
}))

// Mock SVG imports for Vite
vi.mock('../../assets/sun-icon.svg?react', () => ({
  default: () => <div data-testid="sun-icon">SunIcon</div>
}))
vi.mock('../../assets/moon-icon.svg?react', () => ({
  default: () => <div data-testid="moon-icon">MoonIcon</div>
}))

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      mainSlice: mainSliceReducer
    },
    preloadedState: {
      mainSlice: {
        currentTheme: 'dark',
        ...initialState
      }
    }
  })
}

const renderWithProvider = (component, store) => {
  return render(<Provider store={store}>{component}</Provider>)
}

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders theme switcher button', () => {
    const store = createTestStore()
    renderWithProvider(<ThemeSwitcher />, store)

    const button = screen.getByRole('button', { name: /Switch theme/i })
    expect(button).toBeInTheDocument()
  })

  it('displays correct icon for light theme', () => {
    const store = createTestStore({ currentTheme: 'light' })
    renderWithProvider(<ThemeSwitcher />, store)

    const icon = screen.getByTestId('sun-icon')
    expect(icon).toBeInTheDocument()
  })

  it('displays correct icon for dark theme', () => {
    const store = createTestStore({ currentTheme: 'dark' })
    renderWithProvider(<ThemeSwitcher />, store)

    const icon = screen.getByTestId('moon-icon')
    expect(icon).toBeInTheDocument()
  })

  it('has correct accessibility attributes', () => {
    const store = createTestStore({ currentTheme: 'light' })
    renderWithProvider(<ThemeSwitcher />, store)

    const button = screen.getByRole('button', { name: /Switch theme/i })
    expect(button).toHaveAttribute(
      'aria-label',
      'Switch theme. Currently Light mode'
    )
    expect(button).toHaveAttribute(
      'title',
      'Current: Light mode. Click to switch themes.'
    )
  })

  it('calls theme switching functions when clicked', () => {
    const store = createTestStore({ currentTheme: 'light' })

    renderWithProvider(<ThemeSwitcher />, store)

    const button = screen.getByRole('button', { name: /Switch theme/i })
    fireEvent.click(button)

    expect(themeHelper.applyTheme).toHaveBeenCalledWith('dark')
    expect(themeHelper.saveThemeToStorage).toHaveBeenCalledWith('dark')
  })

  it('updates Redux state when clicked', () => {
    const store = createTestStore({ currentTheme: 'light' })

    renderWithProvider(<ThemeSwitcher />, store)

    const button = screen.getByRole('button', { name: /Switch theme/i })
    fireEvent.click(button)

    const state = store.getState()
    expect(state.mainSlice.currentTheme).toBe('dark')
  })

  it('cycles through themes correctly', () => {
    const store = createTestStore({ currentTheme: 'dark' })

    renderWithProvider(<ThemeSwitcher />, store)

    const button = screen.getByRole('button', { name: /Switch theme/i })
    fireEvent.click(button)

    expect(themeHelper.applyTheme).toHaveBeenCalledWith('light')
    expect(themeHelper.saveThemeToStorage).toHaveBeenCalledWith('light')

    const state = store.getState()
    expect(state.mainSlice.currentTheme).toBe('light')
  })
})
