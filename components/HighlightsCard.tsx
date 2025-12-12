import Image from 'next/image'

interface CardProps {
  title: string
  color: string
  textColor: string
  icon: string
  description: string
}

const HighlightsCard = ({
  title,
  color,
  textColor,
  icon,
  description,
}: CardProps) => {
  return (
    <div className={`${color} text-white rounded-xl pt-2 pb-2 px-2 w-full`}>
      <h3 className="text-xl text-center font-bold mb-2">{title}</h3>
      <div className="bg-white rounded-lg flex items-center justify-center p-3">
        <Image src={icon} alt="Flag Icon" width={30} height={30} />
        <p className={`${textColor} text-2xl font-bold ml-2`}>{description}</p>
      </div>
    </div>
  )
}

export default HighlightsCard
