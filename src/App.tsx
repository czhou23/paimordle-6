import { useState, useEffect } from 'react'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { InfoModal } from './components/modals/InfoModal'
import { StatsModal } from './components/modals/StatsModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { changeGameTitleShare } from './lib/share'
import {
  WIN_MESSAGES,
  GAME_COPIED_MESSAGE,
  NOT_ENOUGH_LETTERS_MESSAGE,
  WORD_NOT_FOUND_MESSAGE,
  CORRECT_WORD_MESSAGE,
  HARD_MODE_ALERT_MESSAGE,
} from './constants/strings'
import {
  MAX_WORD_LENGTH,
  MAX_CHALLENGES,
  REVEAL_TIME_MS,
  GAME_LOST_INFO_DELAY,
  WELCOME_INFO_MODAL_MS,
} from './constants/settings'
import {
  isWordInWordList,
  isWinningWord,
  solutionIndex,
  //findFirstUnusedReveal,
  unicodeLength,
  getSolution
} from './lib/words'

import { updateSolu } from './lib/statuses'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  setStoredIsHighContrastMode,
  getStoredIsHighContrastMode,
} from './lib/localStorage'
import { default as GraphemeSplitter } from 'grapheme-splitter'

import './App.css'
import { AlertContainer } from './components/alerts/AlertContainer'
import { useAlert } from './context/AlertContext'
import { Navbar, changeGameTitle } from './components/navbar/Navbar'
var solutions = getSolution(solutionIndex)
var s = solutions.solution
var es = solutions.extremeSolution
var solution = s

