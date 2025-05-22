const testUrl = 'http://localhost:4000';

// Константы для селекторов
const modalIngredientSelector = '[data-cy="modal_ingredient"]';
const bun0Selector = '[data-cy="bun_0"]';
const ingredientModalSelector = '[data-cy="ingredient_modal"] > .text_type_main-medium';
const modalOverlaySelector = '[data-cy="modal_overlay"]';
const btnCloseModalSelector = '[data-cy="btn_close_modal"]';

describe('Проверяем доступность приложения', () => {
  it('сервис должен быть доступен по адресу localhost:4000', () => {
    cy.visit(testUrl);
  });
});

beforeEach(() => {
  window.localStorage.setItem('refreshToken', 'testRefreshToken');
  cy.setCookie('accessToken', 'testAccessToken');

  cy.intercept('GET', 'api/ingredients', {
    fixture: 'ingredients'
  }).as('getIngredients');

  cy.intercept('GET', 'api/auth/user', {
    fixture: 'user'
  }).as('getUser');

  cy.visit(testUrl);
  cy.wait('@getIngredients');
  cy.wait('@getUser');
});

afterEach('Очистка localStorege и Cookies', () => {
  cy.clearAllLocalStorage();
  cy.clearAllCookies();
});

describe('Проверка работоспособности страницы - ConstructorPage', () => {
  it('Проверка добавления ингредиентов в конструктор', () => {
    cy.get('[data-cy="bun_constructor_item_up_clear"]').should('exist');
    cy.get('[data-cy="bun_constructor_item_down_clear"]').should('exist');
    cy.get('[data-cy="ingredient_constructor_item"]').should('not.exist');

    cy.get(bun0Selector).should('exist');
    cy.get(`${bun0Selector} > .common_button`).should('exist').click();

    cy.get('[data-cy="ingredient_0"]').should('exist');
    cy.get(':nth-child(4) > [data-cy="ingredient_0"] > .common_button')
      .should('exist')
      .click();
    cy.get('[data-cy="bun_constructor_item_up"]').should('exist');
    cy.get('[data-cy="bun_constructor_item_down"]').should('exist');
    cy.get('[data-cy="ingredient_constructor_item"]').should('exist');
  });

  it('Проверка открытия и закрытия модального окна одного ингредиента - через оверлей', () => {
    const ingredientName = 'Краторная булка N-200i';

    cy.get(modalIngredientSelector).should('not.exist');
    cy.get(bun0Selector).should('exist').click();
    cy.get(modalIngredientSelector).should('be.visible');
    cy.get(ingredientModalSelector).should('contain.text', ingredientName);
    cy.get(modalOverlaySelector).should('exist');
    cy.get(modalOverlaySelector).click({ force: true });
    cy.get(modalIngredientSelector).should('not.exist');
    cy.get(modalOverlaySelector).should('not.exist');
  });

  it('Проверка открытия и закрытия модального окна одного ингредиента - через кнопку закрытия', () => {
    const ingredientName = 'Краторная булка N-200i';

    cy.get(modalIngredientSelector).should('not.exist');
    cy.get(bun0Selector).should('exist').click();
    cy.get(modalIngredientSelector).should('be.visible');
    cy.get(ingredientModalSelector).should('contain.text', ingredientName);
    cy.get(btnCloseModalSelector).click();
    cy.get(modalIngredientSelector).should('not.exist');
  });

  it('Проверка полного цикла заказа товара', () => {
    cy.get('[data-cy="bun_constructor_item_up_clear"]').should('exist');
    cy.get('[data-cy="bun_constructor_item_down_clear"]').should('exist');
    cy.get('[data-cy="ingredient_constructor_item"]').should('not.exist');

    cy.get(bun0Selector).should('exist');
    cy.get(`${bun0Selector} > .common_button`).should('exist').click();
    cy.get('[data-cy="ingredient_0"]').should('exist');
    cy.get(':nth-child(4) > [data-cy="ingredient_0"] > .common_button')
      .should('exist')
      .click();

    cy.intercept('POST', 'api/orders', {
      fixture: 'newOrder'
    }).as('newOrder');

    cy.get('[data-cy="new_order_btn"]').click();
    cy.wait('@newOrder');
    cy.fixture('newOrder').then((newOrder) => {
      cy.get('[data-cy="new_order_number"]').contains(newOrder.order.number);
    });

    cy.wait(1000);

    cy.get('[data-cy="bun_constructor_item_up_clear"]').should('exist');
    cy.get('[data-cy="bun_constructor_item_down_clear"]').should('exist');
    cy.get('[data-cy="ingredient_constructor_item"]').should('not.exist');
    cy.get(btnCloseModalSelector).should('exist').click();
  });
});
