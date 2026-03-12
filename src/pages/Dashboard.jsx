import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth(); // Pegando os dados do usuário logado
  
  // Estados para guardarmos os nossos cálculos
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalEstoque, setTotalEstoque] = useState(0);
  const [valorTotalEstoque, setValorTotalEstoque] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarMetricas();
  }, []);

  const carregarMetricas = async () => {
    try {
      setLoading(true);
      
      // Buscamos todos os produtos para fazer as contas
      const { data, error } = await supabase
        .from('produtos')
        .select('*');

      if (error) throw error;

      // 1. Total de produtos diferentes (linhas na tabela)
      setTotalProdutos(data.length);

      // 2. Soma de todos os itens no estoque (usando o método reduce do JavaScript)
      const somaEstoque = data.reduce((acumulador, produto) => acumulador + (produto.estoque || 0), 0);
      setTotalEstoque(somaEstoque);

      // 3. Valor financeiro total do estoque (preço * quantidade em estoque)
      const somaValor = data.reduce((acumulador, produto) => acumulador + ((produto.preco || 0) * (produto.estoque || 0)), 0);
      setValorTotalEstoque(somaValor);

    } catch (error) {
      console.error("Erro ao carregar métricas:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen w-full relative">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Painel de Controle</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo(a) de volta, <span className="font-semibold text-blue-600">{user?.email}</span>!
          </p>
        </div>

        {loading ? (
          <div className="text-gray-500 text-lg">Calculando métricas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Total de Produtos */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                Tipos de Produtos
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {totalProdutos}
              </p>
            </div>

            {/* Card 2: Total de Itens em Estoque */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                Total de Itens Físicos
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {totalEstoque} un
              </p>
            </div>

            {/* Card 3: Valor Total do Estoque */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                Patrimônio em Estoque
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {valorTotalEstoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}