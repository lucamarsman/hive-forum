let currentPage = 1; 
let isLoading = false; 
let moreCommunitiesAvailable = true; 
let searchMode = false; 
let lastSearchQuery = '';
const communityListContainer = document.getElementById("community-list");

function debounce(fn, delay) { 
    let timer;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn();
        }, delay);
    };
}


function loadCommunities(searchQuery = '') {
    isLoading = true; 

    const loadingIndicator = document.createElement("div"); 
    loadingIndicator.textContent = "Loading...";
    loadingIndicator.id = "loading-indicator";
    //communityListContainer.appendChild(loadingIndicator);

    let url = `/communities/fetch-communities?page=${currentPage}`; 
    if (searchMode && searchQuery) { 
        url = `/communities/api/search?query=${encodeURIComponent(searchQuery)}&page=${currentPage}`; 
    }

    fetch(url)
        .then(response => response.json())
        .then(communities => {
            isLoading = false;
            if (communities.length > 0) { // If there are communities available
                communities.forEach((community, index) => { 
                    // Iterate through communities and render them to the DOM here
                    const communityName = community.name;
                    const communityLogoPath = community.logo_path;
                    const communityDescription = community.description;


                    const communityItem = document.createElement("span");
                    communityItem.className = "community-item";

                    const communityNumber = document.createElement("p");
                    communityNumber.className = "community-number";
                    communityNumber.innerHTML = index + 1;

                    const communityLogo = document.createElement("img");
                    communityLogo.className = "community-list-logo";
                    communityLogo.src = communityLogoPath;

                    const communityDetailsContainer = document.createElement("div");
                    communityDetailsContainer.id = "community-details";

                    const communityTitle = document.createElement("a");
                    communityTitle.id = "community-title";
                    communityTitle.innerText = communityName;
                    communityTitle.href = `/communities/${communityName}`

                    const communityDesc = document.createElement("p");
                    communityDesc.id = "community-desc";
                    if (communityDescription.length > 50) {
                        communityDesc.innerHTML = communityDescription.substring(0, 50 - 3) + '...';
                    } else {
                        communityDesc.innerHTML = communityDescription;
                    }


                    // TODO: fetch and add member count to community details container

                    communityDetailsContainer.appendChild(communityTitle);
                    communityDetailsContainer.appendChild(communityDesc);

                    communityItem.appendChild(communityNumber);
                    communityItem.appendChild(communityLogo);
                    communityItem.appendChild(communityDetailsContainer);

                    communityListContainer.appendChild(communityItem);


                })
            }
        })
}

function performSearch() { // Function that loads post based on search input
    const searchQuery = document.getElementById('search-bar').value; // Get search query
    if (searchQuery !== lastSearchQuery) { // If the search query has changed
        currentPage = 1; // Reset current page
        morePostsAvailable = true; // Reset more posts available
        communityListContainer.innerHTML = ''; // Clear existing posts
    }
    lastSearchQuery = searchQuery; // Update last search query
    searchMode = true; // Set search mode to true
    loadCommunities(searchQuery); // Load posts based on search query
}

document.addEventListener('DOMContentLoaded', function() { // Wait for the DOM to load

  const searchForm = document.getElementById('searchForm'); // Get search form
  searchForm.addEventListener('submit', function(e) { // Event listener for search form
      e.preventDefault(); // Prevent default form submission
      performSearch(); // Perform search
  });

  
    document.addEventListener('scroll', debounce(() => {
    if (nearBottomOfPage()) {
        if (searchMode) {
            loadCommunities(lastSearchQuery);
        } else {
            loadCommunities();
        }
    }
    }, 100));

    loadCommunities();
});