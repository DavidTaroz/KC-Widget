// Configuration pour l'API Liquipedia
const LIQUIPEDIA_API_URL = 'https://liquipedia.net/api.php';
const TEAM_NAME = 'Karmine Corp';

// Fonction pour formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('fr-FR', options);
}

// Fonction pour mettre à jour l'horodatage
function updateTimestamp(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        element.textContent = `Mise à jour : ${timeString}`;
    }
}

// Données de fallback (données de test qui s'affichent)
const fallbackLiveMatch = {
    game: "League of Legends",
    opponent: "G2 Esports",
    scoreKC: "1",
    scoreOpponent: "1",
    status: "En cours - Game 3",
    time: "32:15"
};

const fallbackUpcomingMatches = [
    {
        game: "Valorant",
        opponent: "Fnatic",
        date: "2025-09-14",
        time: "20:00"
    },
    {
        game: "Rocket League",
        opponent: "BDS",
        date: "2025-09-15",
        time: "19:00"
    },
    {
        game: "League of Legends",
        opponent: "Team Vitality",
        date: "2025-09-16",
        time: "18:00"
    }
];

const fallbackRecentResults = [
    {
        game: "League of Legends",
        opponent: "MAD Lions",
        score: "2-1",
        result: "win",
        date: "2025-09-13"
    },
    {
        game: "Valorant",
        opponent: "Navi",
        score: "13-11",
        result: "win",
        date: "2025-09-12"
    },
    {
        game: "Rocket League",
        opponent: "Dignitas",
        score: "3-4",
        result: "loss",
        date: "2025-09-11"
    }
];

// Gestion du menu de contrôle des widgets
function initWidgetMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const menuContent = document.getElementById('menu-content');
    const widgetMenu = document.getElementById('widget-menu');
    const toggleLive = document.getElementById('toggle-live');
    const toggleUpcoming = document.getElementById('toggle-upcoming');
    const toggleResults = document.getElementById('toggle-results');
    const refreshButton = document.getElementById('force-refresh');
    const liveWidget = document.getElementById('live-matches-widget');
    const upcomingWidget = document.getElementById('upcoming-matches-widget');
    const resultsWidget = document.getElementById('recent-results-widget');

    if (!menuToggle || !menuContent || !widgetMenu) {
        console.error('Éléments du menu manquants');
        return;
    }

    // Ouvre/ferme le menu
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = menuToggle.classList.toggle('active');
        menuContent.classList.toggle('show', isOpen);
    });

    // Ferme le menu si clic extérieur
    document.addEventListener('click', function(event) {
        if (!widgetMenu.contains(event.target) && menuContent.classList.contains('show')) {
            menuToggle.classList.remove('active');
            menuContent.classList.remove('show');
        }
    });

    // Gestion du bouton refresh
    if (refreshButton) {
        refreshButton.addEventListener('click', function(e) {
            e.stopPropagation();
            forceRefreshWidgets();
        });
    }

    // Toggle widgets
    if (toggleLive && liveWidget) {
        toggleLive.addEventListener('change', function() {
            liveWidget.classList.toggle('hidden', !this.checked);
            saveWidgetPreferences();
        });
    }

    if (toggleUpcoming && upcomingWidget) {
        toggleUpcoming.addEventListener('change', function() {
            upcomingWidget.classList.toggle('hidden', !this.checked);
            saveWidgetPreferences();
        });
    }

    if (toggleResults && resultsWidget) {
        toggleResults.addEventListener('change', function() {
            resultsWidget.classList.toggle('hidden', !this.checked);
            saveWidgetPreferences();
        });
    }

    // Charger les préférences
    loadWidgetPreferences();
}

// Forcer le refresh avec animation
function forceRefreshWidgets() {
    const refreshButton = document.getElementById('force-refresh');
    
    console.log('🔄 Actualisation forcée des widgets...');
    
    // Animation du bouton
    if (refreshButton) {
        refreshButton.classList.add('loading');
        refreshButton.querySelector('.refresh-text').textContent = 'Actualisation...';
    }
    
    // Afficher les loaders
    showLoader('live-matches-content');
    showLoader('upcoming-matches-content');  
    showLoader('recent-results-content');
    
    // Simuler un délai de chargement puis actualiser
    setTimeout(() => {
        updateDashboard();
        
        // Restaurer le bouton
        if (refreshButton) {
            refreshButton.classList.remove('loading');
            refreshButton.querySelector('.refresh-text').textContent = 'Actualiser';
        }
        
        // Notification de succès
        showRefreshSuccess();
        
    }, 1500);
}

// Notification de succès discret
function showRefreshSuccess() {
    const notification = document.createElement('div');
    notification.className = 'refresh-notification';
    notification.innerHTML = '✅ Widgets actualisés';
    
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
        z-index: 2000;
        opacity: 0;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(10px)';
    });
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

