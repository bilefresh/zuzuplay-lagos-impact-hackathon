"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import nonSpecial from "../../../assets/icons/non-special.svg";
import nonSpecialActive from "../../../assets/icons/nonSpecial-active.svg";
import restart from "../../../assets/icons/restart.svg";
import restartActive from "../../../assets/icons/restart-active.svg";
import sloMo from "../../../assets/icons/slo-mo.svg";
import sloMoActive from "../../../assets/icons/slo-mo-active.svg";
import { apiService } from "@/middleware/apiService";
import { getUserInfo } from "@/middleware/general";
import { getCoinBalance, spendCoins, addCoins } from "@/lib/coinStorage";
import { CoinDisplay } from "@/components/design-system/CoinDisplay";
import { InsufficientFundsModal } from "@/components/design-system/InsufficientFundsModal";
import { LearningButton } from "@/components/design-system/LearningButton";
import "@/lib/coinTestUtils";

type Character = {
  id: number;
  name: string;
  image: string;
  activeImage: string;
  ability: string;
  cost?: number;
  selected?: boolean;
  owned?: boolean;
};

const characters: Character[] = [
  {
    id: 1,
    name: "No special abilities",
    image: nonSpecial,
    activeImage: nonSpecialActive,
    ability: "",
    selected: true,
    owned: true,
  },
  {
    id: 2,
    name: "Restart",
    image: restart,
    activeImage: restartActive,
    ability: "Restart",
    cost: 900,
    selected: false,
    owned: false,
  },
  {
    id: 3,
    name: "Slo-mo",
    image: sloMo,
    activeImage: sloMoActive,
    ability: "Slo-mo",
    cost: 1160,
    selected: false,
    owned: false,
  },
];
const defaultUser = getUserInfo();

