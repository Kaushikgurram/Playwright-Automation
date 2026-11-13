// A small local page (no website needed) that reacts to every reusable action:
// a counter and a task board for the mouse, an order form, and dialogs / delayed content.
module.exports = `
<style>
   body { font-family: sans-serif; margin: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
   section { border: 1px solid #bbb; border-radius: 6px; padding: 10px; }
   h3 { margin: 0 0 8px; }
   label { margin-right: 10px; }
   input, select, textarea, button { margin: 4px 0; }
   #nav li { display: inline-block; padding: 4px 10px; background: #eee; margin-right: 4px; }
   #menu { display: none; position: absolute; background: #fff; border: 1px solid #333; padding: 4px; }
   #menu button { display: block; width: 100%; }
   .column { display: inline-block; vertical-align: top; width: 150px; min-height: 150px; border: 1px dashed #666; padding: 6px; }
   .card { background: #e7f0ff; padding: 6px; margin: 4px 0; cursor: grab; }
   .card.done { text-decoration: line-through; }
   .card.flagged { background: #ffd9d9; }
   #error { color: #c00; }
   #toast, #loading { display: none; }
</style>

<section id="mouse">
   <h3>Mouse</h3>
   <button id="counter">Count: 0</button>
   <div id="menu"><button id="add10">Add 10</button><button id="resetCount">Reset</button></div>
   <ul id="nav">
      <li data-tip="Start page">Home</li><li data-tip="All products">Shop</li><li data-tip="Past orders">Orders</li>
      <li data-tip="Your details">Profile</li><li data-tip="Get support">Help</li>
   </ul>
   <p id="tip">Hover a menu entry</p>
   <div id="board">
      <div class="column" id="todo"><b>To do (<span class="count"></span>)</b>
         <div class="card" id="card1" draggable="true">Write tests</div>
         <div class="card" id="card2" draggable="true">Review code</div>
         <div class="card" id="card3" draggable="true">Fix bug</div>
         <div class="card" id="card4" draggable="true">Release</div>
      </div>
      <div class="column" id="doing"><b>Doing (<span class="count"></span>)</b></div>
      <div class="column" id="done"><b>Done (<span class="count"></span>)</b></div>
   </div>
</section>

<section>
   <h3>Order form</h3>
   <form id="order" novalidate>
      <input id="name" placeholder="Full name"> <input id="email" placeholder="Email">
      <input id="qty" type="number" value="1" min="1" max="9" style="width: 50px"><br>
      <select id="size"><option value="">Choose size</option><option value="s">Small</option><option value="m">Medium</option><option value="l">Large</option></select>
      <select id="crust"><option>Thin</option><option>Classic</option><option>Stuffed</option></select><br>
      <label><input type="checkbox" name="topping" id="cheese" value="Cheese">Cheese</label>
      <label><input type="checkbox" name="topping" id="olives" value="Olives">Olives</label>
      <label><input type="checkbox" name="topping" id="mushroom" value="Mushroom">Mushroom</label>
      <label><input type="checkbox" name="topping" id="corn" value="Corn">Corn</label><br>
      <label><input type="radio" name="pay" id="card" value="Card">Card</label>
      <label><input type="radio" name="pay" id="cash" value="Cash">Cash</label>
      <label><input type="radio" name="pay" id="upi" value="UPI">UPI</label><br>
      <textarea id="notes" placeholder="Notes" rows="2" cols="40"></textarea><br>
      <label><input type="checkbox" id="terms">I accept the terms</label><br>
      <button id="submit" type="submit">Place order</button> <button id="reset" type="reset">Reset</button>
      <p id="error"></p>
      <p id="summary"></p>
      <p>Total: <span id="total">0</span></p>
   </form>
</section>

<section>
   <h3>Dialogs</h3>
   <button id="alert">Save</button> <button id="confirm">Confirm</button> <button id="prompt">Greet</button>
   <p id="result">nothing yet</p>
   <ul id="tasks"></ul>
   <button id="load">Load more</button> <span id="loading">Loading...</span>
   <button id="notify">Notify</button> <span id="toast">Saved to drafts</span>
   <p id="hidden" style="display: none">hidden</p>
</section>

<section>
   <h3>Red box</h3>
   <button id="btn">Click</button> <button id="dbl">Double</button> <button id="ctx">Right</button> <button id="hov">Hover</button>
   <button id="outlined" style="outline: 2px dashed blue">Outlined</button><br>
   <input id="box" placeholder="Text"> <label><input id="agree" type="checkbox">Agree</label>
   <select id="fruit"><option>Apple</option><option>Mango</option><option>Banana</option></select>
   <div id="drag" draggable="true" style="width: 60px; height: 30px; background: #ccc">drag</div>
   <div id="drop" style="width: 120px; height: 50px; border: 1px dashed #000">drop here</div>
   <ul id="numbers"><li>One</li><li> Two </li><li>Three</li></ul>
</section>

<script>
   const $ = selector => document.querySelector(selector);

   // mouse: counter with its own right-click menu
   let count = 0;
   const showCount = () => { $('#counter').textContent = 'Count: ' + count; $('#menu').style.display = 'none'; };
   $('#counter').onclick = () => { count++; showCount(); };
   $('#counter').ondblclick = () => { count = 0; showCount(); };
   $('#counter').oncontextmenu = event => {
      event.preventDefault();
      Object.assign($('#menu').style, { display: 'block', left: event.pageX + 20 + 'px', top: event.pageY + 'px' });
   };
   $('#add10').onclick = () => { count += 10; showCount(); };
   $('#resetCount').onclick = () => { count = 0; showCount(); };
   for (const entry of document.querySelectorAll('#nav li')) {
      entry.onmouseover = () => { $('#tip').textContent = entry.dataset.tip; };
   }

   // mouse: task board with drag and drop
   let dragged;
   const showCounts = () => {
      for (const column of document.querySelectorAll('.column')) {
         column.querySelector('.count').textContent = column.querySelectorAll('.card').length;
      }
   };
   for (const card of document.querySelectorAll('.card')) {
      card.ondragstart = () => { dragged = card; };
      card.ondblclick = () => card.classList.toggle('done');
      card.oncontextmenu = event => { event.preventDefault(); card.classList.toggle('flagged'); };
   }
   for (const column of document.querySelectorAll('.column')) {
      column.ondragover = event => event.preventDefault();
      column.ondrop = event => { event.preventDefault(); column.append(dragged); showCounts(); };
   }
   showCounts();

   // order form
   const prices = { s: 100, m: 150, l: 200 };
   $('#order').onsubmit = event => {
      event.preventDefault();
      const toppings = [...document.querySelectorAll('[name=topping]:checked')].map(box => box.value);
      const pay = $('[name=pay]:checked');
      const error =
         !$('#name').value.trim() ? 'Name is required' :
         !/^\\S+@\\S+\\.\\S+$/.test($('#email').value) ? 'Enter a valid email' :
         !$('#size').value ? 'Choose a size' :
         !pay ? 'Choose a payment method' :
         !$('#terms').checked ? 'Accept the terms' : '';
      $('#error').textContent = error;
      if (error) { $('#summary').textContent = ''; $('#total').textContent = '0'; return; }
      const size = $('#size').selectedOptions[0].text;
      $('#summary').textContent = [
         $('#name').value.trim(), $('#qty').value + ' x ' + size + ' ' + $('#crust').value,
         toppings.join(', ') || 'no toppings', pay.value, $('#notes').value || 'no notes'
      ].join(' | ');
      $('#total').textContent = $('#qty').value * (prices[$('#size').value] + 20 * toppings.length);
   };
   $('#order').onreset = () => { $('#error').textContent = ''; $('#summary').textContent = ''; $('#total').textContent = '0'; };

   // dialogs and delayed content
   $('#alert').onclick = () => { alert('Saved!'); $('#result').textContent = 'saved'; };
   $('#confirm').onclick = () => { $('#result').textContent = confirm('Are you sure?') ? 'accepted' : 'dismissed'; };
   $('#prompt').onclick = () => {
      const name = prompt('Your name?');
      $('#result').textContent = name === null ? 'cancelled' : 'Hello ' + name;
   };
   const addTask = text => {
      const task = document.createElement('li');
      task.innerHTML = '<span></span> <button class="rename">Rename</button> <button class="delete">Delete</button>';
      const label = task.querySelector('span');
      label.textContent = text;
      task.querySelector('.rename').onclick = () => {
         const renamed = prompt('New name for ' + label.textContent);
         if (renamed) label.textContent = renamed;
      };
      task.querySelector('.delete').onclick = () => { if (confirm('Delete ' + label.textContent + '?')) task.remove(); };
      $('#tasks').append(task);
   };
   ['Buy milk', 'Call mom', 'Pay rent'].forEach(addTask);
   let batch = 0;
   $('#load').onclick = () => {
      $('#loading').style.display = 'inline';
      setTimeout(() => {
         batch++;
         addTask('Task ' + batch + 'a'); addTask('Task ' + batch + 'b');
         $('#loading').style.display = 'none';
      }, 800);
   };
   $('#notify').onclick = () => {
      $('#toast').style.display = 'inline';
      setTimeout(() => { $('#toast').style.display = 'none'; }, 1500);
   };

   // red box
   $('#btn').onclick = () => { $('#btn').textContent = 'clicked'; };
   $('#dbl').ondblclick = () => { $('#dbl').textContent = 'double clicked'; };
   $('#ctx').oncontextmenu = event => { event.preventDefault(); $('#ctx').textContent = 'right clicked'; };
   $('#hov').onmouseover = () => { $('#hov').textContent = 'hovered'; };
   $('#outlined').onclick = () => { $('#outlined').textContent = 'still outlined'; };
   $('#box').onkeydown = event => { if (event.key === 'Enter') $('#box').dataset.submitted = $('#box').value; };
   $('#drop').ondragover = event => event.preventDefault();
   $('#drop').ondrop = () => { $('#drop').textContent = 'dropped'; };
</script>`;
