const API_KEY = 'c424447c';

const searchForm = document.querySelector('#search-form');
const titleInput = document.querySelector('#title-input');
const typeSelect = document.querySelector('#type-select');
const resultsTableBody = document.querySelector('#results-table #results-table-body');

searchForm.addEventListener('submit', function(e) {
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
                populateTable(data.Search);
            } else {
                alert(data.Error);
                clearTable();
            }
        })
        .catch(error => {
            console.error('Błąd podczas pobierania danych:', error);
            alert('Wystąpił błąd podczas pobierania danych.');
        });
}

function populateTable(movies) {
    clearTable();

    movies.forEach(movie => {
        fetchMovieDetails(movie.imdbID);
    });
}

function fetchMovieDetails(imdbID) {
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === "True") {
                addRowToTable(data);
            }
        })
        .catch(error => {
            console.error('Błąd podczas pobierania szczegółów produkcji:', error);
        });
}

function addRowToTable(movie) {
    const row = document.createElement('tr');
    const titleCell = document.createElement('td');
    titleCell.textContent = movie.Title;
    row.appendChild(titleCell);
    const yearCell = document.createElement('td');
    yearCell.textContent = movie.Year;
    row.appendChild(yearCell);
    const countryCell = document.createElement('td');
    countryCell.textContent = movie.Country || 'N/A';
    row.appendChild(countryCell);
    const typeCell = document.createElement('td');
    typeCell.textContent = capitalizeFirstLetter(movie.Type);
    row.appendChild(typeCell);
    resultsTableBody.appendChild(row);
}

function clearTable() {
    resultsTableBody.innerHTML = '';
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
