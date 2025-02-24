// Frontend/src/App.jsx
// import { Routes, Route } from "react-router-dom"
// import { useState, createContext } from "react"
// import Navbar from "./components/Navbar"
// import MobileNavigation from "./components/MobileNavigation"
// import Login from "./components/Login"
// import Signup from "./components/Signup"
// import Home from "./components/Home"
// import Services from "./components/Services"
// import Cart from "./components/Cart"
// import "./styles/App.css"

// export const AuthContext = createContext(null)

// function App() {
//   const [user, setUser] = useState(null)
//   const isMobile = window.innerWidth <= 768

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       <div className="app">
//         {!isMobile && <Navbar />}
//         <main className="main-content">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/services" element={<Services />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//           </Routes>
//         </main>
//         {isMobile && <MobileNavigation />}
//       </div>
//     </AuthContext.Provider>
//   )
// }

// export default App

// new latest version

// "use client"

// import { Routes, Route } from "react-router-dom"
// import { useState, createContext, useEffect } from "react"
// import Navbar from "./components/Navbar"
// import Login from "./components/Login"
// import Signup from "./components/Signup"
// import Home from "./components/Home"
// import Services from "./components/Services"
// import Cart from "./components/Cart"
// import "./styles/App.css"

// export const AuthContext = createContext(null)

// function App() {
//   const [user, setUser] = useState(null)

//   // Load user from localStorage on app start
//   useEffect(() => {
//     const savedUser = localStorage.getItem("user")
//     if (savedUser) {
//       try {
//         setUser(JSON.parse(savedUser))
//       } catch (e) {
//         localStorage.removeItem("user")
//       }
//     }
//   }, [])

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       <div className="app">
//         <Navbar />
//         <main className="main-content">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/services" element={<Services />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//           </Routes>
//         </main>
//       </div>
//     </AuthContext.Provider>
//   )
// }

// export default App

// "use client"

// import { Routes, Route } from "react-router-dom"
// import { useState, createContext, useEffect } from "react"
// import Navbar from "./components/Navbar"
// import Login from "./components/Login"
// import Signup from "./components/Signup"
// import Home from "./components/Home"
// import Services from "./components/Services"
// import Cart from "./components/Cart"
// import "./styles/App.css"

// export const AuthContext = createContext(null)

// function App() {
//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem("user")
//     return savedUser ? JSON.parse(savedUser) : null
//   })

//   useEffect(() => {
//     if (user) {
//       localStorage.setItem("user", JSON.stringify(user))
//     } else {
//       localStorage.removeItem("user")
//     }
//   }, [user])

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       <div className="app">
//         <Navbar />
//         <main className="main-content">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/services" element={<Services />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//           </Routes>
//         </main>
//       </div>
//     </AuthContext.Provider>
//   )
// }

// export default App


// final 2

// "use client"

// import { Routes, Route } from "react-router-dom"
// import { useState, createContext, useEffect } from "react"
// import Navbar from "./components/Navbar"
// import Login from "./components/Login"
// import Signup from "./components/Signup"
// import Home from "./components/Home"
// import Services from "./components/Services"
// import Cart from "./components/Cart"
// import "./styles/App.css"

// export const AuthContext = createContext(null)

// function App() {
//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem("user")
//     return savedUser ? JSON.parse(savedUser) : null
//   })

//   useEffect(() => {
//     if (user) {
//       localStorage.setItem("user", JSON.stringify(user))
//     } else {
//       localStorage.removeItem("user")
//     }
//   }, [user])

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       <div className="app">
//         <Navbar />
//         <main className="main-content">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/services" element={<Services />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//           </Routes>
//         </main>
//       </div>
//     </AuthContext.Provider>
//   )
// }

// export default App


// final 3

// import { Routes, Route } from "react-router-dom";
// import { useState, createContext, useEffect } from "react";
// import Navbar from "./components/Navbar";
// import Login from "./components/Login";
// import Signup from "./components/Signup";
// import Home from "./components/Home";
// import Services from "./components/Services";
// import Cart from "./components/Cart";
// import "./styles/App.css";

// export const AuthContext = createContext(null);

// function App() {
//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem("user");
//     return savedUser ? JSON.parse(savedUser) : null;
//   });

//   useEffect(() => {
//     if (user) {
//       localStorage.setItem("user", JSON.stringify(user));
//     } else {
//       localStorage.removeItem("user");
//     }
//   }, [user]);

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       <div className="app">
//         <Navbar />
//         <main className="main-content">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/services" element={<Services />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//           </Routes>
//         </main>
//       </div>
//     </AuthContext.Provider>
//   );
// }

// export default App;


// final 4

// import { Routes, Route } from "react-router-dom";
// import { useState, createContext, useEffect } from "react";
// import Navbar from "./components/Navbar";
// import Login from "./components/Login";
// import Signup from "./components/Signup";
// import Home from "./components/Home";
// import Services from "./components/Services";
// import Cart from "./components/Cart";
// import "./styles/App.css";

// export const AuthContext = createContext(null);

// function App() {
//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem("user");
//     return savedUser ? JSON.parse(savedUser) : null;
//   });

//   useEffect(() => {
//     if (user) {
//       localStorage.setItem("user", JSON.stringify(user));
//     } else {
//       localStorage.removeItem("user");
//     }
//   }, [user]);

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       <div className="app">
//         <Navbar />
//         <main className="main-content">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/services" element={<Services />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//           </Routes>
//         </main>
//       </div>
//     </AuthContext.Provider>
//   );
// }

// export default App;

// final 5

// import { Routes, Route } from "react-router-dom";
// import { useState, createContext, useEffect } from "react";
// import Navbar from "./components/Navbar";
// import Login from "./components/Login";
// import Signup from "./components/Signup";
// import Home from "./components/Home";
// import Services from "./components/Services";
// import Cart from "./components/Cart";
// import "./styles/App.css";

// export const AuthContext = createContext(null);

// function App() {
//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem("user");
//     return savedUser ? JSON.parse(savedUser) : null;
//   });

//   useEffect(() => {
//     if (user) {
//       localStorage.setItem("user", JSON.stringify(user));
//     } else {
//       localStorage.removeItem("user");
//     }
//   }, [user]);

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       <div className="app">
//         <Navbar />
//         <main className="main-content">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/services" element={<Services />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//           </Routes>
//         </main>
//       </div>
//     </AuthContext.Provider>
//   );
// }

// export default App;



// final 6

// import { Routes, Route } from "react-router-dom";
// import { useState, createContext, useEffect } from "react";
// import Navbar from "./components/Navbar";
// import Login from "./components/Login";
// import Signup from "./components/Signup";
// import Home from "./components/Home";
// import Services from "./components/Services";
// import Cart from "./components/Cart";
// import "./styles/App.css";

// export const AuthContext = createContext(null);

// function App() {
//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem("user");
//     return savedUser ? JSON.parse(savedUser) : null;
//   });

//   useEffect(() => {
//     if (user) {
//       localStorage.setItem("user", JSON.stringify(user));
//     } else {
//       localStorage.removeItem("user");
//     }
//   }, [user]);

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       <div className="app">
//         <Navbar />
//         <main className="main-content">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/services" element={<Services />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//           </Routes>
//         </main>
//       </div>
//     </AuthContext.Provider>
//   );
// }

// export default App;


// final 7

import { Routes, Route } from "react-router-dom";
import { useState, createContext, useEffect } from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Services from "./components/Services";
import Cart from "./components/Cart";
import "./styles/App.css";

export const AuthContext = createContext(null);

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

export default App;