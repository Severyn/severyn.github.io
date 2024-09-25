const API_KEY = 'c424447c';

const searchForm = document.querySelector('#search-form');
const titleInput = document.querySelector('#title-input');
const typeSelect = document.querySelector('#type-select');
const resultsTableBody = document.querySelector('#results-table #results-table-body');

searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const title = titleInput.value.trim();
    const type = typeSelect.value;

    if (title === '') {
        alert('Proszę wpisać fragment tytułu.');
        return;
    }
    fetchMovies(title, type);
});

function fetchMovies(title, type) {
    let url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(title)}`;
    if (type) {
        url += `&type=${type}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === "True") {
                const ids = data.Search.map(movie => movie.imdbID);
                Promise.allSettled(ids.map(id => fetchMovieDetails(id)))
                    .then(results => {
                        const successfulResults = results.filter(result => result.status === 'fulfilled');
                        const moviesData = successfulResults.map(result => result.value);
                        clearTable();
                        if (moviesData.length > 0) {
                            populateTable(moviesData);
                        } else {
                            displayEmptyState();
                        }
                        if (failedResults.length > 0) {
                            alert(`Nie wszystkie filmy zostały pobrane. Nieudane zapytania: ${failedResults.length}`);
                        }
                    });
            } else {
                console.error('Błąd:', error);
                clearTable();
                displayEmptyState();
            }
        })
        .catch(error => {
            console.error('Błąd:', error);
            displayErrorState();
        });
}

function fetchMovieDetails(imdbID) {
    return fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`)
        .then(response => response.json());
}

class MovieRow extends HTMLTableRowElement {
    constructor(movie) {
        super();
        this.innerHTML = `
            <td>${movie.Title}</td>
            <td>${movie.Year}</td>
            <td>${movie.Country || 'N/A'}</td>
            <td>${capitalizeFirstLetter(movie.Type)}</td>
        `;
    }
}
customElements.define('movie-row', MovieRow, { extends: 'tr' });

function populateTable(movies) {
    clearTable();
    movies.forEach(movie => {
        const row = document.createElement('tr', { is: 'movie-row' });
        row.movie = movie;
        resultsTableBody.appendChild(row);
    });
}

function displayEmptyState() {
    resultsTableBody.innerHTML = `<tr><td colspan="4">Brak wyników dla wybranych filtrów.</td></tr>`;
}

function displayErrorState() {
    resultsTableBody.innerHTML = `<tr><td colspan="4">Wystąpił błąd podczas ładowania danych. Spróbuj ponownie później.</td></tr>`;
}

function clearTable() {
    resultsTableBody.innerHTML = '';
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
