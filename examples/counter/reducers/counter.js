import { INCREMENT_COUNTER, DECREMENT_COUNTER } from '../actions/counter'

// import React from 'react/addons';
// const update = React.addons.update;

// reducer 只需要声明初始状态以及state在接收到action之后的改变规则就可以了。
export default function counter(state = 0, action) {
  switch (action.type) {
    case INCREMENT_COUNTER:
      // 需要注意的是connector当select中的state发生变化时会做一个shallow equal的操作，
      // 所以如果需要 **操作引用值** 的时候一定不能直接赋值，
      // 需要使用addon中的update或者immutable.js，知道看到这两个工具又不想继续学了..其实很简单
      // 这样可以大大避免重复的render，从而提高性能
      // return update(state, {
      //   counter: {
      //     $set: state.counter + 1,
      //   },
      // });
      return state + 1;
    case DECREMENT_COUNTER:
      return state - 1;
    default:
      return state;
  }
}
