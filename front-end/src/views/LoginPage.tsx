import LoginForm from "../features/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-white to-orange-100">
      <div className="flex items-center justify-center h-screen">
        <div className="w-full max-w-md md:m-0 m-4">
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-6">Login</h2>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
