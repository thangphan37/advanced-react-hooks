// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

/*
  function is defined insde the component function body,
  it's re-initialized every render -> useEffect will be called every render
    const updateLocalStorage = () => window.localStorage.setItem('count', count)
    React.useEffect(() => {
      updateLocalStorage()
    }, [updateLocalStorage]) // <-- function as a dependency
*/

import React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

function pokemonInfoReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function useSafeDispatch(dispatch) {
  const mounted = React.useRef(false)

  React.useEffect(() => {
    mounted.current = true
    return () => mounted.current = false
  }, [])

  return React.useCallback((action) => {
    if(mounted.current) {
      return dispatch(action)
    }

    return
  }, [dispatch])
}

function useAsync(status) {
  const [state, initialDispatch] = React.useReducer(pokemonInfoReducer, {
    ...status,
    data: null,
    error: null,
  })

  const dispatch = useSafeDispatch(initialDispatch)

  const run = React.useCallback((promise) => {
    if (!promise) {
      return
    }
    
    dispatch({type: 'pending'})
    promise.then(
      pokemon => {
        dispatch({type: 'resolved', data: pokemon})
      },
      error => {
        dispatch({type: 'rejected', error})
      },
    )
  }, [dispatch])

  const {data, error} = state;
  return {data, status: state.status, error, run };
}

function PokemonInfo({pokemonName}) {
  const {data: pokemon, status, error, run} = useAsync({status: pokemonName ? 'pending' : 'idle'})

  React.useEffect(() => {
    if(!pokemonName) {
      return
    }
    return run(fetchPokemon(pokemonName))
  }, [pokemonName, run])

  if (status === 'idle' || !pokemonName) {
    return 'Submit a pokemon'
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'rejected') {
    throw error
  } else if (status === 'resolved') {
    return <PokemonDataView pokemon={pokemon} />
  }

  throw new Error('This should be impossible')
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

export default App
