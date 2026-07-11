import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api.js";

function LoginForm() {

  // For redirecting after successful login
  const navigate = useNavigate();

  // For showing or hiding password
  const [showPassword, setShowPassword] = useState(false);

  // Loading state for button animation
  const [loading, setLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    identifier: "", // email OR username
    password: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Login submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.identifier || !formData.password) {
      return toast.error("Please fill all fields");
    }

    try {
      setLoading(true);

      // Backend expects either username or email
      const payload = {
        password: formData.password,
      };

      // Detect whether user entered email or username
      if (formData.identifier.includes("@")) {
        payload.email = formData.identifier;
      } else {
        payload.username = formData.identifier;
      }

      // Send request to backend
      const response = await api.post(
        "/users/login",
        payload
      );

      

      // Success toast
      toast.success(response.data.message);

      // Optional: save user data if needed
      console.log(response.data.data);

      // Redirect to home page
      navigate("/");

    } catch (error) {

      // Backend error handling
      toast.error(
        error.response?.data?.message ||
        "Login failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      {/* =========================
          Email or Username Input
      ========================== */}
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
            px-4
            py-3
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

      {/* =========================
             Password Input
      ========================== */}
      <div>
        <label className="block text-sm text-slate-300 mb-2">
          Password
        </label>

        <div className="relative">

          {/* Password field */}
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="
              w-full
              px-4
              py-3
              pr-12
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

          {/* Eye button */}
          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
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
            {showPassword
              ? <EyeOff size={20} />
              : <Eye size={20} />
            }
          </button>

        </div>
      </div>

      {/* =========================
              Login Button
      ========================== */}
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
          transition-all
          duration-300
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

      {/* =========================
            Register Redirect
      ========================== */}
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
  );
}

export default LoginForm;