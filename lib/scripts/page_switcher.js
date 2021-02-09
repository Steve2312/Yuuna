var PAGE_LIBRARY_INDEX = 0;
var PAGE_SEARCH_INDEX = 1;
var PAGE_DOWNLOADS_INDEX = 2;
var PAGE_ALL_PLAYLISTS_INDEX = 3;
var PAGE_PLAYLIST_INDEX = 4;
var LOADED_PAGE;
var LOADED_PAGE_INDEX;

function load_page(index){

    let panel = document.getElementsByClassName("right-panel")[0];

    // Set playlist page = name_playlist_null
    playlist_page.reset();

    // Pop the page if one is loaded
    if (LOADED_PAGE && index !== LOADED_PAGE_INDEX){
        page_remove = document.getElementById(LOADED_PAGE).remove();
    }

    // Library
    if (index == PAGE_LIBRARY_INDEX && index !== LOADED_PAGE_INDEX){
        panel.innerHTML += `<div id="library_page" class="library_page"><div class="playlist_banner"><h1>Library</h1></div></div>`
        LOADED_PAGE = "library_page";
        LOADED_PAGE_INDEX = 0;
        playlist_page.Libraryload_Playlist("Library");
    }

    // All Playlists
    if (index == PAGE_ALL_PLAYLISTS_INDEX && index !== LOADED_PAGE_INDEX){
        panel.innerHTML += `<div id="all_playlist_page" class="all_playlist_page"><div class="all_playlist_banner"><h1>Playlists</h1></div></div>`
        LOADED_PAGE = "all_playlist_page";
        LOADED_PAGE_INDEX = 3;
    }

    // The download screen
    if (index == PAGE_DOWNLOADS_INDEX && index !== LOADED_PAGE_INDEX){
        panel.innerHTML += `
        <div id="download_page" class="download_page">
            <div class="download_banner">
                <h1>Downloads</h1>
            </div>
            <div class="list_downloading_wrapper">
                <div style="width: 100%; height: 10px;"></div>
                    <div id="list_downloading" class="list_downloading">
                </div>
                <div style="width: 100%; height: 110px;"></div>
            </div>
        </div>`
        LOADED_PAGE = "download_page";
        LOADED_PAGE_INDEX = 2;
        init_download_page();
    }

    // The search screen
    if (index == PAGE_SEARCH_INDEX && index !== LOADED_PAGE_INDEX){
        panel.innerHTML += `
        <div id="search_page" class="search_page">
            <div class="seach_banner">
                <h1>Search</h1>
            </div>
            <div class="search_bar">
                <input id="search_page_search" type="search" placeholder="Search for name, artist, beatmap creator, ID or Tags">
                <label for="searchon"></label>
                <select name="searchon" id="searchon" class="search_on" onchange="search_page.search_beatmap(true)">
                    <option value="ranked">Ranked</option>
                    <option value="all">All</option>
                    <option value="approved">Approved</option>
                    <option value="qualified">Qualified</option>
                    <option value="loved">Loved</option>
                    <option value="unranked">Unranked</option>

                </select>
            </div>
            <div class="list_search_results_wrapper" id="list_search_results_wrapper" onscroll="search_page.load_nextPage()">
                <div style="width: 100%; height: 10px;"></div>
                    <div id="list_search_results" class="list_search_results">
                </div>
            </div>
            <div class="loading_bar"></div>
        </div>`
        LOADED_PAGE = "search_page";
        LOADED_PAGE_INDEX = 1;
        search_page.addEventOnSearch();
        search_page.search_beatmap(true);
    }
}

function load_page_playlist(uuid) {
    let panel = document.getElementsByClassName("right-panel")[0];

    // Set playlist page = name_playlist_null
    playlist_page.reset();

    // Pop the page if one is loaded
    if (LOADED_PAGE){
        page_remove = document.getElementById(LOADED_PAGE).remove();
    }

    // Playlist
    panel.innerHTML += `
    <div id="playlist_page" class="playlist_page">
        <div class="playlist_banner_cover_wrapper">
            <div class="playlist_banner_cover" id="playlist_banner_cover"></div>
        </div>
        <div id="playlist_info" class="playlist_info">
            <div class="playlist_cover" id="playlist_cover">
            </div>
            <div class="playlist_cover_text">
                <p class="title">PLAYLIST</p>
                <h2><span id="playlist_name"></span></h2>
                <p class="title">Created: <span id="playlist_created"></span></p>
                <p class="playlist_description title"><span id="playlist_description"></span></p>
            </div>
    </div>`
    LOADED_PAGE = "playlist_page";
    LOADED_PAGE_INDEX = 4;
    playlist_page.Libraryload_Playlist(uuid)
}

// STANDARD LOAD PAGE
$( document ).ready(function() {
    load_page(0);
});