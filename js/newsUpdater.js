const newsCardClass = "news-card";
const newsContainerSel = ".news";
const cardTitleClass = "news-card__title";
const cardContentClass = "news-card__content";
const likesCountClass = "likes_counter__count";
const sourceClass = "footer__source-link";
const loadBtnClass = "load-news";
const suspenseSel = ".suspense";
const hiddenClass = 'hidden';
const baseUrl =
  "https://ukrainiansunbeamsite20220323224611.azurewebsites.net/news";
const getNextIdParams = (nextId) => nextId ? `?id=${nextId}` : ''
  const urlPaths = {
  nextId: (nextId) => `${baseUrl}/nextId${getNextIdParams(nextId)}`,
  getNewsById: (id) => `${baseUrl}?id=${id}`
};

const displayNews = async (nextId) => {
  const news = await loadNews(nextId);

  updateNews(news);
  updateLikeBtns();
  document.querySelectorAll(suspenseSel).forEach(el => {
    el.classList.add(hiddenClass);
  });
  document.body.scrollTop = document.documentElement.scrollTop = 0;
};

document.addEventListener("DOMContentLoaded", async ({ target }) => {
  displayNews();
});

document.addEventListener("click", async ({ target }) => {
  if (target.classList.contains(loadBtnClass)) {
    const nextId = target.closest(`.${newsCardClass}`)
    .getAttribute(newsIdAttributeName);
    displayNews(nextId);
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
async function loadNews(nextId) {
  const id = await fetch(urlPaths.nextId(nextId)).then((response) => response.text());
  const data = await fetch(urlPaths.getNewsById(id))
    .then((response) => response.json())
    .catch((error) => {
      throw error;
    });
  return [data];
}

const elementsWithClasses = getDOMElementsToClassesMapping();

function updateNews(data) {
  const container = document.querySelector(newsContainerSel);
  container.innerHTML = "";
  data.forEach((item) => {
    const updatedCard = createNewsCard(item, elementsWithClasses);
    container.appendChild(updatedCard);
  });
}

function createNewsCard(
  data,
  { [newsCardClass]: newCardElemOptions, ...elementsToCreate }
) {
  const card = createElem(newCardElemOptions.tag, { className: newsCardClass, dataNewsId: 'TEST' });
  Object.keys(elementsToCreate).forEach((className) => {
    const { tag, renderCustom, ...options } = getElemOptions(
      className,
      elementsToCreate
    );
    let created;
    if (renderCustom) {
      created = renderCustom(data);
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
      renderCustom: (data) => {
        const {
          [sourceField]: sourceHref,
          [likesCountField]: likes,
          [contentField]: body
        } = data;
        const sourceLinkElem = sourceHref
          ? `<a class="${sourceClass} bold" href="${sourceHref}">Читати джерело</a>`
          : '';
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
            <button class="big bold load-news">НАСТУПНА НОВИНА</button>
          </div>
          `;
      }
    }
  };
}
