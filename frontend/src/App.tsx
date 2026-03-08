import { Routes, Route } from "react-router-dom";
import LeadConferenceForm from "./page/Form";
import PaymentVerification from "./page/RedirectPage";
import AdminDashboard from "./page/AdminDashboard";
import "./App.css";
const App = () => {
  return ( 
    <div className="App">
      <Routes>
        <Route path="/" element={<LeadConferenceForm />} />
        <Route path="/registration/success" element={<PaymentVerification />} />
        <Route path="/admin/bright" element={<AdminDashboard />} />
      </Routes>
    </div>
   );
}
 
export default App;
