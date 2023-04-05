// write a react component called Login that renders a login form

const Login = () => {
  return (
    <div>
      <h1>Login</h1>
      <form>
        <input type="email" placeholder="email" />
        <input type="password" placeholder="password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};


const login = (username: string, password: string) => {

}
export default Login;