// Sauvegarder les préférences
function saveWidgetPreferences() {
    const preferences = {
        liveVisible: document.getElementById('toggle-live')?.checked || true,
        upcomingVisible: document.getElementById('toggle-upcoming')?.checked || true,
        resultsVisible: document.getElementById('toggle-results')?.checked || true
    };
    localStorage.setItem('kc-dashboard-preferences', JSON.stringify(preferences));
}

// Charger les préférences
function loadWidgetPreferences() {
    const saved = localStorage.getItem('kc-dashboard-preferences');
    if (saved) {
        try {
            const preferences = JSON.parse(saved);
            
            const toggleLive = document.getElementById('toggle-live');
            const toggleUpcoming = document.getElementById('toggle-upcoming');
            const toggleResults = document.getElementById('toggle-results');
            const liveWidget = document.getElementById('live-matches-widget');
            const upcomingWidget = document.getElementById('upcoming-matches-widget');
            const resultsWidget = document.getElementById('recent-results-widget');

            if (toggleLive) toggleLive.checked = preferences.liveVisible !== false;
            if (toggleUpcoming) toggleUpcoming.checked = preferences.upcomingVisible !== false;
            if (toggleResults) toggleResults.checked = preferences.resultsVisible !== false;

            if (liveWidget && !preferences.liveVisible) liveWidget.classList.add('hidden');
            if (upcomingWidget && !preferences.upcomingVisible) upcomingWidget.classList.add('hidden');
            if (resultsWidget && !preferences.resultsVisible) resultsWidget.classList.add('hidden');
        } catch (e) {
            console.error('Erreur lors du chargement des préférences:', e);
        }
    }
}

// Fonction pour afficher le match en cours
function displayLiveMatch(match) {
    const container = document.getElementById('live-matches-content');
    if (!container) {
        console.error('Container live-matches-content introuvable');
        return;
    }

    container.innerHTML = '';
    
    if (!match) {
        container.innerHTML = '<div class="no-match">Aucun match en cours</div>';
        updateTimestamp('live-update');
        return;
    }
    
    const matchElement = document.createElement('div');
    matchElement.className = 'match-item live-match';
    matchElement.innerHTML = `
        <div class="live-indicator">LIVE</div>
        <div class="game-title">${match.game}</div>
        <div class="live-score">
            <span class="team">KC</span>
            <span class="score">${match.scoreKC}</span>
            <span class="score-separator">-</span>
            <span class="score">${match.scoreOpponent}</span>
            <span class="team">${match.opponent}</span>
        </div>
        <div class="match-info" style="justify-content: center; color: #888;">
            ${match.status} • ${match.time}
        </div>
    `;
    
    container.appendChild(matchElement);
    updateTimestamp('live-update');
    console.log('Match live affiché:', match);
}

// Fonction pour afficher les matchs à venir
function displayUpcomingMatches(matches) {
    const container = document.getElementById('upcoming-matches-content');
    if (!container) {
        console.error('Container upcoming-matches-content introuvable');
        return;
    }

    container.innerHTML = '';
    
    if (!matches || matches.length === 0) {
        container.innerHTML = '<div class="error-message">Aucun match à venir</div>';
        updateTimestamp('upcoming-update');
        return;
    }
    
    matches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.className = 'match-item';
        matchElement.innerHTML = `
            <div class="game-title">${match.game}</div>
            <div class="match-info">
                <span class="opponent">vs ${match.opponent}</span>
                <span class="match-time">${match.time}</span>
            </div>
            <div class="match-date">${formatDate(match.date)}</div>
        `;
        container.appendChild(matchElement);
    });
    
    updateTimestamp('upcoming-update');
    console.log('Matchs à venir affichés:', matches.length, 'matchs');
}

// Fonction pour afficher les résultats récents
function displayRecentResults(results) {
    const container = document.getElementById('recent-results-content');
    if (!container) {
        console.error('Container recent-results-content introuvable');
        return;
    }

    container.innerHTML = '';
    
    if (!results || results.length === 0) {
        container.innerHTML = '<div class="error-message">Aucun résultat récent</div>';
        updateTimestamp('results-update');
        return;
    }
    
    results.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.className = 'match-item';
        matchElement.innerHTML = `
            <div class="game-title">${match.game}</div>
            <div class="result ${match.result}">
                <span class="opponent">vs ${match.opponent}</span>
                <span class="score">${match.score}</span>
            </div>
            <div class="match-date">${formatDate(match.date)}</div>
        `;
        container.appendChild(matchElement);
    });
    
    updateTimestamp('results-update');
    console.log('Résultats récents affichés:', results.length, 'matchs');
}

