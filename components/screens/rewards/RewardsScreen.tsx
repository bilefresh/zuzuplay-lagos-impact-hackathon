'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import nonSpecial from '../../../assets/icons/non-special.svg'
import nonSpecialActive from '../../../assets/icons/nonSpecial-active.svg'
import restart from '../../../assets/icons/restart.svg'
import restartActive from '../../../assets/icons/restart-active.svg'
import sloMo from '../../../assets/icons/slo-mo.svg'
import sloMoActive from '../../../assets/icons/slo-mo-active.svg'
import { apiService } from '@/middleware/apiService'
import { getUserInfo } from '@/middleware/general'
import { getCoinBalance, spendCoins, addCoins } from '@/lib/coinStorage'
import { CoinDisplay } from '@/components/design-system/CoinDisplay'
import { InsufficientFundsModal } from '@/components/design-system/InsufficientFundsModal'
import { LearningButton } from '@/components/design-system/LearningButton'
import '@/lib/coinTestUtils' // Import test utilities for development

type Character = {
  id: number
  name: string
  image: string
  activeImage: string
  ability: string
  cost?: number
  selected?: boolean
  owned?: boolean
}

const characters: Character[] = [
  {
    id: 1,
    name: 'No special abilities',
    image: nonSpecial,
    activeImage: nonSpecialActive,
    ability: '',
    selected: true,
    owned: true,
  },
  {
    id: 2,
    name: 'Restart',
    image: restart,
    activeImage: restartActive,
    ability: 'Restart',
    cost: 900,
    selected: false,
    owned: false,
  },
  {
    id: 3,
    name: 'Slo-mo',
    image: sloMo,
    activeImage: sloMoActive,
    ability: 'Slo-mo',
    cost: 1160,
    selected: false,
    owned: false,
  },
]
const defaultUser = getUserInfo();

const RewardsScreen = () => {
  const [charactersState, setCharactersState] = useState(characters)
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0])
  const [userCoins, setUserCoins] = useState(0)
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false)
  const [user, setUser] = useState(defaultUser);

  // Load user coins on component mount
  useEffect(() => {
    setUserCoins(getCoinBalance())
  }, [])

  useEffect(() => {
    apiService.profile().then((res) => {
      setUser(res);
    });
  }, []);

  const handleCharacterSelect = (character: Character) => {
    // If character is already owned, just select it
    if (character.owned) {
      setSelectedCharacter(character)
      const updatedCharacters = charactersState.map((char) =>
        char.id === character.id
          ? { ...char, selected: true }
          : { ...char, selected: false }
      )
      setCharactersState(updatedCharacters)
      return
    }

    // If character has a cost, try to buy it
    if (character.cost) {
      if (userCoins >= character.cost) {
        // User has enough coins, proceed with purchase
        const success = spendCoins(character.cost, `Bought ${character.name} character`)
        if (success) {
          // Update character as owned and selected
          const updatedCharacters = charactersState.map((char) => {
            if (char.id === character.id) {
              return { ...char, owned: true, selected: true }
            } else {
              return { ...char, selected: false }
            }
          })
          setCharactersState(updatedCharacters)
          setSelectedCharacter({ ...character, owned: true })
          setUserCoins(getCoinBalance())
        }
      } else {
        // Insufficient funds, show modal
        setShowInsufficientFundsModal(true)
      }
    } else {
      // Free character, just select it
      setSelectedCharacter(character)
      const updatedCharacters = charactersState.map((char) =>
        char.id === character.id
          ? { ...char, selected: true }
          : { ...char, selected: false }
      )
      setCharactersState(updatedCharacters)
    }
  }

  const handleCloseInsufficientFundsModal = () => {
    setShowInsufficientFundsModal(false)
  }

  return (
    <div className="flex flex-col items-center pb-20">
      {/* Coin Display */}
      <div className="w-full flex justify-between items-center p-4">
        {/* Development helper - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => {
              addCoins(500, 'Test coins')
              setUserCoins(getCoinBalance())
            }}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
          >
            +500 Coins (Dev)
          </button>
        )}
        
        <CoinDisplay coins={userCoins} size="md" />
      </div>

      <section className="h-1/3 w-full flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4 text-black">
          Select a character
        </h2>

        <div className="flex flex-col items-center mb-4 h-full">
          <div className="w-36 h-36 flex items-center justify-center">
            <Image
              src={selectedCharacter.activeImage}
              alt={selectedCharacter.name}
              width={200}
              height={200}
              className="object-contain h-full w-full"
            />
          </div>
          <p className="mt-2 text-gray-700">
            {selectedCharacter.ability || selectedCharacter.name}
          </p>
        </div>
      </section>

      <section className="flex-1 flex flex-col justify-center items-center">
        <div className="flex space-x-4">
          {charactersState.map((character) => (
            <div
              key={character.id}
              className={`relative py-4 px-6 rounded-md cursor-pointer flex justify-center transition-all duration-200 ${
                character.selected 
                  ? 'border-2 bg-[#3651AB] scale-105' 
                  : character.owned 
                    ? 'bg-[#040D2F] hover:scale-105' 
                    : 'bg-[#040D2F] opacity-60 hover:opacity-80'
              }`}
              onClick={() => handleCharacterSelect(character)}
            > 
              <Image
                src={
                  character.selected ? character.activeImage : character.image
                }
                alt={character.name}
                width={60}
                height={60}
                className="object-contain"
              />
              
              {/* Ownership indicator */}
              {character.owned && !character.selected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              
              {/* Cost indicator for unowned characters */}
              {!character.owned && character.cost && (
                <div className="absolute -bottom-1 -right-1 bg-[#4fc3f7] text-white text-xs px-1 py-0.5 rounded-full font-bold">
                  {character.cost}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          {selectedCharacter.owned ? (
            <LearningButton variant="success" size="lg">
              ✓ Selected
            </LearningButton>
          ) : selectedCharacter.cost ? (
            <LearningButton 
              variant="accent" 
              size="lg"
              onClick={() => handleCharacterSelect(selectedCharacter)}
            >
              Buy for {selectedCharacter.cost} 🪙
            </LearningButton>
          ) : (
            <LearningButton 
              variant="primary" 
              size="lg"
              onClick={() => handleCharacterSelect(selectedCharacter)}
            >
              Select
            </LearningButton>
          )}
        </div>
      </section>

      {/* Insufficient Funds Modal */}
      <InsufficientFundsModal
        isOpen={showInsufficientFundsModal}
        onClose={handleCloseInsufficientFundsModal}
        requiredCoins={selectedCharacter.cost || 0}
        currentCoins={userCoins}
        characterName={selectedCharacter.name}
      />
    </div>
  )
}

export default RewardsScreen
