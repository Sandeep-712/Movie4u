import './App.css'
import Choices from './Home/Choices';
import Index from './Home/Index';
// import ForgetPass from './Auth/ForgetPass'
// import Reset from './Auth/Reset'
// import Signin from './Auth/Signin'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Recommendation from './Home/Recommendations';

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' Component={Index} />
        <Route path='/choices' Component={Choices} />
        <Route path='/recommendations' Component={Recommendation}/>
      </Routes>
    </Router>
  )
}

export default App;