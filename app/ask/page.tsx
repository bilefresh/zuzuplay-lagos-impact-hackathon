import Footer from '@/components/common/Footer'
import AskScreen from '@/components/screens/learning/AskScreen'
import { Suspense } from 'react'

const Ask = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <AskScreen />
      </Suspense>
    </>
  )
}

export default Ask
