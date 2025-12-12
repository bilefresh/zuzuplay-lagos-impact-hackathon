interface ButtonProp {
  text: string
  handleNext: () => void
  isDisabled?: boolean // Optional prop to control button state
}

const Button = ({ handleNext, text, isDisabled }: ButtonProp) => {
  return (
    <button
      onClick={handleNext}
      disabled={isDisabled} // Disable the button when isDisabled is true
      className={`px-4 border-[#06113C] border-2 h-14 w-full max-w-xs ${
        isDisabled ? 'bg-[#FD6C22]/30' : 'bg-[#FD6C22]/100'
      } text-white rounded-lg flex items-center justify-center relative overflow-hidden ${
        isDisabled ? 'cursor-not-allowed' : ''
      }`}
    >
      {/* The span representing the progress */}
      <span
        className={`absolute h-1.5 top-1 w-[80%] mx-4 ${
          isDisabled ? 'bg-[#FEA679]/50' : 'bg-[#FEA679]/100'
        } rounded-xl`}
      ></span>
      {/* Button Text */}
      <span
        className={`relative z-10 ${
          !isDisabled ? 'text-[#3651AB]' : 'text-[#58514D]'
        } font-bold`}
      >
        {text}
      </span>
    </button>
  )
}

export default Button
