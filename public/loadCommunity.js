const communityInfoBox = document.getElementById("content-end");
const communityLogo = document.getElementById("community-logo");
const communityHeader = document.getElementById("community-name");
const rightHeader = document.getElementById("right-header");
const creationDate = document.getElementById("created-at");
const communityDescription = document.getElementById("description");


const path = window.location.pathname;
const communityName = path.split('/')[2]; 
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