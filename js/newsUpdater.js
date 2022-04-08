const newsCardClass = "news-card";
const newsContainerSel = ".news";
const cardTitleClass = "news-card__title";
const cardContentClass = "news-card__content";
const likesCountClass = "likes_counter__count";
const sourceClass = "footer__source-link";
const loadBtnClass = "load-news";
const loadPrevBtnClass = "load-previous-news";
const suspenseSel = ".suspense";
const hiddenClass = "hidden";
const baseUrl =
  "https://ukrainiansunbeamsite20220323224611.azurewebsites.net/news";
const arrowSvgText =
  '<svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.55 5.99924H5.55051L8.8753 2.56005C9.00992 2.42079 9.11671 2.25547 9.18957 2.07353C9.26243 1.89158 9.29993 1.69658 9.29993 1.49964C9.29993 1.3027 9.26243 1.1077 9.18957 0.925753C9.11671 0.743808 9.00992 0.578489 8.8753 0.439234C8.74068 0.299979 8.58086 0.189517 8.40497 0.114153C8.22907 0.0387893 8.04055 -2.93457e-09 7.85017 0C7.65978 2.93457e-09 7.47126 0.0387893 7.29537 0.114153C7.11948 0.189517 6.95966 0.29998 6.82504 0.439235L0 7.49911L6.82504 14.559C6.95938 14.6988 7.11911 14.8097 7.29504 14.8854C7.47097 14.961 7.65963 15 7.85017 15C8.04071 15 8.22937 14.961 8.4053 14.8854C8.58123 14.8097 8.74096 14.6988 8.8753 14.559C9.01007 14.4198 9.11699 14.2545 9.18994 14.0726C9.26289 13.8906 9.30044 13.6956 9.30044 13.4986C9.30044 13.3016 9.26289 13.1065 9.18994 12.9246C9.11699 12.7426 9.01007 12.5773 8.8753 12.4382L5.55051 8.99898H16.55C16.9346 8.99898 17.3034 8.84095 17.5753 8.55968C17.8472 8.2784 18 7.8969 18 7.49911C18 7.10132 17.8472 6.71982 17.5753 6.43854C17.3034 6.15726 16.9346 5.99924 16.55 5.99924Z" fill="#25469F"/></svg>';

const getNextIdParams = (nextId) => (nextId ? `&id=${nextId}` : "");
const urlPaths = {
  getUserIp: () => "https://api.ipify.org/",
  nextId: ({ nextId, userIp }) =>
    `${baseUrl}/nextId?userIp=${userIp}${getNextIdParams(nextId)}`,
  getNewsById: (id) => `${baseUrl}?id=${id}`,
  getPreviousNews: ({ id, userIp }) =>
    `${baseUrl}/previousId?userIp=${userIp}&id=${id}`
};

const displayNews = async (fetcher, id) => {
  const news = await fetcher(id);

  updateNews(news, !id);
  updateLikeBtns();
  document.querySelectorAll(suspenseSel).forEach((el) => {
    el.classList.add(hiddenClass);
  });
  document.body.scrollTop = document.documentElement.scrollTop = 0;
};

document.addEventListener("DOMContentLoaded", async ({ target }) => {
  displayNews(loadNews);
});

document.addEventListener("click", async ({ target }) => {
  const currId = target
    .closest(`.${newsCardClass}`)
    .getAttribute(newsIdAttributeName);
  if (target.classList.contains(loadBtnClass)) {
    displayNews(loadNews, currId);
  }
  if (target.closest(`.${loadPrevBtnClass}`) ||
    target.classList.contains(loadPrevBtnClass)) {
    displayNews(loadPreviousNews, currId);
  }
});

const titleField = "title";
const contentField = "body";
const likesCountField = "likes";
const sourceField = "source";
const idField = "id";

const fieldNamesToClassesMapping = {
  [cardTitleClass]: titleField,
  [cardContentClass]: contentField,
  [likesCountClass]: likesCountField
};

const responseMock = {
  id: "6228fa63d39680862ba9c4d9",
  title:
    "Кохання і війна: на Тернопільщині поліціянт освідчився своїй дівчині на блокпості",
  body:
    'На Тернопільщині поліціянт роти особливого призначення освідчився своїй дівчині на блокпості.\n\nВона сказала "так", повідомляє Національна поліція.\n\nВікторія прямувала до Тернополя з Львівщини і не здогадувалася, що на одному з блокпостів біля міста на неї чекає сюрприз.\u00A0\n\nПравоохоронці зупинили автомобіль, яким їхала дівчина, і почали перевіряти його.\n\nТоді поліціянт став на коліно та попросив свою обраницю вийти за нього.\u00A0\n\n"Вже після такого бажаного "так" обоє щасливих людей отримали статус наречених.\u00A0\n\nСила справжніх почуттів потужніша за будь-яку зброю, віримо, що любов переможе війну!", – кажуть у Нацполіції.\n\nНагадаємо, раніше у забарикадованій міськраді на Рівненщині одружилася пара нацгвардійців.\n\nЗагалом за період війни в Україні побралися майже 4 тисячі пар.\n\nДеталі https://life.pravda.com.ua/society/2022/03/9/247736/',
  source: null,
  likes: 0
};
async function loadNews(id) {
  const params = await getFetchParams(id);
  const newsId = await fetch(
    urlPaths.nextId(params)).then((response) => response.text());
  const data = await fetch(urlPaths.getNewsById(newsId))
    .then((response) => response.json())
    .catch((error) => {
      throw error;
    });
  return [data];
}

