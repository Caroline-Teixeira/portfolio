// ========================================
// CONFIGURAÇÕES PRINCIPAIS
// ========================================

const GITHUB_API_URL = 'https://api.github.com/users/Caroline-Teixeira/repos';

// Lista de tecnologias com ícones Font Awesome
const TECHNOLOGIES = [
    { name: 'HTML', class: 'tech-html', icon: 'fab fa-html5', color: '#e34c26' },
    { name: 'CSS', class: 'tech-css', icon: 'fab fa-css3-alt', color: '#2965f1' },
    { name: 'JavaScript', class: 'tech-javascript', icon: 'fab fa-js-square', color: '#f0db4f' },
    { name: 'Java', class: 'tech-java', icon: 'fab fa-java', color: '#b07219' },
    { name: 'Python', class: 'tech-python', icon: 'fab fa-python', color: '#306998' },
    { name: 'Git', class: 'tech-git', icon: 'fab fa-git-alt', color: '#f05033' },
    { name: 'VSCode', class: 'tech-vscode', icon: 'fas fa-code', color: '#007acc' }
];

// ========================================
// FUNÇÕES PARA API DO GITHUB
// ========================================

// Função para buscar repositórios do GitHub
async function fetchRepositories() {
    try {
        console.log('Buscando repositórios do GitHub...');
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const repos = await response.json();
        console.log(`${repos.length} repositórios encontrados`);
        
        // Filtra repositórios que não são forks e ordena por data de atualização
        const filteredRepos = repos
            .filter(repo => !repo.fork)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        console.log(`${filteredRepos.length} repositórios após filtros`);
        return filteredRepos;
    } catch (error) {
        console.error('Erro ao buscar repositórios:', error.message);
        return [];
    }
}

// Função para obter linguagens dos repositórios
async function getLanguagesFromRepos(repos) {
    const languageSet = new Set();
    
    for (const repo of repos.slice(0, 10)) {
        try {
            if (repo.language) {
                languageSet.add(repo.language);
            }
            const langResponse = await fetch(repo.languages_url);
            if (langResponse.ok) {
                const langData = await langResponse.json();
                Object.keys(langData).forEach(lang => languageSet.add(lang));
            }
        } catch (error) {
            console.warn(`Erro ao buscar linguagens para ${repo.name}:`, error.message);
        }
    }
    
    const availableLanguages = TECHNOLOGIES.map(tech => tech.name);
    const filteredLanguages = Array.from(languageSet).filter(lang => 
        availableLanguages.includes(lang)
    );
    
    console.log('Linguagens encontradas:', filteredLanguages);
    return filteredLanguages;
}

// ========================================
// FUNÇÕES DE RENDERIZAÇÃO
// ========================================

// Função para renderizar tecnologias
function renderTechnologies(techContainer, languages = []) {
    if (!techContainer) {
        console.error('Container tech-container não encontrado!');
        return;
    }

    let techsToShow = TECHNOLOGIES;
    if (languages.length > 0) {
        techsToShow = TECHNOLOGIES.filter(tech => 
            languages.includes(tech.name) || ['Git', 'VSCode'].includes(tech.name)
        );
    }

    console.log('Tecnologias a serem exibidas:', techsToShow.map(t => t.name));

    const iconsHTML = techsToShow.map(tech => `
        <div class="tech-icon ${tech.class}" title="${tech.name}" data-tech="${tech.name}">
            <i class="${tech.icon}"></i>
        </div>
    `).join('');

    techContainer.innerHTML = `
        <div class="tech-icons">
            ${iconsHTML}
        </div>
    `;

    console.log(`✅ ${techsToShow.length} tecnologias renderizadas com sucesso!`);
    
    addHoverEffects(techContainer);
}

// Função para renderizar projetos
function renderProjects(repos) {
    const projectList = document.getElementById('project-list');
    if (!projectList) {
        console.error('Elemento #project-list não encontrado!');
        return;
    }

    projectList.innerHTML = '';

    if (repos.length === 0) {
        projectList.innerHTML = `
            <div class="no-projects">
                <p>Nenhum projeto encontrado ou erro ao carregar repositórios.</p>
            </div>
        `;
        return;
    }

    repos.forEach((repo, index) => {
        const card = document.createElement('a');
        card.href = repo.html_url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'cards';
        
        const formateName = repo.name
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
        
        const description = repo.description 
            ? (repo.description.length > 100 
                ? repo.description.substring(0, 100) + '...' 
                : repo.description)
            : 'Sem descrição disponível';
        
        const updatedDate = new Date(repo.updated_at).toLocaleDateString('pt-BR');
        
        card.innerHTML = `
            <div class="cards card${(index % 6) + 1}">
                <div class="card-header">
                    <span class="project-name">${formateName}</span>
                    ${repo.language ? `<span class="language-tag">${repo.language}</span>` : ''}
                </div>
                <div class="card-body">
                    <p class="project-description">${description}</p>
                    <div class="project-stats">
                        <span class="stars">⭐ ${repo.stargazers_count}</span>
                        <span class="forks">🍴 ${repo.forks_count}</span>
                        <span class="updated">📅 ${updatedDate}</span>
                    </div>
                </div>
            </div>
        `;
        
        projectList.appendChild(card);
    });

    console.log(`✅ ${repos.length} projetos renderizados com sucesso!`);
}

