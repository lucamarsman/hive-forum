const communityInfoBox = document.getElementById("content-end");
const communityLogo = document.getElementById("community-logo");
const communityHeader = document.getElementById("community-name");
const rightHeader = document.getElementById("right-header");
const creationDate = document.getElementById("created-at");
const communityDescription = document.getElementById("description");
const newPostBtn = document.getElementById("new-post-btn");
const joinBtn = document.getElementById("join-btn");



const path = window.location.pathname;
const communityName = path.split('/')[2]; 

newPostBtn.addEventListener("click", () => {
    window.location.href = path + `/new-post`
})


fetch(`/communities/details/${communityName}`)
    .then(response => response.json())
    .then(data => {
        const unpackedJson = data[0];
        const communityName = unpackedJson.name;
        const communityDesc = unpackedJson.description;
        const createdAt = unpackedJson.created_at;
        const logoPath = unpackedJson.logo_path;


        communityHeader.innerHTML = "h/" + communityName;
        communityLogo.src = `/${logoPath}`;

        rightHeader.innerHTML = communityName;
        creationDate.innerHTML = createdAt;
        communityDescription.innerHTML = communityDesc;
    })

