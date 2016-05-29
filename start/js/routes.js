import React from 'react'
import { Router, Route, Link, browserHistory } from 'react-router'
import App from './containers/App'
import UserPage from './containers/UserPage'
import RepoPage from './containers/RepoPage'
import NotFound from './containers/NotFound'

let NoMatch = NotFound;

// <IndexRoute component={RepoPage} />
export default (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="/:login/:name" component={RepoPage} />
      <Route path="/:login" component={UserPage} />
      <Route path="*" component={NotFound}/>
    </Route>
  </Router>
)


/**
  https://github.com/rackt/react-router

  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="about" component={About}/>
      <Route path="users" component={Users}>
        <Route path="/user/:userId" component={User}/>
      </Route>
      <Route path="*" component={NoMatch}/>
    </Route>
  </Router>
*/
