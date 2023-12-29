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
                  extraLarge
                }
                bannerImage
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
        document.getElementById('footer').style.display = 'none';
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
          image.src = anime.media.coverImage.extraLarge;
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
        document.querySelector('.username-text').textContent = '';
        document.getElementById('loading-screen').style.display = '';
        document.getElementById('footer').style.display = '';
        document.getElementById('loading-screen').innerHTML = `<h1>Error</h1><p>Cound\'t fetch data, please check username</p><p>${error}</p>`;

      });
  });
});

const axios = require('axios');

function showPopup(anime) {
  const popup = document.createElement('div');
  popup.classList.add('popup');

  const title = document.createElement('h1');
  title.textContent = anime.media.title.english || anime.media.title.native;
  popup.appendChild(title);

  const content = document.createElement('div');
  content.classList.add('popup-content');
  popup.appendChild(content);

  const data = document.createElement('div');
  data.classList.add('popup-data');
  content.appendChild(data);

  const imgDiv = document.createElement('div');
  content.appendChild(imgDiv);

  const img = document.createElement('img');
  img.src = anime.media.coverImage.extraLarge;
  img.classList.add('popup-img');
  imgDiv.appendChild(img);

  const startDate = document.createElement('p');
  if (anime.startedAt.year && anime.startedAt.month && anime.startedAt.day) {
    startDate.textContent = `Started watching: ${anime.startedAt.year}-${anime.startedAt.month}-${anime.startedAt.day}`;
  } else {
    startDate.textContent = 'Started watching: No data';
  }
  data.appendChild(startDate);

  const endDate = document.createElement('p');
  if (anime.completedAt.year && anime.completedAt.month && anime.completedAt.day) {
    endDate.textContent = `Finished watching: ${anime.completedAt.year}-${anime.completedAt.month}-${anime.completedAt.day}`;
  } else {
    endDate.textContent = 'Finished watching: No data';
  }
  data.appendChild(endDate);

  const userScore = document.createElement('p');
  if (anime.score > 0) {
    userScore.textContent = `User's score: ${anime.score}`;
  } else {
    userScore.textContent = "User's score: No data";
  }
  data.appendChild(userScore);

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