import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/counter';


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

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
