import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

// Password visibility toggle component - defined outside to prevent re-creation on each render
const PasswordInput = React.memo(({ value, onChange, placeholder, show, onToggle, inputRef, ...props }) => (
  <div className="relative">
    <input
      ref={inputRef}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      required
      {...props}
    />
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      tabIndex={-1}
    >
      {show ? "👁️" : "👁️‍🗨️"}
    </button>
  </div>
));

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [step, setStep] = useState("signin"); // "email", "code", "password", "signin", "forgot-password", "reset-code", "reset-password"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  
  const emailInputRef = useRef(null);
  const codeInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Auto-focus first input
  useEffect(() => {
    if (step === "signin" || step === "email" || step === "forgot-password") {
      emailInputRef.current?.focus();
    } else if (step === "code" || step === "reset-code") {
      codeInputRef.current?.focus();
    } else if (step === "password" || step === "reset-password") {
      passwordInputRef.current?.focus();
    }
  }, [step]);

  // Countdown timer for resend code
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Step 1: Submit email (sign up)
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/send-code", { email, isPasswordReset: false });
      if (response.data.success) {
        setStep("code");
        setSuccess("Verification code sent to your email!");
        setResendTimer(30);
        setIsPasswordReset(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  // Forgot password - send reset code
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", { email });
      if (response.data.success) {
        setStep("reset-code");
        setSuccess("Password reset code sent to your email!");
        setResendTimer(30);
        setIsPasswordReset(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send password reset code");
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isPasswordReset) {
        const response = await api.post("/auth/forgot-password", { email });
        if (response.data.success) {
          setSuccess("New verification code sent!");
          setResendTimer(30);
        }
      } else {
        const response = await api.post("/auth/send-code", { email, isPasswordReset: false });
        if (response.data.success) {
          setSuccess("New verification code sent!");
          setResendTimer(30);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code (sign up)
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/verify-code", { email, code });
      if (response.data.success) {
        setStep("password");
        setSuccess("Email verified successfully!");
        setIsNewUser(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  // Verify password reset code
  const handleResetCodeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/verify-reset-code", { email, code });
      if (response.data.success) {
        setStep("reset-password");
        setSuccess("Code verified! Please create a new password.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Create password (sign up)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters with at least one uppercase letter, one number, and one special character"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/create-password", {
        email,
        password,
      });
      if (response.data.success) {
        setSuccess("Account created successfully! Signing you in...");
        // Auto sign in
        const signInResult = await signIn(email, password);
        if (signInResult.success) {
          navigate("/dashboard");
        } else {
          setError(signInResult.error);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters with at least one uppercase letter, one number, and one special character"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        email,
        code,
        password,
      });
      if (response.data.success) {
        setSuccess("Password reset successfully! Signing you in...");
        // Auto sign in with new password
        const signInResult = await signIn(email, password);
        if (signInResult.success) {
          navigate("/dashboard");
        } else {
          setError(signInResult.error);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Handle sign in
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const signInResult = await signIn(email, password);
    if (signInResult.success) {
      navigate("/dashboard");
    } else {
      setError(signInResult.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="text-3xl font-semibold mb-6 text-indigo-700">
        {step === "signin"
          ? "Sign In to Giving Cure"
          : step === "email"
          ? "Sign Up"
          : step === "code"
          ? "Verify Your Email"
          : step === "password"
          ? "Create Your Password"
          : step === "forgot-password"
          ? "Reset Your Password"
          : step === "reset-code"
          ? "Verify Reset Code"
          : step === "reset-password"
          ? "Create New Password"
          : "Sign Up"}
      </h1>

      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Step 1: Email (Sign Up) */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@rush.edu"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {process.env.NODE_ENV === "production"
                  ? "Only @rush.edu emails are allowed"
                  : "Use @rush.edu email or your test email"}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Continue"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("signin");
                setEmail("");
                setError("");
                setSuccess("");
              }}
              className="w-full text-indigo-600 text-sm hover:underline"
            >
              Already have an account? Sign in
            </button>
          </form>
        )}

        {/* Step 2: Verification Code (Sign Up) */}
        {step === "code" && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                ref={codeInputRef}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full border rounded-lg px-3 py-2 text-center text-2xl tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Check your email for the verification code. Don't forget to check your spam or junk folder!
              </p>
              <p className="text-xs text-gray-400 mt-1">
                In development mode, check the backend console for the code.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0 || loading}
                className="flex-1 text-indigo-600 text-sm hover:underline disabled:text-gray-400 disabled:no-underline"
              >
                {resendTimer > 0 ? `Resend code (${resendTimer}s)` : "Resend code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                  setSuccess("");
                }}
                className="flex-1 text-gray-600 text-sm hover:underline"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Create Password (Sign Up) */}
        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Create Password
              </label>
              <PasswordInput
                inputRef={passwordInputRef}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, number, and special character
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("code");
                setPassword("");
                setConfirmPassword("");
                setError("");
                setSuccess("");
              }}
              className="w-full text-gray-600 text-sm hover:underline"
            >
              Back to code verification
            </button>
          </form>
        )}

        {/* Sign In */}
        {step === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@rush.edu"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("forgot-password");
                  setPassword("");
                  setError("");
                  setSuccess("");
                }}
                className="text-indigo-600 hover:underline"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setEmail("");
                  setPassword("");
                  setError("");
                  setSuccess("");
                }}
                className="text-indigo-600 hover:underline"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password - Email */}
        {step === "forgot-password" && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@rush.edu"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll send a verification code to reset your password.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("signin");
                setEmail("");
                setError("");
                setSuccess("");
              }}
              className="w-full text-gray-600 text-sm hover:underline"
            >
              Back to sign in
            </button>
          </form>
        )}

        {/* Reset Code Verification */}
        {step === "reset-code" && (
          <form onSubmit={handleResetCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                ref={codeInputRef}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full border rounded-lg px-3 py-2 text-center text-2xl tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Check your email for the verification code. Don't forget to check your spam or junk folder!
              </p>
              <p className="text-xs text-gray-400 mt-1">
                In development mode, check the backend console for the code.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0 || loading}
                className="flex-1 text-indigo-600 text-sm hover:underline disabled:text-gray-400 disabled:no-underline"
              >
                {resendTimer > 0 ? `Resend code (${resendTimer}s)` : "Resend code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("forgot-password");
                  setCode("");
                  setError("");
                  setSuccess("");
                }}
                className="flex-1 text-gray-600 text-sm hover:underline"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* Reset Password */}
        {step === "reset-password" && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <PasswordInput
                inputRef={passwordInputRef}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, number, and special character
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("reset-code");
                setPassword("");
                setConfirmPassword("");
                setError("");
                setSuccess("");
              }}
              className="w-full text-gray-600 text-sm hover:underline"
            >
              Back to code verification
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
