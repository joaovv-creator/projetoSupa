import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
// NOVA IMPORTAÇÃO DO SWEETALERT2
import Swal from 'sweetalert2';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Estado da Barra de Pesquisa
  const [termoBusca, setTermoBusca] = useState('');

  // Estados do Modal e Formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [produtoEditandoId, setProdutoEditandoId] = useState(null);
  
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    categoria: '',
    preco: '',
    estoque: ''
  });

  useEffect(() => {
    buscarProdutos();
  }, []);

  const buscarProdutos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error.message);
      setErro("Não foi possível carregar a lista de produtos.");
      toast.error("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModalNovo = () => {
    setProdutoEditandoId(null);
    setNovoProduto({ nome: '', categoria: '', preco: '', estoque: '' });
    setIsModalOpen(true);
  };

  const handleAbrirModalEditar = (produto) => {
    setProdutoEditandoId(produto.id);
    setNovoProduto({
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco,
      estoque: produto.estoque
    });
    setIsModalOpen(true);
  };

  const handleSalvarProduto = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const dadosParaSalvar = {
        nome: novoProduto.nome,
        categoria: novoProduto.categoria,
        preco: parseFloat(novoProduto.preco),
        estoque: parseInt(novoProduto.estoque, 10)
      };

      if (produtoEditandoId) {
        // Editando produto existente
        const { error } = await supabase
          .from('produtos')
          .update(dadosParaSalvar)
          .eq('id', produtoEditandoId);

        if (error) throw error;
        toast.success('Produto atualizado com sucesso!'); 
      } else {
        // Criando novo produto
        const { error } = await supabase
          .from('produtos')
          .insert([dadosParaSalvar]);

        if (error) throw error;
        toast.success('Novo produto cadastrado!'); 
      }

      setIsModalOpen(false);
      buscarProdutos();

    } catch (error) {
      console.error("Erro ao salvar produto:", error.message);
      toast.error("Ocorreu um erro ao salvar o produto."); 
    } finally {
      setSalvando(false);
    }
  };

  // === EXCLUIR COM SWEETALERT2 ===
  const handleExcluirProduto = (id) => {
    Swal.fire({
      title: 'Tem certeza?',
      text: "Você não poderá desfazer essa ação!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Vermelho para dar atenção
      cancelButtonColor: '#3085d6', // Azul para cancelar
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      // Só entra aqui se o usuário clicou no botão "Sim, excluir!"
      if (result.isConfirmed) {
        try {
          const { error } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id);

          if (error) throw error;
          
          toast.success('Produto excluído com sucesso!');
          buscarProdutos();

        } catch (error) {
          console.error("Erro ao excluir produto:", error.message);
          toast.error("Erro ao tentar excluir o produto.");
        }
      }
    });
  };

  // Filtragem da Barra de Pesquisa
  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="flex bg-gray-50 min-h-screen w-full relative">
      <Sidebar />
      <Toaster position="top-right" reverseOrder={false} />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Produtos</h1>
          <button 
            onClick={handleAbrirModalNovo}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-200"
          >
            + Novo Produto
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {erro}
          </div>
        )}

        {/* Barra de Pesquisa */}
        <div className="mb-6 flex">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Pesquisar produto pelo nome..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {/* Tabela de Produtos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Carregando produtos...
                  </td>
                </tr>
              ) : produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {termoBusca ? "Nenhum produto encontrado com esse nome." : "Nenhum produto cadastrado no momento."}
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{produto.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.categoria}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                      {Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${produto.estoque > 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {produto.estoque} un
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleAbrirModalEditar(produto)} className="text-blue-600 hover:text-blue-900 mr-4 transition">Editar</button>
                      <button onClick={() => handleExcluirProduto(produto.id)} className="text-red-600 hover:text-red-900 transition">Excluir</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Reutilizável de Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {produtoEditandoId ? 'Editar Produto' : 'Cadastrar Produto'}
            </h2>
            
            <form onSubmit={handleSalvarProduto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={novoProduto.nome} onChange={(e) => setNovoProduto({...novoProduto, nome: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={novoProduto.categoria} onChange={(e) => setNovoProduto({...novoProduto, categoria: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input type="number" step="0.01" min="0" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={novoProduto.preco} onChange={(e) => setNovoProduto({...novoProduto, preco: e.target.value})} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                  <input type="number" min="0" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={novoProduto.estoque} onChange={(e) => setNovoProduto({...novoProduto, estoque: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancelar</button>
                <button type="submit" disabled={salvando} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition">
                  {salvando ? 'Salvando...' : (produtoEditandoId ? 'Atualizar Produto' : 'Salvar Produto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}