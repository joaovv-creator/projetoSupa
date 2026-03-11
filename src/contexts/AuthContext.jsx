
// import { createContext, useState, useEffect, useContext } from 'react';
// import { supabase } from '../lib/supabase';

// const AuthContext = createContext({});

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 1. Movemos a função para CIMA do useEffect
//   const fetchUserRole = async (userId) => {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('role')
//       .eq('id', userId)
//       .single();

//     if (data && !error) {
//       setRole(data.role);
//     }
//   };

//   // 2. Agora o useEffect vem DEPOIS, podendo usar a função sem erros
//   useEffect(() => {
//     const fetchSession = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
      
//       if (session?.user) {
//         setUser(session.user);
//         await fetchUserRole(session.user.id);
//       }
//       setLoading(false);
//     };

//     fetchSession();

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
//       if (session?.user) {
//         setUser(session.user);
//         await fetchUserRole(session.user.id);
//       } else {
//         setUser(null);
//         setRole(null);
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, []); // Adicionamos [] para rodar apenas uma vez na montagem

//   return (
//     <AuthContext.Provider value={{ user, role, loading }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. A função agora está AQUI DENTRO, o que tira a linha vermelha do fetchUserRole
    const fetchUserRole = async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setRole(data.role);
      }
    };

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserRole(session.user.id);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 2. Este comentário especial abaixo remove a linha vermelha do useAuth!
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);