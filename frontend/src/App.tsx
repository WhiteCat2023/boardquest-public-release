import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
        <div className="relative w-48 h-48 mb-12">
          <img src={heroImg} className="absolute inset-0 w-full h-full object-contain" width="170" height="179" alt="" />
          <img src={reactLogo} className="absolute -right-8 -bottom-4 w-20 h-20 animate-spin" alt="React logo" />
          <img src={viteLogo} className="absolute -left-8 -top-4 w-24 h-24" alt="Vite logo" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Get started</h1>
          <p className="text-lg text-gray-600">
            Edit <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/App.tsx</code> and save to test <code className="bg-gray-100 px-2 py-1 rounded text-sm">HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8"></div>

      <section className="py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <svg className="w-12 h-12 mb-4 text-blue-500" role="presentation" aria-hidden="true">
              <use href="/icons.svg#documentation-icon"></use>
            </svg>
            <h2 className="text-2xl font-bold mb-2">Documentation</h2>
            <p className="text-gray-600 mb-6">Your questions, answered</p>
            <ul className="space-y-4">
              <li>
                <a href="https://vite.dev/" target="_blank" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <img className="w-6 h-6" src={viteLogo} alt="" />
                  <span className="font-semibold">Explore Vite</span>
                </a>
              </li>
              <li>
                <a href="https://react.dev/" target="_blank" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <img className="w-6 h-6" src={reactLogo} alt="" />
                  <span className="font-semibold">Learn more</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <svg className="w-12 h-12 mb-4 text-blue-500" role="presentation" aria-hidden="true">
              <use href="/icons.svg#social-icon"></use>
            </svg>
            <h2 className="text-2xl font-bold mb-2">Connect with us</h2>
            <p className="text-gray-600 mb-6">Join the Vite community</p>
            <ul className="space-y-4">
              <li>
                <a href="https://github.com/vitejs/vite" target="_blank" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg
                    className="w-6 h-6"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <use href="/icons.svg#github-icon"></use>
                  </svg>
                  <span className="font-semibold">GitHub</span>
                </a>
              </li>
              <li>
                <a href="https://chat.vite.dev/" target="_blank" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg
                    className="w-6 h-6"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <use href="/icons.svg#discord-icon"></use>
                  </svg>
                  <span className="font-semibold">Discord</span>
                </a>
              </li>
              <li>
                <a href="https://x.com/vite_js" target="_blank" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg
                    className="w-6 h-6"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <use href="/icons.svg#x-icon"></use>
                  </svg>
                  <span className="font-semibold">X.com</span>
                </a>
              </li>
              <li>
                <a href="https://bsky.app/profile/vite.dev" target="_blank" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg
                    className="w-6 h-6"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <use href="/icons.svg#bluesky-icon"></use>
                  </svg>
                  <span className="font-semibold">Bluesky</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}

export default App
