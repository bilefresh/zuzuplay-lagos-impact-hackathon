interface ProgressBarProps {
  progress: number
  height: number
}

const ProgressBar = ({ progress, height }: ProgressBarProps) => {
  return (
    <div className={`w-full h-5 bg-gray-300 relative rounded-full`}>
      <div
        className="h-full flex flex-col bg-[#4fc3f7] transition-all duration-300 rounded-full px-2"
        style={{ width: `${progress}%` }}
      >
        <span className="h-1 rounded-xl bg-[#4fc3f7] m-1"></span>
      </div>
    </div>
  )
}

export default ProgressBar
