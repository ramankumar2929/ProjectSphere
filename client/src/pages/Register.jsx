import AuthLayout from "../components/AuthLayout";
import RegisterForm from "../components/RegisterForm";

function Register() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join ProjectSphere and showcase your work."
    >
      <RegisterForm />
    </AuthLayout>
  );
}

export default Register;

