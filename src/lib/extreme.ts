import { solution as s, extremeSolution } from './words'
import { isHardMode } from '../App'
import { useState } from 'react'
var solu = s

if(isHardMode){
  solu = extremeSolution
}

export {solu as solution}
