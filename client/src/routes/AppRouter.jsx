import {Routes,Route} from "react-router-dom"

import Landing from "../pages/Landing"
import Home from "../pages/Home"
import Login from "../pages/Login"
import Register from "../pages/Register"
import ProjectDetailsPage from "../pages/ProjectDetailsPage";
import CreateProjectPage from "../pages/CreateProjectPage";
import Profile from "../pages/Profile"
import EditProfile from "../pages/EditProfile"
import MyProjects from "../pages/MyProjects"
import EditProject from "../pages/EditProject"
import Projects from "../pages/Projects";
import Developers from "../pages/Developers"
import AITools from "../pages/AITools"
import Settings from "../pages/Settings"

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
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/profile/edit" element={<EditProfile/>}/>
            <Route path="/projects/mine" element ={<MyProjects/>}/>
            <Route path="/projects/edit/:projectId" element= {<EditProject/>}/>
            <Route path="/projects" element={<Projects />} />
            <Route path="/developers" element={<Developers />} />
            <Route path="/ai-tools" element={<AITools />} />
            <Route path="/settings" element={<Settings />} />
        </Routes>
    )
}

export default AppRoutes