const RewardsScreen = () => {
  const [charactersState, setCharactersState] = useState(characters);
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);
  const [userCoins, setUserCoins] = useState(0);
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] =
    useState(false);
  const [user, setUser] = useState(defaultUser);
  const [justPurchased, setJustPurchased] = useState(false);

  useEffect(() => {
    setUserCoins(getCoinBalance());
  }, []);

  useEffect(() => {
    apiService.profile().then((res) => {
      setUser(res);
    });
  }, []);

  const handleCharacterSelect = (character: Character) => {
    if (character.owned) {
      setSelectedCharacter(character);
      const updatedCharacters = charactersState.map((char) =>
        char.id === character.id
          ? { ...char, selected: true }
          : { ...char, selected: false }
      );
      setCharactersState(updatedCharacters);
      return;
    }

    if (character.cost) {
      if (userCoins >= character.cost) {
        const success = spendCoins(
          character.cost,
          `Bought ${character.name} character`
        );
        if (success) {
          setJustPurchased(true);
          setTimeout(() => setJustPurchased(false), 1500);

          const updatedCharacters = charactersState.map((char) => {
            if (char.id === character.id) {
              return { ...char, owned: true, selected: true };
            } else {
              return { ...char, selected: false };
            }
          });
          setCharactersState(updatedCharacters);
          setSelectedCharacter({ ...character, owned: true });
          setUserCoins(getCoinBalance());
        }
      } else {
        setShowInsufficientFundsModal(true);
      }
    } else {
      setSelectedCharacter(character);
      const updatedCharacters = charactersState.map((char) =>
        char.id === character.id
          ? { ...char, selected: true }
          : { ...char, selected: false }
      );
      setCharactersState(updatedCharacters);
    }
  };

  const handleCloseInsufficientFundsModal = () => {
    setShowInsufficientFundsModal(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-400/5 rounded-full blur-3xl animate-spin-slow" />

      {/* Coin Display */}
      <div className="w-full flex justify-between items-center px-4 py-2 relative z-10">
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={() => {
              addCoins(500, "Test coins");
              setUserCoins(getCoinBalance());
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            +500 Coins
          </button>
        )}

        <div className="ml-auto">
          <CoinDisplay coins={userCoins} size="md" />
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center pb-2 animate-fade-in-down">
        <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-primary via-cyan-600 to-primary bg-clip-text text-transparent animate-gradient-x">
          Character Shop
        </h1>
        <p className="text-gray-600 text-sm font-medium">
          Choose your racing champion
        </p>
      </div>

      {/* Main Content - Flex container */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 pb-12 relative z-10">
        {/* Selected Character Display */}
        <div className="w-full max-w-sm mb-6 animate-fade-in">
          <div className="relative mx-auto">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-cyan-500/30 to-secondary/30 rounded-3xl blur-2xl animate-pulse-glow" />

            {/* Main card */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/60 shadow-2xl">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-3xl animate-shine" />

              {/* Character image container */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                {/* Rotating rings */}
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/30 animate-spin-slow" />
                <div className="absolute inset-1 rounded-full border-4 border-dashed border-secondary/30 animate-spin-reverse" />

                {/* Character image */}
                <div
                  className={`absolute inset-3 flex items-center justify-center ${
                    justPurchased ? "animate-bounce-in" : "animate-float"
                  }`}
                >
                  <Image
                    src={selectedCharacter.activeImage}
                    alt={selectedCharacter.name}
                    width={120}
                    height={120}
                    className="object-contain drop-shadow-2xl max-h-full max-w-full"
                  />
                </div>
              </div>

              {/* Character info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {selectedCharacter.name}
                </h3>
                <p className="text-gray-600 text-sm font-medium">
                  {selectedCharacter.ability || "Default character"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Character Selection */}
        <div className="flex flex-col items-center animate-fade-in-up">
          <div className="flex gap-4 mb-5">
            {charactersState.map((character, index) => (
              <div
                key={character.id}
                className="relative group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card glow */}
                {character.selected && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-cyan-500 to-secondary rounded-2xl blur-lg opacity-75 animate-pulse-glow" />
                )}

                {/* Main card */}
                <div
                  className={`relative py-4 px-6 rounded-2xl cursor-pointer transition-all duration-500 transform ${
                    character.selected
                      ? "bg-gradient-to-br from-primary to-cyan-600 scale-105 shadow-2xl"
                      : character.owned
                      ? "bg-gradient-to-br from-blue-900 to-blue-950 hover:scale-105 hover:shadow-xl"
                      : "bg-gradient-to-br from-gray-700 to-gray-800 opacity-60 hover:opacity-90 hover:scale-105"
                  }`}
                  onClick={() => handleCharacterSelect(character)}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl animate-shimmer" />

                  {/* Character image */}
                  <div
                    className={`relative ${
                      character.selected ? "animate-bounce-gentle" : ""
                    }`}
                  >
                    <Image
                      src={
                        character.selected
                          ? character.activeImage
                          : character.image
                      }
                      alt={character.name}
                      width={70}
                      height={70}
                      className={`object-contain transition-all duration-300 ${
                        character.selected
                          ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                          : ""
                      }`}
                    />
                  </div>

                  {/* Ownership check mark */}
                  {character.owned && !character.selected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce-in border-2 border-white">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}

                  {/* Cost badge */}
                  {!character.owned && character.cost && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-secondary to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg animate-pulse border-2 border-white">
                      {character.cost} 🪙
                    </div>
                  )}

                  {/* Lock icon */}
                  {!character.owned && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-3xl opacity-50">🔒</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div
            className={`${
              justPurchased ? "animate-bounce-in" : "animate-fade-in"
            }`}
          >
            {selectedCharacter.owned ? (
              <button className="relative px-6 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white font-bold text-base rounded-2xl shadow-lg overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <span className="relative flex items-center gap-2">
                  <span className="text-xl animate-bounce-gentle">✓</span>
                  Selected
                </span>
              </button>
            ) : selectedCharacter.cost ? (
              <button
                onClick={() => handleCharacterSelect(selectedCharacter)}
                className="relative px-6 py-3 bg-gradient-to-r from-secondary via-yellow-500 to-orange-500 text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <span className="relative flex items-center gap-2">
                  <span className="text-lg">🛒</span>
                  Buy for {selectedCharacter.cost} 🪙
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleCharacterSelect(selectedCharacter)}
                className="relative px-6 py-3 bg-gradient-to-r from-primary to-cyan-600 text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <span className="relative">Select Character</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Insufficient Funds Modal */}
      <InsufficientFundsModal
        isOpen={showInsufficientFundsModal}
        onClose={handleCloseInsufficientFundsModal}
        requiredCoins={selectedCharacter.cost || 0}
        currentCoins={userCoins}
        characterName={selectedCharacter.name}
      />

      <style jsx global>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(30deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(30deg);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes bounce-gentle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-shine {
          animation: shine 3s infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default RewardsScreen;
