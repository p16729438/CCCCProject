let id = 0;

let a = 0;
let b = 0;

let recipe = "0";

const socket = new WebSocket("wss://" + window.location.hostname);

socket.addEventListener("message", (ev) => {
  if (ev.data.startsWith("end")) {
    document.querySelector("#calculate").remove();
    document.querySelector("#n").textContent = ev.data.split(";")[1].replace("n", "");
    document.querySelector("#info").removeAttribute("hidden");
  } else {
    id = parseInt(ev.data.split(";")[0]);
    a = parseInt(ev.data.split(";")[1]);
    b = parseInt(ev.data.split(";")[2]);
    recipe = ev.data.split(";")[3];

    document.querySelector("#counterexample").remove();
    document.querySelector("#a").textContent = a;
    document.querySelector("#b").textContent = b;
    document.querySelector("#info").removeAttribute("hidden");
  }
});

socket.addEventListener("error", (ev) => {
  id = 0;
  a = 0;
  b = 0;
  p = 0n;
  q = 0n;
  recipe = "0";
});

socket.addEventListener("close", (ev) => {
  id = 0;
  a = 0;
  b = 0;
  p = 0n;
  q = 0n;
  recipe = "0";
});

const limit = 1000;
let count = 0;

let p = 1n;
let q = 1n;

let powerNumbers = [];

setTimeout(init, 1000);

/**
 * @returns void
 */
function init() {
  powerNumbers = [];
  p = 1n;
  q = 1n;

  for (let i = 0; i < a; i++) {
    powerNumbers.push(p);
    p *= 2n;
  }

  for (i = 0; i < b; i++) {
    q *= 3n;
  }

  if (id != 0n) {
    calculate();
  } else {
    window.location.reload();
  }
}

/**
 * @returns void
 */
function calculate() {
  if (recipe != null) {
    if (count == limit) {
      check(recipe);
      count = 0;
      nextRecipe();
      setTimeout(calculate, 1);
    } else {
      check(recipe);
      count++;
      nextRecipe();
      calculate();
    }
  } else {
    socket.send(id + ";end");
    window.location.reload();
  }
}

/**
 * @returns void
 */
function nextRecipe() {
  if (recipe.startsWith("1")) {
    if (recipe.endsWith("0")) {
      recipe = recipe.substring(0, recipe.lastIndexOf("1") + 1) + "1" + recipe.substring(recipe.lastIndexOf("1") + 2);
      recipe = recipe.substring(0, recipe.lastIndexOf("1") - 1) + "0" + recipe.substring(recipe.lastIndexOf("1"));
    } else if (recipe.endsWith("1")) {
      let i = 0;
      while (recipe[recipe.length - i - 1] == 1) {
        i++;
      }
      recipe = recipe.substring(0, recipe.length - i) + "0".repeat(i);
      recipe = recipe.substring(0, recipe.lastIndexOf("1") + 1) + "1" + recipe.substring(recipe.lastIndexOf("1") + 2);
      recipe = recipe.substring(0, recipe.lastIndexOf("1") - 1) + "0" + recipe.substring(recipe.lastIndexOf("1"));
      recipe = recipe.substring(0, recipe.lastIndexOf("1") + 1) + "1".repeat(i) + recipe.substring(recipe.lastIndexOf("1") + i + 1);
    } else {
      recipe = null;
    }
  } else {
    recipe = null;
  }
}

/**
 * @returns void
 */
function check() {
  const k = getK(recipe);

  document.querySelector("#recipe").textContent = recipe;
  document.querySelector("#k").textContent = k;

  if (k != 0n && hasN(k)) {
    const n = k / (p - q);
    if (n != 1n) {
      socket.send(id + ";" + recipe + ";" + n);
    }
  } else if (count == limit) {
    socket.send(id + ";" + recipe);
  }
}

/**
 * @param {bigint} k
 * @returns boolean
 */
function hasN(k) {
  return k % (p - q) === 0n;
}

/**
 * @returns bigint
 */
function getK() {
  let k = 0n;
  for (let i = 0; i < recipe.length; i++) {
    if (recipe[i] == 1) {
      k = k * 3n + powerNumbers[i];
    }
  }
  return k;
}
