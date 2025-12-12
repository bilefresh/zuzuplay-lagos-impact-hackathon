import Image from 'next/image'
import logo from '../../../assets/icons/logo.svg'
import flagIcon from '../../../assets/icons/flag.svg'
import coinsIcon from '../../../assets/icons/coins.svg'
import timerIcon from '../../../assets/icons/timer.svg'
import HighlightsCard from '@/components/HighlightsCard'

const highlights = [
  {
    id: 1,
    title: 'Accuracy',
    color: 'bg-[#219653]',
    textColor: 'text-[#219653]',
    icon: flagIcon,
    description: '95%',
  },
  {
    id: 2,
    title: 'Time',
    color: 'bg-[#3651AB]',
    textColor: 'text-[#3651AB]',
    icon: timerIcon,
    description: '2:36',
  },
  {
    id: 3,
    title: 'Coins',
    color: 'bg-[#06113C]',
    textColor: 'text-[#06113C]',
    icon: coinsIcon,
    description: '40',
  },
]

const SummaryScreen = () => {
  return (
    <div className="text-black space-y-10 pt-20 flex items-center justify-center flex-col">
      <section className="flex flex-col items-center justify-center">
        <Image src={logo} width={125} height={125} alt={''} />
        <span className="h-1 rounded w-10 bg-[#D9D9D9] mt-1"></span>
      </section>
      <section className="space-y-3">
        <h2 className="font-bold text-2xl text-center text-[#3651AB] mb-8">
          Lesson Highlights
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {highlights.map((highlight) => (
            <div key={highlight.id}>
              <HighlightsCard
                title={highlight.title}
                color={highlight.color}
                textColor={highlight.textColor}
                icon={highlight.icon}
                description={highlight.description}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default SummaryScreen
