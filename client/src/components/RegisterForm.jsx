import { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Upload,
  User,
  Mail,
  Lock,
  FileText,
  Code,
  Globe
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

function RegisterForm() {

  // Navigation after successful registration
  const navigate = useNavigate();

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loader state for button animation
  const [loading, setLoading] = useState(false);

  // Avatar preview
  const [avatarPreview, setAvatarPreview] = useState(null);

  // All form fields
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    skills: "",
    github: "",
    linkedIn: "",
    avatar: null
  });

  // Handles all input fields except avatar preview
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handles avatar upload separately
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      avatar: file
    }));

    // Create image preview
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      // Required because backend uses multer
      const data = new FormData();

      data.append("fullName", formData.fullName);
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("bio", formData.bio);
      data.append("skills", formData.skills);
      data.append("github", formData.github);
      data.append("linkedIn", formData.linkedIn);
      data.append("avatar", formData.avatar);

      const response = await api.post(
        "/users/register",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      toast.success(response.data.message);

      // Redirect to login after registration
      navigate("/login");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Registration Failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-slate-950 relative overflow-hidden py-20 px-4">

  {/* Background glow */}
  <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 blur-[140px] rounded-full"></div>
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 blur-[140px] rounded-full"></div>

  <div className="relative z-10 max-w-5xl mx-auto bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-10">

    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {/* Header */}
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-400 to-purple-500">
          Create Account
        </h1>

        <p className="text-slate-400 text-lg">
          Join India's Student Builder Community
        </p>
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4">

        <label className="cursor-pointer">

          <div className="
              w-36 h-36
              rounded-full
              border-2 border-blue-500/50
              flex items-center justify-center
              overflow-hidden
              bg-slate-900
              hover:scale-105
              hover:border-cyan-400
              transition-all duration-300
              shadow-[0_0_40px_rgba(59,130,246,0.35)]
                           ">

            {
              avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload
                  className="text-blue-400"
                  size={40}
                />
              )
            }

          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

        </label>

        <p className="text-sm text-slate-400">
          Upload Profile Picture
        </p>
      </div>

      {/* Two column layout */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Full Name */}
        <InputField
          icon={<User size={18} />}
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
        />

        {/* Username */}
        <InputField
          icon={<User size={18} />}
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />

        {/* Email */}
        <InputField
          icon={<Mail size={18} />}
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
        />

        {/* Skills */}
        <InputField
          icon={<Code size={18} />}
          name="skills"
          placeholder="Skills (React, Node, MongoDB)"
          value={formData.skills}
          onChange={handleChange}
        />
      </div>

      {/* Password */}
      <PasswordField
        show={showPassword}
        toggle={() => setShowPassword(!showPassword)}
        value={formData.password}
        name="password"
        placeholder="Password"
        onChange={handleChange}
      />

      {/* Confirm Password */}
      <PasswordField
        show={showConfirmPassword}
        toggle={() =>
          setShowConfirmPassword(!showConfirmPassword)
        }
        value={formData.confirmPassword}
        name="confirmPassword"
        placeholder="Confirm Password"
        onChange={handleChange}
      />

      {/* Bio */}
      <div className="relative">
        <FileText className="absolute left-4 top-4 text-slate-400" size={18}/>
        <textarea
          name="bio"
          rows="4"
          placeholder="Tell the community about yourself..."
          value={formData.bio}
          onChange={handleChange}
          className="w-full pl-12 p-4 rounded-2xl bg-slate-800/70 border border-slate-700 text-white outline-none focus:border-blue-500"
        />
      </div>

      {/* Github */}
      <InputField
        icon={<Globe size={18} />}
        name="github"
        placeholder="Github Profile URL"
        value={formData.github}
        onChange={handleChange}
      />

      {/* Linkedin */}
      <InputField
        icon={<Globe size={18} />}
        name="linkedIn"
        placeholder="LinkedIn Profile URL"
        value={formData.linkedIn}
        onChange={handleChange}
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="
                  w-full
                  py-4
                  rounded-2xl
                  font-bold
                  text-lg
                  bg-linear-to-r
                  from-blue-600
                  to-purple-600
                  hover:from-blue-500
                  hover:to-purple-500
                  text-white
                  transition-all duration-300
                  hover:scale-[1.02]
                  shadow-[0_0_40px_rgba(59,130,246,0.35)]"
      >
        {
          loading ? (
            <div className="flex justify-center gap-2">
              <Loader2 className="animate-spin"/>
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )
        }
      </button>

      {/* Login redirect */}
      <p className="text-center text-slate-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-400 hover:text-blue-300"
        >
          Sign In
        </Link>
      </p>

    </form>

    </div>
    </div>
  );
}

/* Reusable input component */
function InputField({
  icon,
  ...props
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </div>

      <input
        {...props}
        className="
              w-full
              pl-12
              py-4
              rounded-2xl
              bg-slate-800/50
              backdrop-blur-lg
              border border-slate-700
              text-white
              placeholder-slate-400
              outline-none
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/20
              transition-all duration-300"
      />
    </div>
  );
}

/* Password component */
function PasswordField({
  show,
  toggle,
  ...props
}) {
  return (
    <div className="relative">

      <Lock
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        size={18}
      />

      <input
        {...props}
        type={show ? "text" : "password"}
        className="
              w-full
              pl-12
              py-4
              rounded-2xl
              bg-slate-800/50
              backdrop-blur-lg
              border border-slate-700
              text-white
              placeholder-slate-400
              outline-none
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/20
              transition-all duration-300"
      />

      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
      >
        {show ? <EyeOff size={20}/> : <Eye size={20}/>}
      </button>

    </div>
  );
}

export default RegisterForm;