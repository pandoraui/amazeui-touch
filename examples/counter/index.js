import React from 'react'
import { render } from 'react-dom'
// 将 redux 与 react 相关的部分，如 connector provider 单独抽取出来
import { Provider } from 'react-redux'
import App from './containers/App'
import configureStore from './store/configureStore'

const store = configureStore()

// provider将store作为context往子节点进行传递，并实现store的热替换
// 在provider内的组件其实可以不通过connect来拿到dispatch以及state，
// 而直接通过context拿到store对象，不过作者不推荐这么做。
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
