import { Cell } from '../grid/Cell'
import { BaseModal } from './BaseModal'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const InfoModal = ({ isOpen, handleClose }: Props) => {
  return (
    <BaseModal title="How to play" isOpen={isOpen} handleClose={handleClose}>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        Guess the word in 6 tries. Words can be characters, items, and concepts
        relating to Genshin. After each guess, the color of the tiles will
        change to show how close your guess was to the word.
      </p>

      <div className="flex justify-center mb-1 mt-4">
        <Cell value="P"/>
        <Cell value="A"/>
        <Cell 
          isRevealing={true}
          isCompleted={true}
          status="correct"
          value="I" 
        />
        <Cell value="M" />
        <Cell value="O" />
        <Cell value="N" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        The letter I is in the word and in the correct spot.
      </p>

      <div className="flex justify-center mb-1 mt-4">
        <Cell value="D" />
        <Cell value="E" />
        <Cell value="N" />
        <Cell value="D" />
        <Cell
          isRevealing={true}
          isCompleted={true}
          value="R"
          status="present"
        />
        <Cell value="O" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        The letter R is in the word but in the wrong spot.
      </p>

      <div className="flex justify-center mb-1 mt-4">
        <Cell value="A" />
        <Cell isRevealing={true} isCompleted={true} value="L" status="absent" />
        <Cell value="B" />
        <Cell value="E" />
        <Cell value="D" />
        <Cell value="O" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        The letter L is not in the word in any spot.
      </p>

      <p className="mt-6 italic text-sm text-gray-500 dark:text-gray-300">
        This is an open source version of the word guessing game we all know and
        love -{' '}
        <a
          href="https://github.com/czhou23/paimordle-vi"
          className="underline font-bold"
        >
          check out the code here
        </a>{' '}
      </p>
      <p className="mt-6 italic text-sm text-gray-500 dark:text-gray-300">
        Find updates on the latest with{' '}
        <a href="https://twitter.com/paimordle" className="underline font-bold">
          Paimordle
        </a>{' '}
      </p>
       <p className="mt-6 italic text-sm text-gray-500 dark:text-gray-300">
          Play the original {' '}
         <a href="https://paimordle-vi.vercel.app/" className="underline font-bold">
           Paimordle
          </a>{' '}
      </p>
    </BaseModal>
  )
}