// Função para adicionar efeitos de hover nas tecnologias
function addHoverEffects(container) {
    const techIcons = container.querySelectorAll('.tech-icon');
    
    techIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            const techName = this.getAttribute('data-tech');
            console.log(`Hover em: ${techName}`);
        });
    });
}

// Função para mostrar loading
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Carregando ${containerId === 'project-list' ? 'projetos' : 'tecnologias'}...</p>
            </div>
        `;
    }
}

// Função para mostrar erro
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error-container">
                <p>❌ Erro ao carregar ${containerId === 'project-list' ? 'projetos' : 'tecnologias'}: ${message}</p>
                <button onclick="initializePortfolio()" class="retry-button">Tentar novamente</button>
            </div>
        `;
    }
}

// Função para renderizar tecnologias padrão
function renderDefaultTechnologies(techContainer) {
    console.log('Renderizando tecnologias padrão...');
    renderTechnologies(techContainer, []);
}

// ========================================
// FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO
// ========================================

async function initializePortfolio() {
    console.log('🚀 Inicializando portfólio...');
    
    const techContainer = document.getElementById('tech-container');
    const projectList = document.getElementById('project-list');

    // Inicializa tecnologias
    if (techContainer) {
        showLoading('tech-container');
        try {
            const repos = await fetchRepositories();
            if (repos.length > 0) {
                const languages = await getLanguagesFromRepos(repos);
                renderTechnologies(techContainer, languages);
            } else {
                renderDefaultTechnologies(techContainer);
            }
        } catch (error) {
            console.error('Erro ao inicializar tecnologias:', error);
            showError('tech-container', error.message);
        }
    } else {
        console.log('Container tech-container não encontrado, pulando inicialização de tecnologias...');
    }

    // Inicializa projetos
    if (projectList) {
        showLoading('project-list');
        try {
            const repos = await fetchRepositories();
            if (repos.length > 0) {
                renderProjects(repos);
            } else {
                showError('project-list', 'Nenhum repositório encontrado');
            }
        } catch (error) {
            console.error('Erro ao inicializar projetos:', error);
            showError('project-list', error.message);
        }
    } else {
        console.log('Container project-list não encontrado, pulando inicialização de projetos...');
    }
}

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

// Função para verificar se Font Awesome carregou
function checkFontAwesome() {
    const testElement = document.createElement('i');
    testElement.className = 'fab fa-html5';
    document.body.appendChild(testElement);
    
    const computed = window.getComputedStyle(testElement);
    const fontFamily = computed.getPropertyValue('font-family');
    
    document.body.removeChild(testElement);
    
    const isLoaded = fontFamily.includes('Font Awesome');
    console.log('Font Awesome carregado:', isLoaded);
    return isLoaded;
}

// Função para debug
function debugPortfolio() {
    console.log('=== DEBUG PORTFÓLIO ===');
    console.log('URL da API:', GITHUB_API_URL);
    console.log('Tecnologias disponíveis:', TECHNOLOGIES.length);
    console.log('Font Awesome:', checkFontAwesome() ? '✅' : '❌');
    console.log('Container tech-container existe:', !!document.getElementById('tech-container'));
    console.log('Container project-list existe:', !!document.getElementById('project-list'));
    console.log('=====================');
}

// Função para aguardar Font Awesome carregar
function waitForFontAwesome(callback, maxAttempts = 10) {
    let attempts = 0;
    
    const checkInterval = setInterval(() => {
        attempts++;
        
        if (checkFontAwesome() || attempts >= maxAttempts) {
            clearInterval(checkInterval);
            callback();
        }
    }, 100);
}

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado!');
    debugPortfolio();
    
    waitForFontAwesome(() => {
        initializePortfolio();
    });
});

// ========================================
// EXPORTS PARA DEBUG
// ========================================

if (typeof window !== 'undefined') {
    window.portfolioDebug = {
        initializePortfolio: initializePortfolio,
        fetchRepositories: fetchRepositories,
        renderTechnologies: renderDefaultTechnologies,
        renderProjects: renderProjects,
        debugPortfolio: debugPortfolio,
        checkFontAwesome: checkFontAwesome,
        technologies: TECHNOLOGIES
    };
    
    console.log('🔧 Funções de debug disponíveis em window.portfolioDebug');
}