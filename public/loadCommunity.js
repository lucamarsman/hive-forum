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
const createPostBtn = document.getElementById("new-post-btn");

const path = window.location.pathname;
const communitySlug = path.split("/")[2] || "";
const communityName = decodeURIComponent(communitySlug);

searchBar.setAttribute("placeholder", "Search " + communityName);

newPostBtn.addEventListener("click", () => {
  window.location.href = `/communities/${encodeURIComponent(communityName)}/new-post`;
});

document.addEventListener("DOMContentLoaded", () => {
  loadCommunity();
  checkMembership(communityName);
});

function loadCommunity() {
  fetch(`/communities/details/${encodeURIComponent(communityName)}`)
    .then((response) => response.json())
    .then((data) => {
      const unpackedJson = data[0];
      const nameFromDb = unpackedJson.name;
      const communityDesc = (unpackedJson.description || "").replace(
        /\n/g,
        "<br>",
      );
      const createdAt = unpackedJson.created_at;
      const logoPath = unpackedJson.logo_path;

      communityHeader.innerHTML = "h/" + nameFromDb;
      communityLogo.src = `/${logoPath}`;

      rightHeader.innerHTML = nameFromDb;
      creationDate.innerHTML = createdAt;
      communityDescription.innerHTML = communityDesc;
    });

  fetch(`/communities/stats/${encodeURIComponent(communityName)}`)
    .then((response) => response.json())
    .then((data) => {
      memberCount.innerHTML = data;
    });
}

function checkMembership(communityName) {
  const joinBtn = document.getElementById("join-btn");

  fetch(`/communities/${encodeURIComponent(communityName)}/membership`)
    .then((response) => {
      if (response.ok) {
        joinBtn.innerHTML = "Leave";
        document.getElementById("new-post-btn").style.display = "visible";
        updateJoinButton("leave", communityName, joinBtn);
      } else if (response.status === 403) {
        joinBtn.innerHTML = "Join";
        document.getElementById("new-post-btn").style.display = "none";
        updateJoinButton("join", communityName, joinBtn);
      } else {
        console.error("Unexpected response:", response.status);
      }
    })
    .catch((error) => {
      console.error("Error checking membership:", error);
    });
}

function updateJoinButton(action, communityName, button) {
  const newButton = button.cloneNode(true);
  button.parentNode.replaceChild(newButton, button);

  newButton.addEventListener("click", () => {
    const url =
      action === "join"
        ? `/communities/join?community=${encodeURIComponent(communityName)}`
        : `/communities/leave?community=${encodeURIComponent(communityName)}`;

    fetch(url, { method: "POST" })
      .then((response) => {
        if (response.ok) {
          newButton.innerHTML = action === "join" ? "Leave" : "Join";
          updateJoinButton(
            action === "join" ? "leave" : "join",
            communityName,
            newButton,
          );

          if (action === "leave") {
            createPostBtn.style.display = "none";
            memberCount.innerHTML--;
          } else {
            createPostBtn.style.display = "flex";
            memberCount.innerHTML++;
          }
        } else if (response.status === 401) {
          window.location.href = "/login";
        } else {
          console.error(`Failed to ${action}.`);
        }
      })
      .catch((error) => {
        console.error(`Error performing ${action} action:`, error);
      });
  });
}
