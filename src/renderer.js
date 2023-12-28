window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('username-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = event.target.username.value;

    const animeItems = document.querySelectorAll('.anime-item');
    animeItems.forEach(item => item.remove());

    axios.post('https://graphql.anilist.co', {
      query: `
      query ($username: String) {
        MediaListCollection(userName: $username, type: ANIME, sort: STARTED_ON_DESC ) {
          lists {
            entries {
              media {
                title {
                  english
                  native
                }
                coverImage {
                  large
                }
                episodes
              }
              progress
              startedAt {
                year
                month
                day
              }
              completedAt {
                year
                month
                day
              }
              score
            }
          }
        }
      }
    `,
      variables: {
        username,
      },
    })
      .then(response => {
        document.getElementById('loading-screen').style.display = 'none';
        document.querySelector('.username-text').textContent = username;
        const animeList = response.data.data.MediaListCollection.lists.flatMap(list => list.entries);
        const container = document.getElementById('anime-list');
        animeList.forEach(anime => {
          const listItem = document.createElement('li');
          listItem.classList.add('anime-item');

          const text = document.createElement('p');
          text.textContent = anime.media.title.english || anime.media.title.native;
          text.classList.add('anime-title');

          const progress = document.createElement('p'); 
          progress.textContent = `${anime.progress} / ${anime.media.episodes}`;
          progress.classList.add('anime-progress'); 

          const image = document.createElement('img');
          image.src = anime.media.coverImage.large;
          image.classList.add('anime-image'); 

          listItem.appendChild(text);
          listItem.appendChild(progress);
          listItem.appendChild(image);
          container.appendChild(listItem);

          listItem.addEventListener('click', function () {
            showPopup(anime);
          });
        });
      })
      .catch(error => {
        console.error(error);
      });
  });
});

const axios = require('axios');

function showPopup(anime) {
  const popup = document.createElement('div');
  popup.classList.add('popup');

  const startDate = document.createElement('p');
  if (anime.startedAt.year && anime.startedAt.month && anime.startedAt.day) {
    startDate.textContent = `Started watching: ${anime.startedAt.year}-${anime.startedAt.month}-${anime.startedAt.day}`;
  } else {
    startDate.textContent = 'Started watching: No data';
  }

  const endDate = document.createElement('p');
  if (anime.completedAt.year && anime.completedAt.month && anime.completedAt.day) {
    endDate.textContent = `Finished watching: ${anime.completedAt.year}-${anime.completedAt.month}-${anime.completedAt.day}`;
  } else {
    endDate.textContent = 'Finished watching: No data';
  }

  const userScore = document.createElement('p');
  if (anime.score > 0) {
    userScore.textContent = `User's score: ${anime.score}`;
  } else {
    userScore.textContent = "User's score: No data";
  }

  popup.appendChild(startDate);
  popup.appendChild(endDate);
  popup.appendChild(userScore);

  document.body.appendChild(popup);

  let overlay = document.createElement('div');
  overlay.id = 'overlay';

  document.body.appendChild(overlay);

  document.addEventListener('click', function closePopup(event) {
    if (event.target === popup || event.target === overlay) {
      setTimeout(() => {
        popup.remove();
        overlay.remove();
        document.removeEventListener('click', closePopup);
      }, 0);
    }
  });
}