async function loadPreviousNews(id) {
  const params = await getFetchParams(id);
  const prevNewsId = await fetch(urlPaths.getPreviousNews(params))
    .then((response) => response.text())
    .catch((error) => {
      throw error;
    });
  const data = await fetch(urlPaths.getNewsById(prevNewsId))
    .then((response) => response.json())
    .catch((error) => {
      throw error;
  });
  return [data];
}

async function getFetchParams(id) {
  const userIp = await fetch(urlPaths.getUserIp()).then((response) =>
    response.text()
  );
  return {
    id,
    userIp
  };
}

const elementsWithClasses = getDOMElementsToClassesMapping();

function updateNews(data, isInitial) {
  const container = document.querySelector(newsContainerSel);
  if (container) {
    container.innerHTML = "";
    data.forEach((item) => {
      const updatedCard = createNewsCard(item, elementsWithClasses, isInitial);
      container.appendChild(updatedCard);
    });
  }
}

function createNewsCard(
  data,
  { [newsCardClass]: newCardElemOptions, ...elementsToCreate },
  isInitial
) {
  const card = createElem(newCardElemOptions.tag, {
    className: newsCardClass,
    dataNewsId: data.id
  });
  Object.keys(elementsToCreate).forEach((className) => {
    const { tag, renderCustom, ...options } = getElemOptions(
      className,
      elementsToCreate
    );
    let created;
    if (renderCustom) {
      created = renderCustom({ data, isInitial });
      card.insertAdjacentHTML("beforeend", created);
    } else {
      created = createElem(tag, options);
      const fieldName = fieldNamesToClassesMapping[className];

      if (fieldName && data[fieldName]) {
        created.innerText = data[fieldName];
      }

      card.appendChild(created);
    }
  });
  card.setAttribute(newsIdAttributeName, data[idField]);
  return card;
}

function getElemOptions(className, elemToCreate) {
  return { className, ...elemToCreate[className] };
}

function createElem(tagName, options) {
  return Object.assign(document.createElement(tagName), options);
}

function getDOMElementsToClassesMapping() {
  return {
    [newsCardClass]: {
      tag: "div"
    },
    [cardTitleClass]: {
      tag: "h2"
    },
    [cardContentClass]: {
      renderCustom: ({ data, isInitial }) => {
        if (!data) return data;
        const {
          [sourceField]: sourceHref,
          [likesCountField]: likes,
          [contentField]: body
        } = data;
        const sourceLinkElem = sourceHref
          ? `<a class="${sourceClass} bold" href="${sourceHref}">Читати джерело</a>`
          : "";
        return `
          <div class="news-card__content">
              <div class="news-card__date bold"></div>
              <div class="news-card__text">${body}</div>
              <div class="news-card__footer">
              ${sourceLinkElem}
              <div class="like-icon__container">
                <div class="like-icon">
                  <svg width='28' height='24' viewBox='0 0 28 24' xmlns='http://www.w3.org/2000/svg'><path d='M0.116699 8.31663C0.116699 10.1583 0.400032 12.9916 2.95003 15.5416C5.2167 17.8083 12.725 22.9083 13.0084 23.1916C13.2917 23.3333 13.575 23.475 13.8584 23.475C14.1417 23.475 14.425 23.3333 14.7084 23.1916C14.9917 22.9083 22.5 17.95 24.7667 15.5416C27.3167 12.9916 27.6 10.1583 27.6 8.31663C27.6 4.06663 24.2 0.666626 19.95 0.666626C17.6834 0.666626 15.4167 1.94163 14 3.92496C12.5834 1.94163 10.3167 0.666626 7.7667 0.666626C3.65837 0.666626 0.116699 4.06663 0.116699 8.31663Z'/></svg>
                </div>
                <div class="${likesCountClass} bold">${likes}</div>
              </div>
            </div>
            <div class="flex-container">
              <button ${
                isInitial ? "disabled" : ""
              } class="big bold outlined load-previous-news">
              <span class="desktop-label">
                ПОПЕРЕДНЯ
              </span> 
              <span class="mobile-label">
                ${arrowSvgText}
              </span>   
              </button>
              <button class="big bold load-news">НАСТУПНА НОВИНА</button>
            </div>
          </div>
          `;
      }
    }
  };
}
