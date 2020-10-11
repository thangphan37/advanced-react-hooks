// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import React from 'react'

/*
  1,useState three difference ways:
    -useState() //no initial value
    -useState(initialValue) //a literal initial value
    -useState(() => initialValue) //a lazy initial value
  2,Can implement useState with useReducer:
    const useState = initialCount => React.useReducer(countReducer, {count: initialCount}, initialCountReducer)
    //render:
    const [state, setState] = useState(initialCount)
  3,initialCountReducer:
    case read into localStorage or something else that we wouldn't want happening every re-render
*/

const countReducer = (prevState, newState) => typeof newState === 'function' ? newState(prevState) : newState
const initialCountReducer = initialCount => typeof initialCount === 'function' ? initialCount() : initialCount

//Extra Credit 4
function traditionCountReducer(state, action) {
  switch(action.type) {
    case 'INCREMENT':
      return {...state, count: state.count + action.step}
    default: 
      throw new Error(`Unhandled reducer with action: ${action.type}`)
  }
}

function Counter({initialCount = 0, step = 1}) {
  const [state, setState] = React.useReducer(countReducer, () => ({
    count: initialCount
  }), initialCountReducer)

  //Extra Credit 4
  // const [state, dispatch] = React.useReducer(traditionCountReducer, {
  //   count: initialCount
  // })

  // const traditionIncrement = () => dispatch({type: 'INCREMENT', step})
  const increment = () => setState(currentState => ({count: currentState.count + step}))
  return <button onClick={increment}>{state.count}</button>
}

function App() {
  return <Counter />
}

export default App
