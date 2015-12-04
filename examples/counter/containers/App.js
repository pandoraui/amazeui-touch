import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Counter from '../components/Counter'
import * as CounterActions from '../actions/counter'


// state 是各reducer中state的集合
function mapStateToProps(state) {
  // 从各reducer中挑选出component需要监听的state
  return {
    // counter1: state.reducer1.counter,
    // counter2: state.reducer2.counter,
    counter: state.counter
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(CounterActions, dispatch);
}

// 这个 connect 是什么？
// connect就是将store中的必要数据作为props传递给React组件来render，
// 并包装action creator用于在响应用户操作时dispatch一个action。

export default connect(mapStateToProps, mapDispatchToProps)(Counter);

/*
[React和Redux的连接react-redux](http://www.jianshu.com/p/94c988cf11f3)

connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])

mapStateToProps函数，返回值表示的是需要merge进props的state。默认值为() => ({})，即什么都不传。
  (state, props) => ({  }) // 通常会省略第二个参数

mapDispatchToProps是可以是一个函数，返回值表示的是需要merge仅props的actionCreators，这里的actionCreator应该是已经被包装了dispatch了的，推荐使用redux的bindActionCreators函数。
  (dispatch, props) => ({ // 通常会省略第二个参数
   ...bindActionCreators({
     ...ResourceActions
   }, dispatch)
  })

更方便的是可以直接接受一个对象，此时connect函数内部会将其转变为函数，这个函数和上面那个例子是一模一样的。

mergeProps用于自定义merge流程，下面这个是默认流程，parentProps值的就是组件自身的props，可以发现如果组件的props上出现同名，会被覆盖。

  (stateProps, dispatchProps, parentProps) => ({
    ...parentProps,
    ...stateProps,
    ...dispatchProps
  })

options共有两个开关：pure代表是否打开优化，详细内容下面会提，默认为true，withRef用来给包装在里面的组件一个ref，可以通过getWrappedInstance方法来获取这个ref，默认为false。

connect返回一个函数，它接受一个React组件的构造函数作为连接对象，最终返回连接好的组件构造函数。
*/

/* 通过上面写，做中间处理，不用写成下面这样子

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { Connector } from 'react-redux';
import Counter from '../components/Counter';
import actionCreators1 from '../actionCreators/actionCreators1.js';
import actionCreators2 from '../actionCreators/actionCreators2.js';

// state 是各reducer中state的集合
function select(state) {
  // 从各reducer中挑选出component需要监听的state
  return {
    counter1: state.reducer1.counter,
    counter2: state.reducer2.counter,
  };
}

export default class CounterApp extends Component {
  // select函数的返回值会与dispatch组装程一个object作为参数
  // 从这里看出connector就是帮忙拿到provider中store的dispatch方法以及挑选出需要使用的state
  renderChild({ counter1, counter2, dispatch}) {
    // 个人觉得这样使用action十分不方便，尤其是当组件只需要触发actions不需要监听store的变化的时候。我会偷懒通过context去拿到dispatch~~
    const actions1 = bindActionCreators(actionCreators1, dispatch);
    const actions2 = bindActionCreators(actionCreators2, dispatch);
    const props = { ...actions1, ...actions2, counter1, counter2 };
    // 所有的action以及state都会以props的形式提供给Counter，然后在Counter里面就可以为所欲为了~
    return <Counter {...props} />;
  }

  render() {
    return (
      <Connector select={select}>
        {this.renderChild}
      </Connector>
    );
  }
}
*/
