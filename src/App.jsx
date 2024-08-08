import './App.css'
import Choices from './Home/Choices';
import Index from './Home/Index';
import ForgetPass from './Auth/ForgetPass'
import Reset from './Auth/Reset'
import Signin from './Auth/Signin'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Recommendation from './Home/Recommendations';
import MovieDetail from './Home/MovieDetail';


function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' Component={Index} />
        <Route path='/choices' Component={Choices} />
        <Route path='/recommendations' Component={Recommendation}/>
        <Route path='/movie/:movie_name' Component={MovieDetail}/>
        <Route path='/signin' Component={Signin}/>
        <Route path='/reset' Component={Reset}/>
        <Route path='/forget' Component={ForgetPass}/>
      </Routes>
    </Router>
  )
}

export default App;