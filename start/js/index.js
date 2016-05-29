// import 'babel/lib/polyfill'
import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
// 将 redux 与 react 相关的部分，如 connector provider 单独抽取出来
import { Provider } from 'react-redux';
// import Root from './containers/Root'
// import App from './pages/App';
import { ReduxRouter } from 'redux-router'
import configureStore from './store/configureStore'

const store = configureStore()

// let rootElement = document.getElementById('root');
render(
  <Provider store={store}>
    <ReduxRouter />
  </Provider>,
  document.getElementById('root')
);
