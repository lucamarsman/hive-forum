const communityInfoBox = document.getElementById("content-end");
const communityLogo = document.getElementById("community-logo");
const communityHeader = document.getElementById("community-name");
const rightHeader = document.getElementById("right-header");
const creationDate = document.getElementById("created-at");
const communityDescription = document.getElementById("description");
const newPostBtn = document.getElementById("new-post-btn");
const joinBtn = document.getElementById("join-btn");
const searchBar = document.getElementById("search-bar");
const memberCount = document.getElementById("member-count");
const communityRanking = document.getElementById("size-rank");
const createPostBtn = document.getElementById("new-post-btn")



const path = window.location.pathname;
const communityName = path.split('/')[2]; 

searchBar.setAttribute("placeholder", "Search " + communityName);

newPostBtn.addEventListener("click", () => {
    window.location.href = path + `/new-post`
})

document.addEventListener("DOMContentLoaded", () => {
    loadCommunity();
    checkMembership(communityName);
})

function loadCommunity(){
    fetch(`/communities/details/${communityName}`)
    .then(response => response.json())
    .then(data => {
        const unpackedJson = data[0];
        const communityName = unpackedJson.name;
        const communityDesc = unpackedJson.description.replace(/\n/g, "<br>");
        console.log("community dec: " + unpackedJson.description)
        const createdAt = unpackedJson.created_at;
        const logoPath = unpackedJson.logo_path;

        communityHeader.innerHTML = "h/" + communityName;
        communityLogo.src = `/${logoPath}`;

        rightHeader.innerHTML = communityName;
        creationDate.innerHTML = createdAt;
        communityDescription.innerHTML = communityDesc;
    });

    fetch(`/communities/stats/${communityName}`)
    .then(response => response.json())
    .then(data => {
            memberCount.innerHTML = data;
    })
}

function checkMembership(communityName) {
    const joinBtn = document.getElementById("join-btn"); // Button element

    fetch(`/communities/${communityName}/membership`)
        .then(response => {
            console.log(response)
            if (response.ok) {
                // User is a member
                console.log("User is a member of the community.");
                joinBtn.innerHTML = "Leave";
                document.getElementById('new-post-btn').style.display = "visible";
                updateJoinButton("leave", communityName, joinBtn);
            } else if (response.status === 403) {
                // User is not a member
                console.log("User is not a member of the community.");
                joinBtn.innerHTML = "Join";
                document.getElementById('new-post-btn').style.display = "none";
                updateJoinButton("join", communityName, joinBtn);
            } else {
                // Unexpected response
                console.error("Unexpected response:", response.status);
            }
        })
        .catch(error => {
            console.error("Error checking membership:", error);
        });
}

function updateJoinButton(action, communityName, button) {
    // Remove all existing event listeners by replacing the button with a clone
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    // Add the appropriate event listener
    newButton.addEventListener("click", () => {
        const url = action === "join" ? `/communities/join?community=${communityName}` : `/communities/leave?community=${communityName}`;
        const method = "POST";

        fetch(url, { method })
            .then(response => {
                if (response.ok) {
                    console.log(`Successfully ${action === "join" ? "joined" : "left"} the community.`);
                    newButton.innerHTML = action === "join" ? "Leave" : "Join";
                    updateJoinButton(action === "join" ? "leave" : "join", communityName, newButton);
                    if(action == "leave"){
                        createPostBtn.style.display = "none";
                        memberCount.innerHTML--;
                    }else{
                        createPostBtn.style.display = "flex";
                        memberCount.innerHTML++;
                    }
                    
                } else if(response.status == 401){
                    console.log("unauthorized");
                    window.location.href = "/login"; 
                } else {
                    console.error(`Failed to ${action === "join" ? "join" : "leave"} the community.`);
                }
            })
            .catch(error => {
                console.error(`Error performing ${action} action:`, error);
            });
    });
}



