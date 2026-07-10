import AuthLayout from "../components/AuthLayout"
import LoginForm from "../components/LoginForm"

function Login (){

    return (
        <AuthLayout
        title = "Welcomce Back"
        subtitle="Sign in to continue your Journey"
        >
            <LoginForm/>
        </AuthLayout>
    )

}

export default Login