function App() {
  const [isHardMode, setIsHardMode] = useState(
  localStorage.getItem('gameMode')
    ? localStorage.getItem('gameMode') === 'hard'
    : false
  )
  changeGameTitle(isHardMode)
  changeGameTitleShare(isHardMode)
  if(isHardMode){
    solution = es
    updateSolu(solution)
    
  }
  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches
  
  const { showError: showErrorAlert, showSuccess: showSuccessAlert } =
    useAlert()
  const [currentGuess, setCurrentGuess] = useState('')
  const [isGameWon, setIsGameWon] = useState(false)
  const [isExtremeWon, setIsExtremeWon] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [currentRowClass, setCurrentRowClass] = useState('')
  const [isGameLost, setIsGameLost] = useState(false)
  const [isExtremeLost, setIsExtremeLost] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme')
      ? localStorage.getItem('theme') === 'dark'
      : prefersDarkMode
      ? true
      : false
  )
  const [isHighContrastMode, setIsHighContrastMode] = useState(
    getStoredIsHighContrastMode()
  )
  const [isRevealing, setIsRevealing] = useState(false)
  const [guesses, setGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage()
    if (loaded?.s !== s) {
      return []
    }
    const gameWasWon = loaded.guesses.includes(s)    
    if (gameWasWon) {
      setIsGameWon(true)
    }
    if (loaded.guesses.length === MAX_CHALLENGES && !gameWasWon) {
      setIsGameLost(true)
      showErrorAlert(CORRECT_WORD_MESSAGE(s), {
        persist: false,
      })
    }
    return loaded.guesses
  })
  
  const [extremeGuesses, setExtremeGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage()
    if (loaded?.es !== es) {
      return []
    }
    const extremeWasWon = loaded.extremeGuesses.includes(es)
    
    if (extremeWasWon) {
      setIsExtremeWon(true)
    }
    if (loaded.guesses.length === MAX_CHALLENGES && !extremeWasWon) {
      setIsExtremeLost(true)
      showErrorAlert(CORRECT_WORD_MESSAGE(es), {
        persist: false,
      })
    }
    return loaded.extremeGuesses
  })
  const [stats, setStats] = useState(() => loadStats())
  
  //guesses of the game mode 
  let currentGuesses = guesses
  if(isHardMode){
    currentGuesses = extremeGuesses
  }
  useEffect(() => {
    // if no game state on load,
    // show the user the how-to info modal
    if (!loadGameStateFromLocalStorage()) {
      setTimeout(() => {
        setIsInfoModalOpen(true)
      }, WELCOME_INFO_MODAL_MS)
    }
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (isHighContrastMode) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [isDarkMode, isHighContrastMode])

  const handleDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }
  
  const handleHardMode = (isHard: boolean) => {
    if ((!isHardMode && (guesses.length === 0 || isGameWon || isGameLost)) || (isHardMode && (extremeGuesses.length === 0 || isExtremeWon || isExtremeLost))) {
      setIsHardMode(isHard)
      changeGameTitle(isHard)
      changeGameTitleShare(isHard)
      solution = s
      currentGuesses = guesses
      if(isHard){
        solution = es
        currentGuesses = extremeGuesses
      }
      updateSolu(solution)
      localStorage.setItem('gameMode', isHard ? 'hard' : 'normal')
      if(isHard && isExtremeLost){
        showErrorAlert(CORRECT_WORD_MESSAGE(es), {
        persist: false,
        })
      }
      else if(!isHard && isGameLost){
        showErrorAlert(CORRECT_WORD_MESSAGE(s), {
        persist: false,
        })
      }
    } else {
      showErrorAlert(HARD_MODE_ALERT_MESSAGE)
    }
  }
  

  const handleHighContrastMode = (isHighContrast: boolean) => {
    setIsHighContrastMode(isHighContrast)
    setStoredIsHighContrastMode(isHighContrast)
  }

  const clearCurrentRowClass = () => {
    setCurrentRowClass('')
  }

  useEffect(() => {
    saveGameStateToLocalStorage({ guesses, s, extremeGuesses, es })
  }, [guesses, extremeGuesses])

  useEffect(() => {
    if (isGameWon) {
      const winMessage =
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      const delayMs = REVEAL_TIME_MS * MAX_WORD_LENGTH

      showSuccessAlert(winMessage, {
        delayMs,
        onClose: () => setIsStatsModalOpen(true),
      })
    }

    if (isGameLost) {
      setTimeout(() => {
        setIsStatsModalOpen(true)
      }, GAME_LOST_INFO_DELAY)
    }
  }, [isGameWon, isGameLost, showSuccessAlert])
  
  useEffect(() => {
    if (isExtremeWon) {
      const winMessage =
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      const delayMs = REVEAL_TIME_MS * MAX_WORD_LENGTH

      showSuccessAlert(winMessage, {
        delayMs,
        onClose: () => setIsStatsModalOpen(true),
      })
    }

    if (isExtremeLost) {
      setTimeout(() => {
        setIsStatsModalOpen(true)
      }, GAME_LOST_INFO_DELAY)
    }
  }, [isExtremeWon, isExtremeLost, showSuccessAlert])


  const onChar = (value: string) => {
    if(isHardMode){
      if (
        unicodeLength(`${currentGuess}${value}`) <= MAX_WORD_LENGTH &&
        extremeGuesses.length < MAX_CHALLENGES &&
        !isExtremeWon
      ) {
        setCurrentGuess(`${currentGuess}${value}`)
      }
    }
    else{
      if (
        unicodeLength(`${currentGuess}${value}`) <= MAX_WORD_LENGTH &&
        guesses.length < MAX_CHALLENGES &&
        !isGameWon
      ) {
        setCurrentGuess(`${currentGuess}${value}`)
      }
    }
  }

  const onDelete = () => {
    setCurrentGuess(
      new GraphemeSplitter().splitGraphemes(currentGuess).slice(0, -1).join('')
    )
  }

  const onEnter = () => {
    if (!isHardMode && (isGameWon || isGameLost)) {
      return
    }
    
    if (!(unicodeLength(currentGuess) === MAX_WORD_LENGTH)) {
      setCurrentRowClass('jiggle')
      return showErrorAlert(NOT_ENOUGH_LETTERS_MESSAGE, {
        onClose: clearCurrentRowClass,
      })
    }

    if (!isWordInWordList(currentGuess)) {
      setCurrentRowClass('jiggle')
      return showErrorAlert(WORD_NOT_FOUND_MESSAGE, {
        onClose: clearCurrentRowClass,
      })
    }
    
    setIsRevealing(true)
    // turn this back off after all
    // chars have been revealed
    setTimeout(() => {
      setIsRevealing(false)
    }, REVEAL_TIME_MS * MAX_WORD_LENGTH)

    const winningWord = isWinningWord(s, currentGuess)
    const winningExtremeWord = isWinningWord(es, currentGuess)
    if(!isHardMode) {
      if (
        unicodeLength(currentGuess) === MAX_WORD_LENGTH &&
        guesses.length < MAX_CHALLENGES &&
        !isGameWon
      ) {
        setGuesses([...guesses, currentGuess])
        currentGuesses = guesses
        setCurrentGuess('')

        if (winningWord) {
          setStats(addStatsForCompletedGame(stats, currentGuesses.length))
          return setIsGameWon(true)
        }

        if (currentGuesses.length === MAX_CHALLENGES - 1) {
          setStats(addStatsForCompletedGame(stats, currentGuesses.length + 1))
          setIsGameLost(true)
          showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
            persist: false,
            delayMs: REVEAL_TIME_MS * MAX_WORD_LENGTH + 1,
          })
        }
      }
    }
    else{
      if (
        unicodeLength(currentGuess) === MAX_WORD_LENGTH &&
        extremeGuesses.length < MAX_CHALLENGES &&
        !isExtremeWon
      ) {
        setExtremeGuesses([...extremeGuesses, currentGuess])
        setCurrentGuess('')
        currentGuesses = extremeGuesses

        if (winningExtremeWord) {
          return setIsExtremeWon(true)
        }

        if (extremeGuesses.length === MAX_CHALLENGES - 1) {
          setIsExtremeLost(true)
          showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
            persist: false,
            delayMs: REVEAL_TIME_MS * MAX_WORD_LENGTH + 1,
          })
        }
      }
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar
        setIsInfoModalOpen={setIsInfoModalOpen}
        setIsStatsModalOpen={setIsStatsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
      />
      <div className="pt-2 px-1 pb-8 md:max-w-7xl w-full mx-auto sm:px-6 lg:px-8 flex flex-col grow">
        <div className="pb-6 grow">
          <Grid
            guesses={currentGuesses}
            currentGuess={currentGuess}
            isRevealing={isRevealing}
            currentRowClassName={currentRowClass}
          />
        </div>
        <Keyboard
          onChar={onChar}
          onDelete={onDelete}
          onEnter={onEnter}
          guesses={currentGuesses}
          isRevealing={isRevealing}
        />
        <InfoModal
          isOpen={isInfoModalOpen}
          handleClose={() => setIsInfoModalOpen(false)}
        />
        <StatsModal
          isOpen={isStatsModalOpen}
          handleClose={() => setIsStatsModalOpen(false)}
          guesses={currentGuesses}
          gameStats={stats}
          isGameLost={isGameLost}
          isGameWon={isGameWon}
          isExtremeLost={isExtremeLost}
          isExtremeWon={isExtremeWon}
          handleShareToClipboard={() => showSuccessAlert(GAME_COPIED_MESSAGE)}
          isHardMode={isHardMode}
          isDarkMode={isDarkMode}
          isHighContrastMode={isHighContrastMode}
          numberOfGuessesMade={currentGuesses.length}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          handleClose={() => setIsSettingsModalOpen(false)}
          isHardMode={isHardMode}
          handleHardMode={handleHardMode}
          isDarkMode={isDarkMode}
          handleDarkMode={handleDarkMode}
          isHighContrastMode={isHighContrastMode}
          handleHighContrastMode={handleHighContrastMode}
        />
        <AlertContainer />
      </div>
    </div>
  )
}
export default App

