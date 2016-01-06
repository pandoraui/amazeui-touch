import React from 'react';
import { render } from 'react-dom';
// 将 redux 与 react 相关的部分，如 connector provider 单独抽取出来
import { Provider } from 'react-redux';
import App from './pages/App';
import configureStore from './store/configureStore';

const store = configureStore();

let rootElement = document.getElementById('root');
render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
);