// Fonction principale de mise à jour des données
async function updateDashboard() {
    console.log('🔄 Mise à jour du dashboard...');
    
    try {
        // Pour le moment, on utilise les données de fallback
        console.log('📊 Affichage des données de test...');
        displayLiveMatch(fallbackLiveMatch);
        displayUpcomingMatches(fallbackUpcomingMatches);
        displayRecentResults(fallbackRecentResults);
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        displayLiveMatch(fallbackLiveMatch);
        displayUpcomingMatches(fallbackUpcomingMatches);
        displayRecentResults(fallbackRecentResults);
    }
}

// Fonction pour démarrer les mises à jour automatiques
function startAutoUpdate() {
    console.log('🚀 Démarrage des mises à jour automatiques...');
    updateDashboard();
    setInterval(updateDashboard, 30000);
}

// Fonction pour afficher un loader
function showLoader(elementId) {
    const container = document.getElementById(elementId);
    if (container) {
        container.innerHTML = '<div class="loader"></div>';
    }
}

// Fonction pour gérer les erreurs réseau
function handleNetworkError(elementId, errorMessage) {
    const container = document.getElementById(elementId);
    if (container) {
        container.innerHTML = `<div class="error-message">${errorMessage}</div>`;
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Dashboard Karmine Corp - Initialisation...');
    
    // Initialiser le menu de contrôle
    initWidgetMenu();
    
    // Vérifier la connectivité
    if (!navigator.onLine) {
        console.warn('⚠️ Pas de connexion internet');
        handleNetworkError('live-matches-content', 'Pas de connexion internet');
        handleNetworkError('upcoming-matches-content', 'Pas de connexion internet');
        handleNetworkError('recent-results-content', 'Pas de connexion internet');
        return;
    }
    
    // Démarrer les mises à jour automatiques
    startAutoUpdate();
    
    console.log('✅ Dashboard initialisé avec succès');
});

// Gestion des changements de connectivité
window.addEventListener('online', function() {
    console.log('🌐 Connexion rétablie');
    updateDashboard();
});

window.addEventListener('offline', function() {
    console.log('📴 Connexion perdue');
    handleNetworkError('live-matches-content', 'Connexion perdue');
    handleNetworkError('upcoming-matches-content', 'Connexion perdue');
    handleNetworkError('recent-results-content', 'Connexion perdue');
});

// Fonctions de debug
function forceUpdate() {
    console.log('🔧 Mise à jour forcée...');
    showLoader('live-matches-content');
    showLoader('upcoming-matches-content');
    showLoader('recent-results-content');
    setTimeout(updateDashboard, 1000);
}

// Objet Dashboard pour le debug
const Dashboard = {
    setTestData: function(liveMatch, upcomingMatches, recentResults) {
        console.log('🧪 Définition de données de test personnalisées');
        if (liveMatch) displayLiveMatch(liveMatch);
        if (upcomingMatches) displayUpcomingMatches(upcomingMatches);
        if (recentResults) displayRecentResults(recentResults);
    },
    
    simulateLiveMatch: function() {
        const testMatch = {
            game: "Valorant",
            opponent: "Team Liquid",
            scoreKC: "7",
            scoreOpponent: "5",
            status: "Première carte",
            time: "15:30"
        };
        console.log('🎮 Simulation d\'un match live');
        displayLiveMatch(testMatch);
    },
    
    clearAll: function() {
        console.log('🧹 Nettoyage de tous les widgets');
        displayLiveMatch(null);
        displayUpcomingMatches([]);
        displayRecentResults([]);
    },
    
    reset: function() {
        console.log('🔄 Réinitialisation du dashboard');
        updateDashboard();
    },
    
    toggleAllWidgets: function(show = true) {
        console.log('👁️ Toggle tous les widgets:', show);
        const toggles = ['toggle-live', 'toggle-upcoming', 'toggle-results'];
        toggles.forEach(id => {
            const toggle = document.getElementById(id);
            if (toggle) {
                toggle.checked = show;
                toggle.dispatchEvent(new Event('change'));
            }
        });
    },
    
    resetPreferences: function() {
        console.log('🗑️ Réinitialisation des préférences');
        localStorage.removeItem('kc-dashboard-preferences');
        this.toggleAllWidgets(true);
    }
};

// Exposer les fonctions pour le debug
window.forceUpdate = forceUpdate;
window.Dashboard = Dashboard;

console.log('📜 Script chargé - Fonctions de debug disponibles:');
console.log('- forceUpdate() : Forcer une mise à jour');
console.log('- Dashboard.simulateLiveMatch() : Simuler un match');
console.log('- Dashboard.reset() : Réinitialiser');
console.log('- Dashboard.toggleAllWidgets(true/false) : Afficher/masquer tous');
