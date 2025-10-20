import InputScreen from './components/InputScreen'
import LoadingScreen from './components/LoadingScreen'
import Viewer3D from './components/Viewer3D'
import { useStore } from './store/useStore'

function App() {
  const { stage } = useStore()

  return (
    <div className="w-full h-full">
      {stage === 'input' && <InputScreen />}
      {stage === 'loading' && <LoadingScreen />}
      {stage === 'viewer' && <Viewer3D />}
    </div>
  )
}

export default App
