import { useState } from 'react';
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <p className='bg-red-500 m-2 border-green-600 text-black rounded-sm'>Hello world</p>
    </>
  )
}

export default App