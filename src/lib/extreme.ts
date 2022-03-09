import { solution as s, extremeSolution } from './words'
import { isHardMode } from '../App'
var solu = s

if(isHardMode){
  solu = extremeSolution
}
export function checkSolu(){
  solu = s

  if(isHardMode){
    solu = extremeSolution
  }
}
export {solu as solution}
