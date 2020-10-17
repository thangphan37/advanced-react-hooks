// useContext: Caching response data in context
// 💯 caching in a context provider (exercise)
// http://localhost:3000/isolated/exercise/03.extra-2.js

// you can edit this here and look at the isolated page or you can copy/paste
// this in the regular exercise file.

import React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'
import {useAsync} from '../utils'

/*
  -Should create a function hook to check Provider(example: usePokemon())
  -Prop drilling(pass props to child element) can cause some real pain -> use React's Context API or composition model
  -Example composition model: we will use children props in Dashboard and DashboardContent component.
    <Dashboard>
      <DashboardNav />
      <DashboardContent>
        <WelcomeMessage user={currentUser}/>
      </DashboardContent>
    </Dashboard>

    function Dashboard({children}) {
      return (
        <div>
          <h1>Dashboard</h1>
          {children}
        </div>
      )
    }
*/


// 🐨 Create a PokemonCacheContext
const PokemonCacheContext = React.createContext()

function PokemonCacheProvider({children}) {
  const [cache, dispatch] = React.useReducer(pokemonCacheReducer, {})

  return (
    <PokemonCacheContext.Provider value={[cache, dispatch]}>
      {children}
    </PokemonCacheContext.Provider>
  )
}

// 🐨 create a PokemonCacheProvider function
// 🐨 useReducer with pokemonCacheReducer in your PokemonCacheProvider
// 💰 you can grab the one that's in PokemonInfo
// 🐨 return your context provider with the value assigned to what you get back from useReducer
// 💰 value={[cache, dispatch]}
// 💰 make sure you forward the props.children!

function pokemonCacheReducer(state, action) {
  switch (action.type) {
    case 'ADD_POKEMON': {
      return {...state, [action.pokemonName]: action.pokemonData}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function usePokemon() {
  const pokemonContextValue = React.useContext(PokemonCacheContext)

  if(!pokemonContextValue) {
    throw new Error('usePokemon must be used within a PokemonCacheProvider')
  }

  const [cache, dispatch] = pokemonContextValue
  
  return [cache, dispatch]
}

function PokemonInfo({pokemonName}) {
  // 💣 remove the useReducer here (or move it up to your PokemonCacheProvider)
  // 🐨 get the cache and dispatch from useContext with PokemonCacheContext
  const [cache, dispatch] = usePokemon()
  const {data: pokemon, status, error, run, setData} = useAsync()

  React.useEffect(() => {
    if (!pokemonName) {
      return
    } else if (cache[pokemonName]) {
      setData(cache[pokemonName])
    } else {
      run(
        fetchPokemon(pokemonName).then(pokemonData => {
          dispatch({type: 'ADD_POKEMON', pokemonName, pokemonData})
          return pokemonData
        }),
      )
    }
  }, [cache, pokemonName, run, setData])

  if (status === 'idle') {
    return 'Submit a pokemon'
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'rejected') {
    throw error
  } else if (status === 'resolved') {
    return <PokemonDataView pokemon={pokemon} />
  }
}

function PreviousPokemon({onSelect}) {
  // 🐨 get the cache from useContext with PokemonCacheContext
  // const cache = {}
  const [cache] = usePokemon()
  return (
    <div>
      Previous Pokemon
      <ul style={{listStyle: 'none', paddingLeft: 0}}>
        {Object.keys(cache).map(pokemonName => (
          <li key={pokemonName} style={{margin: '4px auto'}}>
            <button
              style={{width: '100%'}}
              onClick={() => onSelect(pokemonName)}
            >
              {pokemonName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PokemonSection({onSelect, pokemonName}) {
  // 🐨 wrap this in the PokemonCacheProvider so the PreviousPokemon
  // and PokemonInfo components have access to that context.
  return (
    <div style={{display: 'flex'}}>
      <PokemonCacheProvider>
        <PreviousPokemon onSelect={onSelect} />
        <div className="pokemon-info" style={{marginLeft: 10}}>
          <PokemonErrorBoundary
            onReset={() => onSelect('')}
            resetKeys={[pokemonName]}
            >
            <PokemonInfo pokemonName={pokemonName} />
          </PokemonErrorBoundary>
        </div>
      </PokemonCacheProvider>
    </div>
  )
}

function App() {
  const [pokemonName, setPokemonName] = React.useState(null)

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleSelect(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <PokemonSection onSelect={handleSelect} pokemonName={pokemonName} />
    </div>
  )
}

export default App
