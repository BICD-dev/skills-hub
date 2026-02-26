import { Routes, Route } from "react-router-dom";
import LeadConferenceForm from "./page/form";
const App = () => {
  return ( 
    <div className="App">
      <Routes>
        <Route path="/" element={<LeadConferenceForm />} />
      </Routes>
    </div>
   );
}
 
export default App;