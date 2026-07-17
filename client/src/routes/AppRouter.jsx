import {Routes,Route} from "react-router-dom"

import Landing from "../pages/Landing"
import Home from "../pages/Home"
import Login from "../pages/Login"
import Register from "../pages/Register"
import ProjectDetailsPage from "../pages/ProjectDetailsPage";
import CreateProjectPage from "../pages/CreateProjectPage";

 

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
            <Route path="/projects/new" element={<CreateProjectPage />} />
            <Route path="/profile" element={}/>
        </Routes>
    )
}

export default AppRoutes