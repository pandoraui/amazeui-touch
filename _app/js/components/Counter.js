import React, { Component, PropTypes } from 'react';

class Counter extends Component {
  render() {
    const { increment, incrementIfOdd, incrementAsync, decrement, counter } = this.props;
    return (
      <p>
        Clicked: {counter} times
        {' '}
        <button className="btn btn-success btn-radius" onClick={increment}>+</button>
        {' '}
        <button className="btn btn-warning btn-radius" onClick={decrement}>-</button>
        {' '}
        <button className="btn btn-primary btn-radius" onClick={incrementIfOdd}>Increment if odd</button>
        {' '}
        <button className="btn btn-secondary btn-radius" onClick={() => incrementAsync()}>Increment async</button>
      </p>
    );
  }
}

Counter.propTypes = {
  increment: PropTypes.func.isRequired,
  incrementIfOdd: PropTypes.func.isRequired,
  incrementAsync: PropTypes.func.isRequired,
  decrement: PropTypes.func.isRequired,
  counter: PropTypes.number.isRequired
};

export default Counter;
