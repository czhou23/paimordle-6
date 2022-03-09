import { solution as s, extremeSolution } from './words'
import { isHardMode } from '../App'
var solu = s

if(isHardMode){
  solu = extremeSolution
}
export function checkSolu(){
  solu = 'aaaaaa'

  if(isHardMode){
    solu = 'bbbbbb'
  }
}
export {solu as solution}
