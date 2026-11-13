const { test, expect } = require('../fixtures/customFixtures');
const html = require('../test-data/actionsPage');

// Checks the reusable actions and their red box against a small local page (no website needed).
test.describe('reusable actions', () => {
   test.beforeEach(async ({ page }) => {
      await page.setContent(html);
   });

   test('red box is drawn while the action runs and removed afterwards', async ({ page, actions }) => {
      const slow = { pause: 1000 };
      // starts the action, checks the box while it is paused on the element, then checks it is gone
      // (the drawn colour is checked, the width is read from the style that was set: on a scaled
      // display the browser rounds the drawn width to whole screen pixels, e.g. 3px becomes 2.4px)
      const expectBox = async (target, action, { color = 'rgb(255, 0, 0)', after = '' } = {}) => {
         const element = page.locator(target);
         const running = action();
         await expect(element).toHaveCSS('outline-color', color);
         expect(await element.evaluate(el => [getComputedStyle(el).outlineStyle, el.style.outlineWidth, el.style.outlineOffset]))
            .toEqual(['solid', '3px', '2px']);
         await running;
         expect(await element.evaluate(el => el.style.outline)).toBe(after);
      };

      await expectBox('#btn', () => actions.click('#btn', slow));
      await expect(page.locator('#btn')).toHaveText('clicked');
      await expectBox('#dbl', () => actions.doubleClick('#dbl', slow));
      await expect(page.locator('#dbl')).toHaveText('double clicked');
      await expectBox('#ctx', () => actions.rightClick('#ctx', slow));
      await expect(page.locator('#ctx')).toHaveText('right clicked');
      await expectBox('#hov', () => actions.hover('#hov', slow));
      await expect(page.locator('#hov')).toHaveText('hovered');

      await expectBox('#box', () => actions.fill('#box', 'play', slow));
      await expectBox('#box', () => actions.type('#box', 'wright', slow));
      await expectBox('#box', () => actions.press('#box', 'Enter', slow));
      await expect(page.locator('#box')).toHaveAttribute('data-submitted', 'playwright');
      await expectBox('#agree', () => actions.check('#agree', slow));
      await expect(page.locator('#agree')).toBeChecked();
      await expectBox('#agree', () => actions.uncheck('#agree', slow));
      await expect(page.locator('#agree')).not.toBeChecked();
      await expectBox('#fruit', () => actions.select('#fruit', 'Mango', slow));
      await expect(page.locator('#fruit')).toHaveValue('Mango');

      // drag and drop draws the box on both the dragged element and the drop target
      const drag = actions.dragTo('#drag', '#drop', slow);
      await expect(page.locator('#drag')).toHaveCSS('outline-color', 'rgb(255, 0, 0)');
      await expect(page.locator('#drop')).toHaveCSS('outline-color', 'rgb(255, 0, 0)');
      await drag;
      await expect(page.locator('#drop')).toHaveText('dropped');
      await expect(page.locator('#drag')).toHaveCSS('outline-style', 'none');
      await expect(page.locator('#drop')).toHaveCSS('outline-style', 'none');
      await expect(page.locator('#btn')).toHaveCSS('outline-style', 'none');

      // the colour can be changed per action
      await expectBox('#fruit', () => actions.select('#fruit', 'Banana', { ...slow, color: 'blue' }), { color: 'rgb(0, 0, 255)' });
      await expectBox('#agree', () => actions.check('#agree', { ...slow, color: 'green' }), { color: 'rgb(0, 128, 0)' });
      await expectBox('#hov', () => actions.hover('#hov', { ...slow, color: 'orange' }), { color: 'rgb(255, 165, 0)' });

      // an element that has its own outline gets it back afterwards
      await expectBox('#outlined', () => actions.click('#outlined', slow), { after: 'blue dashed 2px' });
      await expect(page.locator('#outlined')).toHaveText('still outlined');
      await expect(page.locator('#outlined')).toHaveCSS('outline-color', 'rgb(0, 0, 255)');
      await expect(page.locator('#outlined')).toHaveCSS('outline-style', 'dashed');
   });

   test('mouse actions', async ({ page, actions }) => {
      const counter = page.locator('#counter');
      const cards = column => page.locator(`#${column} .card`);

      // click, double click and right click on a counter with its own context menu
      for (let i = 1; i <= 5; i++) {
         await actions.click(counter);
         await expect(counter).toHaveText(`Count: ${i}`);
      }
      await actions.doubleClick(counter);
      await expect(counter).toHaveText('Count: 0');
      await actions.click(counter);
      await actions.rightClick(counter);
      await expect(page.locator('#menu')).toBeVisible();
      await actions.click('#add10');
      await expect(counter).toHaveText('Count: 11');
      await expect(page.locator('#menu')).toBeHidden();
      await actions.rightClick(counter);
      await actions.click('#resetCount');
      await expect(counter).toHaveText('Count: 0');

      // hover shows a description for every menu entry
      const tips = { Home: 'Start page', Shop: 'All products', Orders: 'Past orders', Profile: 'Your details', Help: 'Get support' };
      for (const [entry, tip] of Object.entries(tips)) {
         await actions.hover(page.locator('#nav li', { hasText: entry }));
         await expect(page.locator('#tip')).toHaveText(tip);
      }

      // drag and drop the cards across a task board
      await expect(cards('todo')).toHaveCount(4);
      for (const id of ['#card1', '#card2', '#card3']) await actions.dragTo(id, '#doing');
      await expect(cards('todo')).toHaveText(['Release']);
      await expect(cards('doing')).toHaveText(['Write tests', 'Review code', 'Fix bug']);
      await expect(page.locator('#doing .count')).toHaveText('3');
      for (const id of ['#card1', '#card2']) await actions.dragTo(id, '#done');
      await expect(cards('done')).toHaveText(['Write tests', 'Review code']);
      await actions.dragTo('#card3', '#todo');
      await expect(cards('todo')).toHaveText(['Release', 'Fix bug']);
      await expect(cards('doing')).toHaveCount(0);

      // double click marks a card as done, right click flags it
      for (const id of ['#card1', '#card2']) {
         await actions.doubleClick(id);
         await expect(page.locator(id)).toHaveClass(/done/);
      }
      await actions.doubleClick('#card2');
      await expect(page.locator('#card2')).not.toHaveClass(/done/);
      for (const id of ['#card3', '#card4']) {
         await actions.rightClick(id);
         await expect(page.locator(id)).toHaveClass(/flagged/);
      }
      await actions.rightClick('#card4');
      await expect(page.locator('#card4')).not.toHaveClass(/flagged/);

      // the rest of the board is finished one column at a time
      for (const id of ['#card3', '#card4']) await actions.dragTo(id, '#doing');
      await expect(cards('todo')).toHaveCount(0);
      await expect(page.locator('#todo .count')).toHaveText('0');
      for (const id of ['#card3', '#card4']) await actions.dragTo(id, '#done');
      await expect(cards('done')).toHaveText(['Write tests', 'Review code', 'Fix bug', 'Release']);
      await expect(page.locator('#done .count')).toHaveText('4');
   });

   test('form actions', async ({ page, actions }) => {
      const error = page.locator('#error');
      const summary = page.locator('#summary');
      const total = page.locator('#total');

      // the form reports one missing field at a time
      await actions.click('#submit');
      await expect(error).toHaveText('Name is required');
      await actions.fill('#name', 'Play');
      await actions.type('#name', 'wright');
      await actions.press('#name', 'Enter');
      await expect(error).toHaveText('Enter a valid email');
      await actions.fill('#email', 'not-an-email');
      await actions.press('#email', 'Enter');
      await expect(error).toHaveText('Enter a valid email');
      await actions.fill('#email', 'tester@example.com');
      await actions.press('#email', 'Enter');
      await expect(error).toHaveText('Choose a size');

      // dropdowns by value, label and index
      await actions.select('#size', 'm');
      await expect(page.locator('#size')).toHaveValue('m');
      await actions.select('#crust', { label: 'Stuffed' });
      await expect(page.locator('#crust')).toHaveValue('Stuffed');
      await actions.select('#crust', { index: 1 });
      await expect(page.locator('#crust')).toHaveValue('Classic');
      await actions.click('#submit');
      await expect(error).toHaveText('Choose a payment method');

      // checkboxes and radio buttons
      for (const topping of ['#cheese', '#olives', '#mushroom', '#corn']) {
         await actions.check(topping);
         await expect(page.locator(topping)).toBeChecked();
      }
      for (const topping of ['#olives', '#corn']) {
         await actions.uncheck(topping);
         await expect(page.locator(topping)).not.toBeChecked();
      }
      await actions.check('#cash');
      await actions.check('#upi');
      await expect(page.locator('#cash')).not.toBeChecked();
      await actions.click('#submit');
      await expect(error).toHaveText('Accept the terms');
      await actions.check('#terms');

      // keyboard: arrow keys change the quantity, text is typed key by key
      await actions.press('#qty', 'ArrowUp');
      await actions.press('#qty', 'ArrowUp');
      await actions.press('#qty', 'ArrowDown');
      await expect(page.locator('#qty')).toHaveValue('2');
      await actions.type('#notes', 'Ring the bell', { delay: 50 });
      await actions.click('#submit');
      await expect(error).toBeEmpty();
      await expect(summary).toHaveText('Playwright | 2 x Medium Classic | Cheese, Mushroom | UPI | Ring the bell');
      await expect(total).toHaveText('380');

      // the order can be changed and placed again
      await actions.select('#size', { label: 'Large' });
      await actions.fill('#qty', '3');
      await actions.uncheck('#mushroom');
      await actions.press('#name', 'Enter');
      await expect(summary).toContainText('3 x Large Classic | Cheese | UPI');
      await expect(total).toHaveText('660');

      await actions.click('#reset');
      await expect(page.locator('#name')).toBeEmpty();
      await expect(page.locator('#cheese')).not.toBeChecked();
      await expect(summary).toBeEmpty();
      await expect(total).toHaveText('0');
   });

   test('dialogs, texts and visibility', async ({ page, actions }) => {
      const result = page.locator('#result');
      const tasks = page.locator('#tasks li span');
      const task = name => page.locator('#tasks li', { hasText: name });

      // alert, confirm and prompt
      expect(await actions.clickAndHandleDialog('#alert')).toBe('Saved!');
      await expect(result).toHaveText('saved');
      expect(await actions.clickAndHandleDialog('#confirm')).toBe('Are you sure?');
      await expect(result).toHaveText('accepted');
      await actions.clickAndHandleDialog('#confirm', { accept: false });
      await expect(result).toHaveText('dismissed');
      expect(await actions.clickAndHandleDialog('#prompt', { promptText: 'Devin' })).toBe('Your name?');
      await expect(result).toHaveText('Hello Devin');
      await actions.clickAndHandleDialog('#prompt', { accept: false });
      await expect(result).toHaveText('cancelled');

      // texts of one element and of a list
      expect(await actions.getText('#hov')).toBe('Hover');
      expect(await actions.getTexts('#numbers li')).toEqual(['One', 'Two', 'Three']);
      expect(await actions.getTexts(tasks)).toEqual(['Buy milk', 'Call mom', 'Pay rent']);

      // a dialog decides whether a task is renamed or deleted
      expect(await actions.clickAndHandleDialog(task('Call mom').locator('.rename'), { promptText: 'Call dad' }))
         .toBe('New name for Call mom');
      await actions.clickAndHandleDialog(task('Pay rent').locator('.rename'), { accept: false });
      expect(await actions.getTexts(tasks)).toEqual(['Buy milk', 'Call dad', 'Pay rent']);
      expect(await actions.clickAndHandleDialog(task('Buy milk').locator('.delete'), { accept: false }))
         .toBe('Delete Buy milk?');
      await expect(tasks).toHaveCount(3);
      await actions.clickAndHandleDialog(task('Buy milk').locator('.delete'));
      expect(await actions.getTexts(tasks)).toEqual(['Call dad', 'Pay rent']);

      // isDisplayed waits for content that shows up late and reports what never shows up
      expect(await actions.isDisplayed('#btn')).toBe(true);
      expect(await actions.isDisplayed('#hidden', 500)).toBe(false);
      expect(await actions.isDisplayed('#loading', 500)).toBe(false);
      for (const batch of [1, 2, 3]) {
         await actions.click('#load');
         expect(await actions.isDisplayed('#loading')).toBe(true);
         expect(await actions.isDisplayed(task(`Task ${batch}b`))).toBe(true);
         await expect(page.locator('#loading')).toBeHidden();
      }
      expect(await actions.getTexts(tasks))
         .toEqual(['Call dad', 'Pay rent', 'Task 1a', 'Task 1b', 'Task 2a', 'Task 2b', 'Task 3a', 'Task 3b']);

      // a message that goes away by itself
      for (let i = 0; i < 2; i++) {
         await actions.click('#notify');
         expect(await actions.isDisplayed('#toast')).toBe(true);
         expect(await actions.getText('#toast')).toBe('Saved to drafts');
         await expect(page.locator('#toast')).toBeHidden();
         expect(await actions.isDisplayed('#toast', 500)).toBe(false);
      }

      // the loaded tasks can be renamed and deleted like the first ones
      await actions.clickAndHandleDialog(task('Task 1b').locator('.rename'), { promptText: 'Book tickets' });
      await actions.clickAndHandleDialog(task('Task 3a').locator('.rename'), { promptText: 'Water plants' });
      for (const name of ['Task 1a', 'Task 2a', 'Task 2b', 'Task 3b']) {
         expect(await actions.clickAndHandleDialog(task(name).locator('.delete'))).toBe(`Delete ${name}?`);
      }
      expect(await actions.getTexts(tasks)).toEqual(['Call dad', 'Pay rent', 'Book tickets', 'Water plants']);
   });
});
