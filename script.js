const pokemonGrid = document.getElementById('pokemonGrid');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const pokeModal = document.getElementById('pokeModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');

let allPokemon = [];
let currentTypeFilter = 'all';

const typeColors = {
    fire: 'bg-orange-600 text-white',
    water: 'bg-blue-600 text-white',
    grass: 'bg-green-600 text-white',
    electric: 'bg-yellow-500 text-slate-950 font-bold',
    poison: 'bg-purple-600 text-white',
    bug: 'bg-lime-600 text-white',
    normal: 'bg-zinc-500 text-white',
    psychic: 'bg-pink-600 text-white',
    ground: 'bg-amber-700 text-white',
    rock: 'bg-stone-600 text-white',
    ghost: 'bg-indigo-900 text-white',
    ice: 'bg-cyan-400 text-slate-950 font-bold',
    dragon: 'bg-violet-700 text-white',
    fighting: 'bg-red-700 text-white',
    fairy: 'bg-pink-400 text-slate-950 font-bold'
};

// 1. Buscar os Pokémon de Kanto na API
async function fetchKantoPokemon() {
    try {
        pokemonGrid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-10">A carregar os Pokémon...</p>';
        
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();
        
        const pokemonPromises = data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            return await res.json();
        });

        allPokemon = await Promise.all(pokemonPromises);
        displayPokemon(allPokemon);
    } catch (error) {
        console.error('Erro ao buscar Pokémon:', error);
        pokemonGrid.innerHTML = '<p class="col-span-full text-center text-red-400">Erro ao carregar dados.</p>';
    }
}

// 2. Renderizar os cards na tela e adicionar eventos de clique
function displayPokemon(pokemonList) {
    pokemonGrid.innerHTML = '';
    
    if (pokemonList.length === 0) {
        pokemonGrid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-10">Nenhum Pokémon encontrado.</p>';
        return;
    }

    pokemonList.forEach(poke => {
        const card = document.createElement('div');
        card.className = "bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col items-center shadow-xl hover:border-yellow-400 hover:-translate-y-1 transition-all cursor-pointer group";
        
        const typesHtml = poke.types.map(t => `<span class="px-3 py-1 rounded-full text-xs uppercase ${typeColors[t.type.name] || 'bg-slate-600 text-white'}">${t.type.name}</span>`).join('');

        card.innerHTML = `
            <span class="text-xs font-mono text-slate-400 self-start bg-slate-900/60 px-2 py-1 rounded">#${String(poke.id).padStart(3, '0')}</span>
            <div class="w-32 h-32 my-2 bg-slate-900/40 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <img src="${poke.sprites.front_default}" alt="${poke.name}" class="w-28 h-28 object-contain drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
            </div>
            <h2 class="text-lg font-bold capitalize text-white mb-2">${poke.name}</h2>
            <div class="flex gap-2 mt-auto">${typesHtml}</div>
        `;

        // Evento de clique para abrir o modal com os dados deste Pokémon
        card.addEventListener('click', () => openPokemonModal(poke));

        pokemonGrid.appendChild(card);
    });
}

// 3. Abrir e preencher o Modal de Detalhes
function openPokemonModal(poke) {
    const modalBody = document.getElementById('modalBody');
    
    // Gerar HTML dinâmico para as estatísticas base
    const statsHtml = poke.stats.map(s => `
        <div class="mb-2">
            <div class="flex justify-between text-xs font-semibold uppercase text-slate-300 mb-1">
                <span>${s.stat.name.replace('special-', 'sp. ')}</span>
                <span>${s.base_stat}</span>
            </div>
            <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div class="bg-yellow-400 h-full rounded-full" style="width: ${Math.min(s.base_stat, 100)}%;"></div>
            </div>
        </div>
    `).join('');

    // Gerar HTML dinâmico para as habilidades
    const abilitiesHtml = poke.abilities.map(a => `
        <span class="bg-slate-900 px-3 py-1 rounded-lg text-xs capitalize text-slate-300 border border-slate-700">
            ${a.ability.name.replace('-', ' ')}
        </span>
    `).join('');

    // Imagem oficial de alta resolução (fallback para front_default se não existir)
    const artwork = poke.sprites.other?.['official-artwork']?.front_default || poke.sprites.front_default;
    const typesHtml = poke.types.map(t => `<span class="px-3 py-1 rounded-full text-xs uppercase ${typeColors[t.type.name] || 'bg-slate-600 text-white'}">${t.type.name}</span>`).join('');

    modalBody.innerHTML = `
        <div class="flex flex-col items-center">
            <span class="text-sm font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full mb-2">#${String(poke.id).padStart(3, '0')}</span>
            <div class="w-40 h-40 bg-slate-900/60 rounded-full flex items-center justify-center my-2 shadow-inner">
                <img src="${artwork}" alt="${poke.name}" class="w-36 h-36 object-contain drop-shadow-xl">
            </div>
            <h2 class="text-2xl font-bold capitalize text-white mt-1 mb-2 tracking-wide">${poke.name}</h2>
            <div class="flex gap-2 mb-4">${typesHtml}</div>

            <!-- Dados Físicos -->
            <div class="grid grid-cols-2 gap-4 w-full bg-slate-900/50 p-3 rounded-xl mb-4 text-center border border-slate-700/50">
                <div>
                    <span class="text-xs text-slate-400 block">Peso</span>
                    <span class="font-bold text-white">${poke.weight / 10} kg</span>
                </div>
                <div>
                    <span class="text-xs text-slate-400 block">Altura</span>
                    <span class="font-bold text-white">${poke.height / 10} m</span>
                </div>
            </div>

            <!-- Habilidades -->
            <div class="w-full mb-4">
                <h3 class="text-xs font-bold text-slate-400 uppercase mb-2">Habilidades</h3>
                <div class="flex flex-wrap gap-2">${abilitiesHtml}</div>
            </div>

            <!-- Estatísticas -->
            <div class="w-full">
                <h3 class="text-xs font-bold text-slate-400 uppercase mb-2">Estatísticas Base</h3>
                ${statsHtml}
            </div>
        </div>
    `;

    // Mostrar modal com animação
    pokeModal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

// 4. Fechar o Modal
function closePokemonModal() {
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        pokeModal.classList.add('hidden');
    }, 200);
}

closeModal.addEventListener('click', closePokemonModal);
pokeModal.addEventListener('click', (e) => {
    if (e.target === pokeModal) closePokemonModal();
});

// 5. Filtro de pesquisa e tipos
function filterPokemon() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = allPokemon.filter(poke => {
        const matchesName = poke.name.includes(searchTerm);
        const matchesType = currentTypeFilter === 'all' || poke.types.some(t => t.type.name === currentTypeFilter);
        return matchesName && matchesType;
    });
    displayPokemon(filtered);
}

searchInput.addEventListener('input', filterPokemon);

filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        filterButtons.forEach(btn => btn.classList.remove('ring-4', 'ring-white'));
        e.target.classList.add('ring-4', 'ring-white');
        currentTypeFilter = e.target.getAttribute('data-type');
        filterPokemon();
    });
});

// Iniciar aplicação
fetchKantoPokemon();