import { Routes, Route } from "react-router-dom";
import LeadConferenceForm from "./page/Form";
import PaymentVerification from "./page/RedirectPage";
import "./App.css";
const App = () => {
  return ( 
    <div className="App">
      <Routes>
        <Route path="/" element={<LeadConferenceForm />} />
        <Route path="/registration/success" element={<PaymentVerification />} />
      </Routes>
    </div>
   );
}
 
export default App;
