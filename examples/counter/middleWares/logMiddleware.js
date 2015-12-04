
// http://segmentfault.com/a/1190000003033033
//
// 一般来说默认的thunk就够用了。我在例子里加了个log的中间层

// 打印触发的action
function logMiddleware() {
  // 这里的next是下一个middleWare
  return function(next) {
    return function(action) {
      // 打印此action并使用下一个middleWare处理该action
      console.log(action);
      next(action);
    };
  };
}

export default logMiddleware;

// 下面是默认的thunk middleWare

function thunkMiddleware(_ref) {
  var dispatch = _ref.dispatch;
  var getState = _ref.getState;

  return function (next) {
    return function (action) {
      // 如果是函数则将dispatch与getState作为参数执行函数，否则交给写一个middleware处理
      return typeof action === 'function' ? action(dispatch, getState) : next(action);
    };
  };
}
