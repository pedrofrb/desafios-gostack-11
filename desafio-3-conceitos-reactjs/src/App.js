import React, { useEffect, useState } from "react";

import "./styles.css";

import api from './services/api';

function App() {
  const [repositories, setRepositories] = useState([]);

  useEffect(()=>{
    api.get('repositories').then(({ data: repositoryArray })=>{
      setRepositories(repositoryArray);
    })
  }, []);

  async function handleAddRepository() {
    
    const { data:repository } = await api.post('repositories',{
      url: "https://github.com/pedrofrb/desafio-2-conceitos-nodejs",
      title: `Desafio Conceitos NodeJS ${Date.now()}`,
      techs: ["Node", "Express",]
    })

    setRepositories([...repositories,repository]);
  }

  async function handleRemoveRepository(id) {
    await api.delete(`repositories/${id}`);

    setRepositories(repositories.filter(repository => repository.id!==id));
  }

  return (
    <div>
      <ul data-testid="repository-list">
        {repositories.map(repository => (
          <li key={repository.id}>
            {repository.title}
            <button onClick={() => handleRemoveRepository(repository.id)}>
              Remover
            </button>
          </li>
        ))}
      </ul>

      <button onClick={handleAddRepository}>Adicionar</button>
    </div>
  );
}

export default App;
