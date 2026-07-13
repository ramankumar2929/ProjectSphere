import {Routes,Route} from "react-router-dom"

import Landing from "../pages/Landing"
import Home from "../pages/Home"
import Login from "../pages/Login"
import Register from "../pages/Register"
import ProjectDetailsPage from "../pages/ProjectDetailsPage";
 

function AppRoutes(){
    return(
        <Routes>
            <Route path="/" element={<Landing/>}/>
            <Route path="/login" element= {<Login/>}/>
            <Route path="/register" element= {<Register/>}/>
            <Route path="/home" element={<Home/>}/>
            {/* Dynamic project details route */}
            <Route
                path="/project/:projectId"
                element={<ProjectDetailsPage />}
            />
        </Routes>
    )
}

export default AppRoutes