import { useState } from "react";
import { Eye, EyeOff, Loader2, Rocket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

function LoginForm() {

  // Used for redirecting after successful login
  const navigate = useNavigate();

  // State for showing/hiding password
  const [showPassword, setShowPassword] = useState(false);

  // Loading state for login button
  const [loading, setLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    identifier: "", // email OR username
    password: "",
  });

  // Handles input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handles login submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.identifier || !formData.password) {
      return toast.error("Please fill all fields");
    }

    try {
      setLoading(true);

      // Backend expects either email or username
      const payload = {
        password: formData.password,
      };

      // Detect whether user entered email or username
      if (formData.identifier.includes("@")) {
        payload.email = formData.identifier;
      } else {
        payload.username = formData.identifier;
      }

      console.log("hii")

      // API call to backend
      const response = await api.post(
        "/users/login",
        payload
      );
      // Success toast
      toast.success(response.data.message);

      console.log(response)
 
      // Redirect user after login
      navigate("/home");

    } catch (error) {

 

      // Error toast
      toast.error(
        error.response?.data?.message ||
        "Login Failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 relative overflow-hidden">

      {/* Background glow circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[140px]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px]"></div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md">

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">

          <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-4 backdrop-blur-xl">
            <Rocket size={40} className="text-blue-400" />
          </div>

          <h1 className="text-4xl font-bold text-white">
            Project<span className="text-blue-500">Sphere</span>
          </h1>

          <p className="text-slate-400 mt-3 text-center">
            Showcase projects, collaborate with developers
            and build your portfolio.
          </p>

        </div>

        {/* Glassmorphism Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">

          {/* Heading */}
          <div className="mb-8 text-center">

            <h2 className="text-3xl font-bold text-white">
              Welcome Back 👋
            </h2>

            <p className="text-slate-400 mt-2">
              Sign in to continue your journey.
            </p>

          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Username or Email */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email or Username
              </label>

              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter your email or username"
                className="
                  w-full
                  px-4 py-3
                  rounded-xl
                  bg-slate-800/70
                  border border-slate-700
                  text-white
                  placeholder-slate-400
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                  transition-all duration-300
                "
              />
            </div>

            {/* Password Field */}
            <div>

              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="
                    w-full
                    px-4 py-3 pr-12
                    rounded-xl
                    bg-slate-800/70
                    border border-slate-700
                    text-white
                    placeholder-slate-400
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                    transition-all duration-300
                  "
                />

                {/* Password Visibility Toggle */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-white
                    transition
                  "
                >
                  {
                    showPassword
                      ? <EyeOff size={20} />
                      : <Eye size={20} />
                  }
                </button>

              </div>

            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                py-3
                rounded-xl
                bg-blue-600
                hover:bg-blue-700
                disabled:bg-blue-400
                text-white
                font-semibold
                transition-all duration-300
                hover:scale-[1.02]
                active:scale-[0.98]
                flex
                justify-center
                items-center
                gap-2
              "
            >
              {
                loading
                  ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Signing In...
                    </>
                  )
                  : (
                    "Sign In"
                  )
              }
            </button>

            {/* Register Redirect */}
            <p className="text-center text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="
                  text-blue-400
                  hover:text-blue-300
                  font-medium
                "
              >
                Create Account
              </Link>
            </p>

          </form>

        </div>

      </div>

    </div>
  );
}

export default LoginForm;