const THEME_STORAGE_KEY = 'APP_THEME_PREFERENCE'

export function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return 'light'
}

export function applyTheme(theme) {
  if (typeof document !== 'undefined') {
    const themeValue = theme === 'filmdrop' ? 'filmdrop' : `filmdrop-${theme}`
    document.documentElement.setAttribute('data-theme', themeValue)
  }
}

export function getThemeFromStorage() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(THEME_STORAGE_KEY)
  }
  return null
}

export function saveThemeToStorage(theme) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }
}

export function getBasemapConfig(appConfig, currentTheme) {
  if (!appConfig.BASEMAP) {
    return null
  }

  // Check if this is single basemap mode (has url property directly)
  if (appConfig.BASEMAP.url) {
    return {
      url: appConfig.BASEMAP.url,
      attribution: appConfig.BASEMAP.attribution
    }
  }

  if (appConfig.THEME_SWITCHING_ENABLED === true && currentTheme) {
    return appConfig.BASEMAP[currentTheme]
  }

  return null
}

export function getBrandLogoConfig(appConfig, currentTheme) {
  if (!appConfig.BRAND_LOGO) {
    return null
  }

  const config = appConfig.BRAND_LOGO
  let logoImage = config.image

  if (appConfig.THEME_SWITCHING_ENABLED === true && currentTheme) {
    if (currentTheme === 'light' && config.image_light) {
      logoImage = config.image_light
    } else if (currentTheme === 'dark' && config.image_dark) {
      logoImage = config.image_dark
    }
  }

  if (!logoImage) {
    return null
  }

  return {
    url: config.url,
    title: config.title,
    alt: config.alt,
    image: logoImage
  }
}

function validateThemeCSS(switchingEnabled) {
  if (typeof document === 'undefined') {
    return // Skip validation in non-browser environments
  }

  let hasFilmdropRootSelector = false
  let hasFilmdropDarkThemeSelector = false
  let hasFilmdropLightThemeSelector = false

  try {
    // Check all loaded stylesheets
    for (let i = 0; i < document.styleSheets.length; i++) {
      const stylesheet = document.styleSheets[i]

      try {
        // Check all CSS rules in this stylesheet
        const rules = stylesheet.cssRules || stylesheet.rules
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j]

          if (rule.selectorText) {
            if (
              rule.selectorText.includes(':root[data-theme="filmdrop"]') ||
              rule.selectorText.includes(":root[data-theme='filmdrop']")
            ) {
              hasFilmdropRootSelector = true
            }
            if (
              rule.selectorText.includes(':root[data-theme="filmdrop-dark"]') ||
              rule.selectorText.includes(":root[data-theme='filmdrop-dark']")
            ) {
              hasFilmdropDarkThemeSelector = true
            }
            if (
              rule.selectorText.includes(
                ':root[data-theme="filmdrop-light"]'
              ) ||
              rule.selectorText.includes(":root[data-theme='filmdrop-light']")
            ) {
              hasFilmdropLightThemeSelector = true
            }
          }
        }
      } catch (e) {
        // Skip stylesheets that can't be accessed (CORS restrictions)
        continue
      }
    }
  } catch (e) {
    console.warn('Unable to validate CSS rules:', e.message)
    return
  }

  if (switchingEnabled) {
    if (!hasFilmdropDarkThemeSelector) {
      throw new Error(
        'THEME_SWITCHING_ENABLED is true but no :root[data-theme="filmdrop-dark"] CSS rule found. ' +
          'Theme switching requires :root[data-theme="filmdrop-dark"] and :root[data-theme="filmdrop-light"] selectors.'
      )
    }
    if (!hasFilmdropLightThemeSelector) {
      throw new Error(
        'THEME_SWITCHING_ENABLED is true but no :root[data-theme="filmdrop-light"] CSS rule found. ' +
          'Theme switching requires :root[data-theme="filmdrop-dark"] and :root[data-theme="filmdrop-light"] selectors.'
      )
    }
  } else {
    if (!hasFilmdropRootSelector) {
      throw new Error(
        'THEME_SWITCHING_ENABLED is false but no :root[data-theme="filmdrop"] CSS rule found. ' +
          'Single theme mode requires a :root[data-theme="filmdrop"] selector with CSS variables.'
      )
    }
  }
}

export function initializeTheme(appConfig) {
  const switchingEnabled = appConfig.THEME_SWITCHING_ENABLED === true

  validateThemeCSS(switchingEnabled)

  if (!switchingEnabled) {
    return {
      currentTheme: 'filmdrop',
      switchingEnabled: false
    }
  }

  let currentTheme = getThemeFromStorage()

  if (!currentTheme) {
    try {
      currentTheme = getSystemTheme()
    } catch (error) {
      currentTheme = 'light'
    }
  }

  return {
    currentTheme,
    switchingEnabled: true
  }
}
