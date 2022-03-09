import { solution as s, extremeSolution } from './words'
import { useState } from 'react'
var solu = solution
export const [isHardMode, setIsHardMode] = useState(
  localStorage.getItem('gameMode')
    ? localStorage.getItem('gameMode') === 'hard'
    : false
)
if(isHardMode){
  solu = extremeSolution
}
export const handleHardMode = (isHard: boolean) => {
    if (guesses.length === 0 || isGameWon || isGameLost) {
      setIsHardMode(isHard)
      if(isHard){
        solu = extremeSolution
      }
      else{
        solu = solution
      }
      localStorage.setItem('gameMode', isHard ? 'hard' : 'normal')
    } else {
      showErrorAlert(HARD_MODE_ALERT_MESSAGE)
    }
  }
export {solu as solution}
