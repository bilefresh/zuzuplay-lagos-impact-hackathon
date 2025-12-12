interface ButtonProp {
  text: string
  handleClick: () => void
  isDisabled?: boolean
}

const PlainButton = ({ handleClick, text, isDisabled }: ButtonProp) => {
  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className="mt-16 p-3 w-full max-w-xs font-bold text-black border-2 border-black rounded mb-4 hover:bg-gray-800 hover:text-white"
    >
      {text}
    </button>
  )
}

export default PlainButton
