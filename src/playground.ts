import './index.js';

const fruits = [
  { value: 'apple', label: 'Apple', group: 'Fruit', description: 'Crisp and sweet' },
  { value: 'banana', label: 'Banana', group: 'Fruit' },
  { value: 'cherry', label: 'Cherry', group: 'Fruit', disabled: true },
  { value: 'mango', label: 'Mango', group: 'Fruit' },
  { value: 'carrot', label: 'Carrot', group: 'Vegetable' },
  { value: 'spinach', label: 'Spinach', group: 'Vegetable' },
  { value: 'pepper', label: 'Bell pepper', group: 'Vegetable' },
];

const el = document.querySelector('ms-multiselect');
if (el) {
  el.options = fruits;
  el.addEventListener('change', (event) => {
    const output = document.querySelector('#output');
    if (output) {
      output.textContent = JSON.stringify((event as CustomEvent).detail.value);
    }
  });
}
