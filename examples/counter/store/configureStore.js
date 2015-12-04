import { createStore, applyMiddleware } from 'redux'
// redux midlleware repositories
import thunk from 'redux-thunk'
import reducer from '../reducers'


// applyMiddleware 这个是个什么鬼，柯立化了？
const createStoreWithMiddleware = applyMiddleware(
  thunk
)(createStore)

// http://segmentfault.com/a/1190000003033033
//
// import logMiddleware from '../middleWares/logMiddleware.js';
// const createStoreWithMiddleware = applyMiddleware(thunk, logMiddleware)(createStore);
// const store = createStoreWithMiddleware(reducer);
// 使用 middleWare thunk， 如果没有自定义中间层的需求可以直接写
// const store = createStore(reducer);

export default function configureStore(initialState) {
  const store = createStoreWithMiddleware(reducer, initialState)

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers')
      store.replaceReducer(nextReducer)
    })
  }

  return store
}
